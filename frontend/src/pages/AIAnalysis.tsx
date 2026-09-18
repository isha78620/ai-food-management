import { useEffect, useState } from "react";
import api from "../services/api";

interface FoodDemand {
  foodName: string;
  totalSold: number;
  predictedDemand: number;
}

interface HourlyAnalysis {
  hour: number;
  timeRange: string;
  totalOrders: number;
}

interface Recommendation {
  type: string;
  category: string;
  message: string;
  suggestion: string;
}

interface SalesPrediction {
  message?: string;
  required?: number;
  available?: number;
}

interface FoodDemandResponse {
  predictionFor: string;
  foods: FoodDemand[];
}

interface PeakTimeResponse {
  predictionFor: string;
  peakTime: string;
  peakOrders: number;
  hourlyAnalysis: HourlyAnalysis[];
}

interface BusinessRecommendationResponse {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
  recommendationCount: number;
  recommendations: Recommendation[];
}

function AIAnalysis() {
  const [salesPrediction, setSalesPrediction] =
    useState<SalesPrediction | null>(null);

  const [foodDemand, setFoodDemand] =
    useState<FoodDemandResponse | null>(null);

  const [peakTime, setPeakTime] =
    useState<PeakTimeResponse | null>(null);

  const [businessRecommendations, setBusinessRecommendations] =
    useState<BusinessRecommendationResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAIData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        salesResponse,
        demandResponse,
        peakResponse,
        recommendationResponse,
      ] = await Promise.all([
        api.get("/api/ai/sales-prediction"),
        api.get("/api/ai/food-demand"),
        api.get("/api/ai/peak-time"),
        api.get("/api/ai/business-recommendations"),
      ]);

      setSalesPrediction(salesResponse.data);
      setFoodDemand(demandResponse.data);
      setPeakTime(peakResponse.data);
      setBusinessRecommendations(recommendationResponse.data);
    } catch (err) {
      console.error("AI Analysis error:", err);
      setError("Unable to load AI analysis data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, []);

  if (loading) {
    return (
      <div className="ai-analysis-page">
        <div className="ai-loading">
          <div className="ai-loader"></div>
          <h2>Analyzing your food business...</h2>
          <p>AI insights are being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-page">

      {/* Header */}
      <div className="ai-page-header">
        <div>
          <span className="ai-label">AI FOOD INTELLIGENCE</span>

          <h1>
            AI Analysis
            <span className="ai-sparkle">✦</span>
          </h1>

          <p>
            Smart insights to help you understand demand, peak hours and
            business performance.
          </p>
        </div>

        <button className="ai-refresh-btn" onClick={loadAIData}>
          ↻ Refresh Analysis
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {/* Overview Cards */}
      {businessRecommendations && (
        <div className="ai-stats-grid">

          <div className="ai-stat-card">
            <div className="ai-stat-icon">🛒</div>
            <div>
              <span>Total Orders</span>
              <strong>{businessRecommendations.totalOrders}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">✓</div>
            <div>
              <span>Completed Orders</span>
              <strong>{businessRecommendations.completedOrders}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">✕</div>
            <div>
              <span>Cancelled Orders</span>
              <strong>{businessRecommendations.cancelledOrders}</strong>
            </div>
          </div>

          <div className="ai-stat-card">
            <div className="ai-stat-icon">💡</div>
            <div>
              <span>AI Recommendations</span>
              <strong>
                {businessRecommendations.recommendationCount}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* Main AI Grid */}
      <div className="ai-main-grid">

        {/* Sales Prediction */}
        <div className="ai-card sales-card">

          <div className="ai-card-header">
            <div>
              <span className="ai-card-label">PREDICTION</span>
              <h2>Sales Prediction</h2>
            </div>

            <div className="ai-card-icon">📈</div>
          </div>

          {salesPrediction?.message ? (
            <div className="prediction-warning">
              <div className="warning-icon">!</div>

              <div>
                <h3>Prediction not available yet</h3>

                <p>{salesPrediction.message}</p>

                <div className="prediction-requirement">
                  <span>
                    Required orders:
                    <strong>{salesPrediction.required}</strong>
                  </span>

                  <span>
                    Available:
                    <strong>{salesPrediction.available}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="prediction-success">
              Sales prediction is available.
            </div>
          )}

        </div>

        {/* Peak Time */}
        <div className="ai-card peak-card">

          <div className="ai-card-header">
            <div>
              <span className="ai-card-label">AI FORECAST</span>
              <h2>Peak Time</h2>
            </div>

            <div className="ai-card-icon">⏰</div>
          </div>

          {peakTime && (
            <>
              <div className="peak-highlight">
                <span>Predicted busiest period</span>
                <strong>{peakTime.peakTime}</strong>
                <small>
                  {peakTime.peakOrders} order
                  {peakTime.peakOrders !== 1 ? "s" : ""}
                </small>
              </div>

              <div className="hourly-analysis">
                {peakTime.hourlyAnalysis.map((item) => (
                  <div className="hour-row" key={item.hour}>
                    <span>{item.timeRange}</span>

                    <div className="hour-bar-container">
                      <div
                        className="hour-bar"
                        style={{
                          width: `${Math.max(
                            item.totalOrders === 0
                              ? 0
                              : (item.totalOrders / peakTime.peakOrders) * 100,
                            item.totalOrders > 0 ? 8 : 0
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <strong>{item.totalOrders}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Food Demand */}
      <div className="ai-card food-demand-card">

        <div className="ai-card-header">
          <div>
            <span className="ai-card-label">NEXT DAY FORECAST</span>
            <h2>Food Demand Prediction</h2>
          </div>

          <div className="ai-card-icon">🍕</div>
        </div>

        {foodDemand && (
          <>
            <div className="demand-summary">
              AI prediction for{" "}
              <strong>{foodDemand.predictionFor}</strong>
            </div>

            {foodDemand.foods.length > 0 ? (
              <div className="food-demand-list">

                {foodDemand.foods.map((food, index) => (
                  <div className="food-demand-item" key={food.foodName}>

                    <div className="food-rank">
                      #{index + 1}
                    </div>

                    <div className="food-info">
                      <h3>{food.foodName}</h3>
                      <span>
                        Historical sales: {food.totalSold}
                      </span>
                    </div>

                    <div className="demand-result">
                      <span>Predicted Demand</span>
                      <strong>{food.predictedDemand}</strong>
                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="empty-ai-state">
                No food demand data available.
              </div>
            )}
          </>
        )}

      </div>

      {/* Business Recommendations */}
      <div className="ai-card recommendations-card">

        <div className="ai-card-header">
          <div>
            <span className="ai-card-label">SMART INSIGHTS</span>
            <h2>Business Recommendations</h2>
          </div>

          <div className="ai-card-icon">🤖</div>
        </div>

        {businessRecommendations &&
        businessRecommendations.recommendations.length > 0 ? (
          <div className="recommendations-list">

            {businessRecommendations.recommendations.map(
              (recommendation, index) => (
                <div
                  className={`recommendation-item ${recommendation.type}`}
                  key={index}
                >

                  <div className="recommendation-icon">
                    {recommendation.type === "success"
                      ? "✓"
                      : "i"}
                  </div>

                  <div className="recommendation-content">

                    <div className="recommendation-top">
                      <span>{recommendation.category}</span>

                      <small>
                        {recommendation.type}
                      </small>
                    </div>

                    <h3>{recommendation.message}</h3>

                    <p>{recommendation.suggestion}</p>

                  </div>

                </div>
              )
            )}

          </div>
        ) : (
          <div className="empty-ai-state">
            No recommendations available.
          </div>
        )}

      </div>

      {/* AI Status */}
      <div className="ai-footer-status">
        <span className="status-dot"></span>
        AI Analysis is connected to your food management backend
      </div>

    </div>
  );
}

export default AIAnalysis;