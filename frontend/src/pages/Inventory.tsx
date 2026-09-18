import { useEffect, useState } from "react";
import {
  Package,
  Carrot,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

interface InventoryData {
  totalInventoryItems: number;
  totalIngredients: number;
  lowStockCount: number;
  lowStockItems: string[];
}

function Inventory() {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/admin/inventory-overview"
      );

      setInventory(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="inventory-loading">
          <RefreshCw className="inventory-loading-icon" size={32} />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-page">
        <div className="inventory-error">
          <AlertTriangle size={28} />
          <p>{error}</p>

          <button onClick={fetchInventory}>
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">

      {/* Header */}
      <div className="inventory-header">
        <div>
          <span className="inventory-eyebrow">
            STOCK MANAGEMENT
          </span>

          <h1>Inventory</h1>

          <p>
            Monitor your inventory and ingredient availability.
          </p>
        </div>

        <button
          className="inventory-refresh"
          onClick={fetchInventory}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="inventory-stats">

        {/* Total Inventory */}
        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <Package size={23} />
          </div>

          <div>
            <span>Total Inventory</span>

            <strong>
              {inventory?.totalInventoryItems ?? 0}
            </strong>

            <small>Inventory items</small>
          </div>
        </div>

        {/* Ingredients */}
        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <Carrot size={23} />
          </div>

          <div>
            <span>Total Ingredients</span>

            <strong>
              {inventory?.totalIngredients ?? 0}
            </strong>

            <small>Available ingredients</small>
          </div>
        </div>

        {/* Low Stock */}
        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            <AlertTriangle size={23} />
          </div>

          <div>
            <span>Low Stock</span>

            <strong>
              {inventory?.lowStockCount ?? 0}
            </strong>

            <small>Items need attention</small>
          </div>
        </div>

        {/* Status */}
        <div className="inventory-stat-card inventory-status-card">
          <div className="inventory-stat-icon">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Inventory Status</span>

            <strong>
              {(inventory?.lowStockCount ?? 0) === 0
                ? "Healthy"
                : "Attention"}
            </strong>

            <small>
              {(inventory?.lowStockCount ?? 0) === 0
                ? "No low-stock items"
                : "Check low-stock items"}
            </small>
          </div>
        </div>

      </div>

      {/* Inventory Overview */}
      <div className="inventory-overview-card">

        <div className="inventory-overview-header">
          <div>
            <h2>Inventory Overview</h2>
            <p>
              Current inventory health and stock information
            </p>
          </div>

          <Package size={24} />
        </div>

        {inventory?.lowStockItems &&
        inventory.lowStockItems.length > 0 ? (
          <div className="low-stock-list">

            {inventory.lowStockItems.map(
              (item, index) => (
                <div
                  className="low-stock-item"
                  key={index}
                >
                  <AlertTriangle size={20} />

                  <span>{item}</span>

                  <span className="low-stock-badge">
                    Low Stock
                  </span>
                </div>
              )
            )}

          </div>
        ) : (
          <div className="inventory-empty">

            <div className="inventory-empty-icon">
              <CheckCircle2 size={34} />
            </div>

            <h3>Inventory is Healthy</h3>

            <p>
              There are currently no low-stock items
              that need your attention.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default Inventory;