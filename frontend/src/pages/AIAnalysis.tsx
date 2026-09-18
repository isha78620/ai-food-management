import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Utensils,
  Clock3,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

interface FoodDemand {
  foodName: string;
  totalSold: number;
  predictedDemand: number;
}

interface FoodDemandResponse {
  predictionFor: string;
  foods: FoodDemand[];
}

interface PeakTimeResponse {
  predictionFor: string;
  peakTime: string;
  peakOrders: number;
  hourlyAnalysis: {
    hour: number;
    timeRange: string;
    totalOrders: number;
  }[];
}

interface Recommendation {
  type: string;
  category: string;
  message: string;
  suggestion: string;
}

interface RecommendationResponse {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockItems: number;
  recommendationCount: number;
  recommendations: Recommendation[];
}

interface SalesPredictionResponse {
  message?: string;
  required?: number;
  available?: number;
}

function AIAnalysis() {
  const [foodDemand, setFoodDemand] =
    useState<FoodDemandResponse | null>(null);

  const [peakTime, setPeakTime] =
    useState<PeakTimeResponse | null>(null);

  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);

  const [salesPrediction, setSalesPrediction] =
    useState<SalesPredictionResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        foodDemandResponse,
        peakTimeResponse,
        recommendationResponse,
        salesPredictionResponse,
      ] = await Promise.all([
        api.get("/api/ai/food-demand"),
        api.get("/api/ai/peak-time"),
        api.get("/api/ai/business-recommendations"),
        api.get("/api/ai/sales-prediction"),
      ]);

      setFoodDemand(foodDemandResponse.data);
      setPeakTime(peakTimeResponse.data);
      setRecommendations(recommendationResponse.data);
      setSalesPrediction(salesPredictionResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="ai-analysis-page">
        <div className="ai-analysis-loading">
          <RefreshCw size={32} />
          <p>Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-analysis-page">
        <div className="ai-analysis-error">
          <AlertTriangle size={30} />

          <p>{error}</p>

          <button onClick={fetchAIAnalysis}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-page">

      {/* Header */}
      <div className="ai-analysis-header">
        <div>
          <span className="ai-analysis-eyebrow">
            ARTIFICIAL INTELLIGENCE
          </span>

          <h1>AI Analysis</h1>

          <p>
            AI-powered insights to understand food demand,
            peak times and business performance.
          </p>
        </div>

        <button
          className="ai-analysis-refresh"
          onClick={fetchAIAnalysis}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* AI Stats */}
      <div className="ai-analysis-stats">

        <div className="ai-stat-card">
          <div className="ai-stat-icon">
            <Utensils size={23} />
          </div>

          <div>
            <span>Predicted Food Demand</span>

            <strong>
              {foodDemand?.foods?.length ?? 0}
            </strong>

            <small>Food items analyzed</small>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Peak Time</span>

            <strong>
              {peakTime?.peakTime ?? "N/A"}
            </strong>

            <small>Predicted busy period</small>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon">
            <Lightbulb size={23} />
          </div>

          <div>
            <span>Recommendations</span>

            <strong>
              {recommendations?.recommendationCount ?? 0}
            </strong>

            <small>Business insights</small>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon">
            <TrendingUp size={23} />
          </div>

          <div>
            <span>Completed Orders</span>

            <strong>
              {recommendations?.completedOrders ?? 0}
            </strong>

            <small>Used for analysis</small>
          </div>
        </div>

      </div>

      {/* Food Demand */}
      <div className="ai-analysis-card">

        <div className="ai-card-header">
          <div>
            <h2>Food Demand Prediction</h2>

            <p>
              Estimated demand based on historical orders.
            </p>
          </div>

          <div className="ai-card-icon">
            <Utensils size={24} />
          </div>
        </div>

        {foodDemand?.foods?.length ? (
          <div className="ai-food-list">

            {foodDemand.foods.map((food) => (
              <div
                className="ai-food-item"
                key={food.foodName}
              >
                <div className="ai-food-name">
                  <Utensils size={19} />
                  <span>{food.foodName}</span>
                </div>

                <div className="ai-food-values">
                  <div>
                    <small>Historical Sold</small>
                    <strong>{food.totalSold}</strong>
                  </div>

                  <div>
                    <small>Predicted Demand</small>
                    <strong>
                      {food.predictedDemand}
                    </strong>
                  </div>
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="ai-empty">
            <AlertTriangle size={25} />
            <p>No food demand data available.</p>
          </div>
        )}

      </div>

      {/* Peak Time + Sales Prediction */}
      <div className="ai-analysis-grid">

        {/* Peak Time */}
        <div className="ai-analysis-card">

          <div className="ai-card-header">
            <div>
              <h2>Peak Time Prediction</h2>

              <p>
                Historical order activity analysis.
              </p>
            </div>

            <div className="ai-card-icon">
              <Clock3 size={24} />
            </div>
          </div>

          <div className="ai-peak-box">
            <span>Predicted Peak Period</span>

            <strong>
              {peakTime?.peakTime ?? "N/A"}
            </strong>

            <small>
              Historical peak orders:{" "}
              {peakTime?.peakOrders ?? 0}
            </small>
          </div>

          {peakTime?.hourlyAnalysis?.map((item) => (
            <div
              className="ai-hour-row"
              key={item.hour}
            >
              <span>{item.timeRange}</span>

              <strong>
                {item.totalOrders} orders
              </strong>
            </div>
          ))}

        </div>

        {/* Sales Prediction */}
        <div className="ai-analysis-card">

          <div className="ai-card-header">
            <div>
              <h2>Sales Prediction</h2>

              <p>
                AI readiness based on completed orders.
              </p>
            </div>

            <div className="ai-card-icon">
              <TrendingUp size={24} />
            </div>
          </div>

          {salesPrediction?.message ? (
            <div className="ai-prediction-warning">
              <AlertTriangle size={26} />

              <div>
                <h3>
                  Prediction Not Available
                </h3>

                <p>
                  {salesPrediction.message}
                </p>

                <small>
                  Required:{" "}
                  {salesPrediction.required ?? 0}
                  {" "}completed orders
                  {" • "}
                  Available:{" "}
                  {salesPrediction.available ?? 0}
                </small>
              </div>
            </div>
          ) : (
            <div className="ai-prediction-success">
              <TrendingUp size={30} />

              <h3>
                Sales prediction available
              </h3>

              <p>
                AI has enough completed order data
                for prediction.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Business Recommendations */}
      <div className="ai-analysis-card">

        <div className="ai-card-header">
          <div>
            <h2>AI Business Recommendations</h2>

            <p>
              Recommendations generated from current
              business data.
            </p>
          </div>

          <div className="ai-card-icon">
            <Lightbulb size={24} />
          </div>
        </div>

        <div className="ai-recommendations">

          {recommendations?.recommendations?.map(
            (recommendation, index) => (
              <div
                className="ai-recommendation"
                key={index}
              >
                <div className="ai-recommendation-icon">
                  <Lightbulb size={21} />
                </div>

                <div>
                  <span>
                    {recommendation.category}
                  </span>

                  <h3>
                    {recommendation.message}
                  </h3>

                  <p>
                    {recommendation.suggestion}
                  </p>
                </div>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}

export default AIAnalysis;