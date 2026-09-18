import { useEffect, useState } from "react";
import {
  Carrot,
  Package,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";

import api from "../services/api";

interface InventoryOverview {
  totalInventoryItems: number;
  totalIngredients: number;
  lowStockCount: number;
  lowStockItems: string[];
}

function Ingredients() {
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/admin/inventory-overview"
      );

      setData(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load ingredient information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  if (loading) {
    return (
      <div className="ingredients-page">
        <div className="ingredients-loading">
          <RefreshCw size={32} />
          <p>Loading ingredients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ingredients-page">
        <div className="ingredients-error">
          <AlertTriangle size={30} />

          <p>{error}</p>

          <button onClick={fetchIngredients}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isHealthy = (data?.lowStockCount ?? 0) === 0;

  return (
    <div className="ingredients-page">

      {/* Header */}
      <div className="ingredients-header">
        <div>
          <span className="ingredients-eyebrow">
            INGREDIENT MANAGEMENT
          </span>

          <h1>Ingredients</h1>

          <p>
            Monitor ingredient availability and stock health.
          </p>
        </div>

        <button
          className="ingredients-refresh"
          onClick={fetchIngredients}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="ingredients-stats">

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <Carrot size={24} />
          </div>

          <div>
            <span>Total Ingredients</span>
            <strong>
              {data?.totalIngredients ?? 0}
            </strong>
            <small>Available in system</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <Package size={24} />
          </div>

          <div>
            <span>Inventory Items</span>
            <strong>
              {data?.totalInventoryItems ?? 0}
            </strong>
            <small>Total inventory records</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon">
            <AlertTriangle size={24} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>
              {data?.lowStockCount ?? 0}
            </strong>
            <small>Need attention</small>
          </div>
        </div>

        <div className="ingredients-stat-card">
          <div className="ingredients-stat-icon ingredients-success-icon">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Stock Status</span>

            <strong>
              {isHealthy ? "Healthy" : "Attention"}
            </strong>

            <small>
              {isHealthy
                ? "All stock levels are healthy"
                : "Low stock detected"}
            </small>
          </div>
        </div>

      </div>

      {/* Main Card */}
      <div className="ingredients-main-card">

        <div className="ingredients-card-header">
          <div>
            <h2>Ingredient Overview</h2>

            <p>
              Current ingredient and stock information
            </p>
          </div>

          <div className="ingredients-card-icon">
            <Carrot size={24} />
          </div>
        </div>

        {isHealthy ? (
          <div className="ingredients-healthy">

            <div className="ingredients-healthy-icon">
              <CheckCircle2 size={38} />
            </div>

            <h3>All Ingredients Are Healthy</h3>

            <p>
              No low-stock ingredients currently require
              attention.
            </p>

          </div>
        ) : (
          <div className="ingredients-low-stock">

            <div className="ingredients-warning-title">
              <AlertTriangle size={22} />

              <h3>
                Low Stock Ingredients
              </h3>
            </div>

            {data?.lowStockItems.map(
              (item, index) => (
                <div
                  className="ingredient-item"
                  key={index}
                >
                  <Carrot size={19} />
                  <span>{item}</span>

                  <span className="ingredient-low-badge">
                    Low Stock
                  </span>
                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* Backend Information */}
      <div className="ingredients-info-card">

        <Info size={20} />

        <div>
          <h3>Ingredient Details</h3>

          <p>
            The current backend provides ingredient totals
            through the inventory overview API. Individual
            ingredient records, quantities and other detailed
            information are not currently available through
            an Ingredients API.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Ingredients;