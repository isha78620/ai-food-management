import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  PackageCheck,
  Boxes,
  Utensils,
  RefreshCw,
  Brain,
  Lightbulb,
} from "lucide-react";

import api from "../services/api";

interface DashboardData {
  totalOrders: number;
  placedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalDeliveries: number;
  deliveredOrders: number;
  totalInventoryItems: number;
  totalIngredients: number;
}

interface Recommendation {
  type: string;
  category: string;
  message: string;
  suggestion: string;
}

interface AIRecommendationData {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
  recommendationCount: number;
  recommendations: Recommendation[];
}

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiData, setAiData] = useState<AIRecommendationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, aiResponse] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/ai/business-recommendations"),
      ]);

      console.log("Dashboard API Response:", dashboardResponse.data);
      console.log("AI Recommendation Response:", aiResponse.data);

      setDashboard(dashboardResponse.data);
      setAiData(aiResponse.data);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      icon: ShoppingBag,
      className: "dashboard-card-blue",
    },
    {
      title: "Placed Orders",
      value: dashboard?.placedOrders ?? 0,
      icon: Clock,
      className: "dashboard-card-orange",
    },
    {
      title: "Completed Orders",
      value: dashboard?.completedOrders ?? 0,
      icon: CheckCircle,
      className: "dashboard-card-green",
    },
    {
      title: "Cancelled Orders",
      value: dashboard?.cancelledOrders ?? 0,
      icon: XCircle,
      className: "dashboard-card-red",
    },
    {
      title: "Total Deliveries",
      value: dashboard?.totalDeliveries ?? 0,
      icon: Truck,
      className: "dashboard-card-purple",
    },
    {
      title: "Delivered Orders",
      value: dashboard?.deliveredOrders ?? 0,
      icon: PackageCheck,
      className: "dashboard-card-teal",
    },
    {
      title: "Inventory Items",
      value: dashboard?.totalInventoryItems ?? 0,
      icon: Boxes,
      className: "dashboard-card-indigo",
    },
    {
      title: "Ingredients",
      value: dashboard?.totalIngredients ?? 0,
      icon: Utensils,
      className: "dashboard-card-yellow",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Welcome back 👋</p>

          <h1>Admin Dashboard</h1>

          <p className="dashboard-subtitle">
            Overview of your AI Food Management System
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && <div className="dashboard-error">{error}</div>}

      {/* Loading */}
      {loading && !dashboard ? (
        <div className="dashboard-loading">
          <RefreshCw size={30} className="spin" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="dashboard-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  className={`dashboard-stat-card ${card.className}`}
                  key={card.title}
                >
                  <div className="stat-card-top">
                    <div className="stat-icon">
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="stat-content">
                    <p>{card.title}</p>

                    <h2>{card.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="dashboard-summary">
            <div className="summary-header">
              <div>
                <h2>Order Summary</h2>
                <p>Current order status overview</p>
              </div>
            </div>

            <div className="summary-list">
              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot placed"></span>
                  <span>Placed Orders</span>
                </div>

                <strong>{dashboard?.placedOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot completed"></span>
                  <span>Completed Orders</span>
                </div>

                <strong>{dashboard?.completedOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot cancelled"></span>
                  <span>Cancelled Orders</span>
                </div>

                <strong>{dashboard?.cancelledOrders ?? 0}</strong>
              </div>

              <div className="summary-item">
                <div className="summary-left">
                  <span className="summary-dot delivery"></span>
                  <span>Delivered Orders</span>
                </div>

                <strong>{dashboard?.deliveredOrders ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* AI Business Recommendations */}
          <div className="dashboard-ai-section">
            <div className="dashboard-ai-header">
              <div className="dashboard-ai-title">
                <div className="dashboard-ai-icon">
                  <Brain size={24} />
                </div>

                <div>
                  <h2>AI Business Insights</h2>

                  <p>
                    Smart recommendations based on your current business data
                  </p>
                </div>
              </div>

              <span className="ai-count">
                {aiData?.recommendationCount ?? 0} Insights
              </span>
            </div>

            {aiData?.recommendations &&
            aiData.recommendations.length > 0 ? (
              <div className="ai-recommendation-list">
                {aiData.recommendations.map((recommendation, index) => (
                  <div
                    className="ai-recommendation-card"
                    key={`${recommendation.category}-${index}`}
                  >
                    <div className="ai-recommendation-icon">
                      <Lightbulb size={20} />
                    </div>

                    <div className="ai-recommendation-content">
                      <span className="ai-category">
                        {recommendation.category}
                      </span>

                      <h3>{recommendation.message}</h3>

                      <p>{recommendation.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ai-empty-state">
                <Brain size={28} />

                <p>No AI recommendations available right now.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;