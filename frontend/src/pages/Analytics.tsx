import { useEffect, useState } from "react";
import api from "../services/api";

interface Summary {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

interface DailySale {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

interface PopularFood {
  foodName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface DeliverySummary {
  totalDeliveries: number;
  assigned: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
}

interface PeakTime {
  hour: number;
  totalOrders: number;
}

interface MonthlySale {
  year: number;
  month: number;
  totalOrders: number;
  totalRevenue: number;
}

function Analytics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [popularFoods, setPopularFoods] = useState<PopularFood[]>([]);
  const [delivery, setDelivery] = useState<DeliverySummary | null>(null);
  const [peakTimes, setPeakTimes] = useState<PeakTime[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryRes,
        dailyRes,
        popularRes,
        deliveryRes,
        peakRes,
        monthlyRes,
      ] = await Promise.all([
        api.get("/api/admin/analytics/summary"),
        api.get("/api/admin/analytics/daily-sales"),
        api.get("/api/admin/analytics/popular-foods"),
        api.get("/api/admin/analytics/delivery-summary"),
        api.get("/api/admin/analytics/peak-order-time"),
        api.get("/api/admin/analytics/monthly-sales"),
      ]);

      setSummary(summaryRes.data);
      setDailySales(dailyRes.data);
      setPopularFoods(popularRes.data);
      setDelivery(deliveryRes.data);
      setPeakTimes(peakRes.data);
      setMonthlySales(monthlyRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString("en-IN")}`;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${suffix}`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <h3>Loading Analytics...</h3>
          <p>Preparing your business insights</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div className="error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={loadAnalytics}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">BUSINESS INSIGHTS</span>

          <h1>
            Analytics <span>✦</span>
          </h1>

          <p>
            Understand your restaurant performance, sales trends and delivery
            activity.
          </p>
        </div>

        <button
          className="analytics-refresh"
          onClick={loadAnalytics}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="analytics-summary-grid">

          <div className="analytics-card summary-card">
            <div className="summary-icon orders-icon">▦</div>
            <div>
              <span>Total Orders</span>
              <strong>{summary.totalOrders}</strong>
            </div>
          </div>

          <div className="analytics-card summary-card">
            <div className="summary-icon revenue-icon">₹</div>
            <div>
              <span>Total Revenue</span>
              <strong>{formatMoney(summary.totalRevenue)}</strong>
            </div>
          </div>

          <div className="analytics-card summary-card">
            <div className="summary-icon completed-icon">✓</div>
            <div>
              <span>Completed</span>
              <strong>{summary.completedOrders}</strong>
            </div>
          </div>

          <div className="analytics-card summary-card">
            <div className="summary-icon delivery-icon">▣</div>
            <div>
              <span>Total Deliveries</span>
              <strong>
                {delivery?.totalDeliveries ?? 0}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* TODAY */}
      {summary && (
        <section className="analytics-section">

          <div className="section-heading">
            <div>
              <span className="section-label">TODAY'S PERFORMANCE</span>
              <h2>Today's Business</h2>
            </div>
          </div>

          <div className="today-grid">

            <div className="analytics-card today-card">
              <span>Orders</span>
              <strong>{summary.todayOrders}</strong>
              <small>Orders placed today</small>
            </div>

            <div className="analytics-card today-card">
              <span>Revenue</span>
              <strong>{formatMoney(summary.todayRevenue)}</strong>
              <small>Revenue generated today</small>
            </div>

            <div className="analytics-card today-card">
              <span>Completed Orders</span>
              <strong>{summary.completedOrders}</strong>
              <small>Successfully completed</small>
            </div>

          </div>
        </section>
      )}

      {/* SALES TREND */}
      <section className="analytics-section">

        <div className="section-heading">
          <div>
            <span className="section-label">SALES TREND</span>
            <h2>Daily Sales</h2>
          </div>
        </div>

        <div className="analytics-card table-card">

          {dailySales.length === 0 ? (
            <div className="empty-state">
              No daily sales data available.
            </div>
          ) : (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {dailySales.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDate(item.date)}</td>
                      <td>
                        <span className="number-badge">
                          {item.totalOrders}
                        </span>
                      </td>
                      <td className="money">
                        {formatMoney(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </section>

      {/* TWO COLUMN */}
      <div className="analytics-two-column">

        {/* POPULAR FOODS */}
        <section className="analytics-section">

          <div className="section-heading">
            <div>
              <span className="section-label">TOP PERFORMERS</span>
              <h2>Popular Foods</h2>
            </div>
          </div>

          <div className="analytics-card food-list">

            {popularFoods.length === 0 ? (
              <div className="empty-state">
                No popular food data available.
              </div>
            ) : (
              popularFoods.map((food, index) => (
                <div className="food-row" key={index}>

                  <div className="food-rank">
                    #{index + 1}
                  </div>

                  <div className="food-info">
                    <strong>{food.foodName}</strong>
                    <span>
                      {food.totalQuantity} items sold
                    </span>
                  </div>

                  <strong className="food-revenue">
                    {formatMoney(food.totalRevenue)}
                  </strong>

                </div>
              ))
            )}

          </div>
        </section>

        {/* DELIVERY */}
        <section className="analytics-section">

          <div className="section-heading">
            <div>
              <span className="section-label">DELIVERY ACTIVITY</span>
              <h2>Delivery Summary</h2>
            </div>
          </div>

          {delivery && (
            <div className="analytics-card delivery-card">

              <div className="delivery-total">
                <span>Total Deliveries</span>
                <strong>{delivery.totalDeliveries}</strong>
              </div>

              <div className="delivery-status">
                <div>
                  <span>Assigned</span>
                  <strong>{delivery.assigned}</strong>
                </div>

                <div>
                  <span>Picked Up</span>
                  <strong>{delivery.pickedUp}</strong>
                </div>

                <div>
                  <span>Out for Delivery</span>
                  <strong>{delivery.outForDelivery}</strong>
                </div>

                <div>
                  <span>Delivered</span>
                  <strong>{delivery.delivered}</strong>
                </div>
              </div>

            </div>
          )}

        </section>

      </div>

      {/* PEAK TIME */}
      <section className="analytics-section">

        <div className="section-heading">
          <div>
            <span className="section-label">BUSINESS TIMING</span>
            <h2>Peak Order Time</h2>
          </div>
        </div>

        <div className="analytics-card peak-card">

          {peakTimes.map((item, index) => (
            <div className="peak-row" key={index}>

              <div className="peak-time">
                <strong>{formatHour(item.hour)}</strong>
                <span>Peak period</span>
              </div>

              <div className="peak-bar-container">
                <div
                  className="peak-bar"
                  style={{
                    width: `${
                      (item.totalOrders /
                        Math.max(
                          ...peakTimes.map((p) => p.totalOrders),
                          1
                        )) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <strong className="peak-orders">
                {item.totalOrders} orders
              </strong>

            </div>
          ))}

        </div>
      </section>

      {/* MONTHLY SALES */}
      <section className="analytics-section">

        <div className="section-heading">
          <div>
            <span className="section-label">MONTHLY PERFORMANCE</span>
            <h2>Monthly Sales</h2>
          </div>
        </div>

        <div className="analytics-card table-card">

          <div className="analytics-table-wrapper">
            <table className="analytics-table">

              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>
                {monthlySales.map((item, index) => (
                  <tr key={index}>

                    <td>
                      {new Date(
                        item.year,
                        item.month - 1
                      ).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      <span className="number-badge">
                        {item.totalOrders}
                      </span>
                    </td>

                    <td className="money">
                      {formatMoney(item.totalRevenue)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <div className="analytics-footer">
        <span className="status-dot"></span>
        Analytics data connected to your backend
      </div>

    </div>
  );
}

export default Analytics;