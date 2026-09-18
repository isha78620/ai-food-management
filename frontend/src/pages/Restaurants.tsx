import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Store,
  MapPin,
  Phone,
  Eye,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

import api from "../services/api";

interface Restaurant {
  _id?: string;
  id?: string;
  restaurantId?: string;

  name?: string;
  restaurantName?: string;

  address?: string;
  location?: string;

  phone?: string;
  contact?: string;

  email?: string;

  status?: string;
  isActive?: boolean;

  createdAt?: string;
  created_at?: string;
}

function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [showModal, setShowModal] = useState(false);

  /* =========================
     LOAD RESTAURANTS
     ========================= */

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/restaurants");

      console.log("Restaurants API Response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.restaurants || [];

      setRestaurants(data);
    } catch (err) {
      console.error("Restaurants API Error:", err);
      setError("Unable to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  /* =========================
     RESTAURANT NAME
     ========================= */

  const getName = (restaurant: Restaurant) => {
    return (
      restaurant.name ||
      restaurant.restaurantName ||
      "Restaurant"
    );
  };

  /* =========================
     RESTAURANT ID
     ========================= */

  const getId = (restaurant: Restaurant) => {
    return (
      restaurant.restaurantId ||
      restaurant._id ||
      restaurant.id ||
      "N/A"
    );
  };

  /* =========================
     ADDRESS
     ========================= */

  const getAddress = (restaurant: Restaurant) => {
    return (
      restaurant.address ||
      restaurant.location ||
      "Address not available"
    );
  };

  /* =========================
     PHONE
     ========================= */

  const getPhone = (restaurant: Restaurant) => {
    return (
      restaurant.phone ||
      restaurant.contact ||
      "Not available"
    );
  };

  /* =========================
     STATUS
     ========================= */

  const isActive = (restaurant: Restaurant) => {
    if (typeof restaurant.isActive === "boolean") {
      return restaurant.isActive;
    }

    return (
      restaurant.status?.toLowerCase() === "active"
    );
  };

  /* =========================
     FILTER
     ========================= */

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const name = getName(restaurant).toLowerCase();
      const address = getAddress(restaurant).toLowerCase();
      const phone = getPhone(restaurant).toLowerCase();

      const searchText = search.toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        address.includes(searchText) ||
        phone.includes(searchText);

      const active = isActive(restaurant);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  /* =========================
     COUNTS
     ========================= */

  const totalRestaurants = restaurants.length;

  const activeRestaurants = restaurants.filter(
    (restaurant) => isActive(restaurant)
  ).length;

  const inactiveRestaurants =
    totalRestaurants - activeRestaurants;

  /* =========================
     DATE
     ========================= */

  const getDate = (restaurant: Restaurant) => {
    const date =
      restaurant.createdAt ||
      restaurant.created_at;

    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "N/A";
    }
  };

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="restaurants-page">
        <div className="restaurants-loading">
          <RefreshCw
            size={32}
            className="restaurants-spin"
          />

          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">

      {/* =========================
          HEADER
          ========================= */}

      <div className="restaurants-header">

        <div>
          <p className="restaurants-welcome">
            Manage your restaurant network
          </p>

          <h1>Restaurants</h1>

          <p className="restaurants-subtitle">
            View and manage all registered restaurants.
          </p>
        </div>

        <button
          className="restaurants-refresh-button"
          onClick={loadRestaurants}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "restaurants-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="restaurants-error">
          {error}
        </div>
      )}

      {/* =========================
          SUMMARY
          ========================= */}

      <div className="restaurants-summary-grid">

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon total">
            <Store size={22} />
          </div>

          <div>
            <p>Total Restaurants</p>
            <h2>{totalRestaurants}</h2>
          </div>
        </div>

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon active">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Active</p>
            <h2>{activeRestaurants}</h2>
          </div>
        </div>

        <div className="restaurants-summary-card">
          <div className="restaurant-summary-icon inactive">
            <XCircle size={22} />
          </div>

          <div>
            <p>Inactive</p>
            <h2>{inactiveRestaurants}</h2>
          </div>
        </div>

      </div>

      {/* =========================
          MAIN CONTAINER
          ========================= */}

      <div className="restaurants-container">

        {/* TOOLBAR */}

        <div className="restaurants-toolbar">

          <div className="restaurants-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search restaurant, address or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            className="restaurants-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Restaurants
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

        {/* =========================
            RESTAURANT GRID
            ========================= */}

        <div className="restaurant-cards">

          {filteredRestaurants.length === 0 ? (

            <div className="restaurants-empty">

              <Store size={46} />

              <h3>No restaurants found</h3>

              <p>
                No restaurants match your search.
              </p>

            </div>

          ) : (

            filteredRestaurants.map(
              (restaurant, index) => {

                const active =
                  isActive(restaurant);

                return (
                  <div
                    className="restaurant-card"
                    key={getId(restaurant)}
                    style={{
                      animationDelay: `${index * 0.06}s`,
                    }}
                  >

                    {/* Card Top */}

                    <div className="restaurant-card-top">

                      <div className="restaurant-logo">
                        <Store size={25} />
                      </div>

                      <span
                        className={`restaurant-status ${
                          active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    {/* Name */}

                    <h3>
                      {getName(restaurant)}
                    </h3>

                    {/* ID */}

                    <span className="restaurant-id">
                      ID: {getId(restaurant).slice(-10)}
                    </span>

                    {/* Details */}

                    <div className="restaurant-details">

                      <div>
                        <MapPin size={16} />

                        <span>
                          {getAddress(
                            restaurant
                          )}
                        </span>
                      </div>

                      <div>
                        <Phone size={16} />

                        <span>
                          {getPhone(
                            restaurant
                          )}
                        </span>
                      </div>

                    </div>

                    {/* Footer */}

                    <div className="restaurant-card-footer">

                      <span>
                        Added {getDate(restaurant)}
                      </span>

                      <button
                        className="restaurant-view-button"
                        onClick={() => {
                          setSelectedRestaurant(
                            restaurant
                          );

                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />

                        View
                      </button>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

      </div>

      {/* =========================
          DETAILS MODAL
          ========================= */}

      {showModal && selectedRestaurant && (

        <div
          className="restaurant-modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="restaurant-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="restaurant-modal-header">

              <div className="restaurant-modal-title">

                <div className="restaurant-modal-icon">
                  <Store size={25} />
                </div>

                <div>
                  <p>Restaurant Details</p>

                  <h2>
                    {getName(
                      selectedRestaurant
                    )}
                  </h2>
                </div>

              </div>

              <button
                className="restaurant-modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="restaurant-modal-body">

              <div className="restaurant-detail-row">

                <span>Restaurant ID</span>

                <strong>
                  {getId(
                    selectedRestaurant
                  )}
                </strong>

              </div>

              <div className="restaurant-detail-row">

                <span>Email</span>

                <strong>
                  {selectedRestaurant.email ||
                    "Not available"}
                </strong>

              </div>

              <div className="restaurant-detail-row">

                <span>Phone</span>

                <strong>
                  {getPhone(
                    selectedRestaurant
                  )}
                </strong>

              </div>

              <div className="restaurant-detail-row">

                <span>Address</span>

                <strong>
                  {getAddress(
                    selectedRestaurant
                  )}
                </strong>

              </div>

              <div className="restaurant-detail-row">

                <span>Created</span>

                <strong>
                  {getDate(
                    selectedRestaurant
                  )}
                </strong>

              </div>

              <div className="restaurant-detail-status">

                <span>Status</span>

                <span
                  className={`restaurant-status ${
                    isActive(
                      selectedRestaurant
                    )
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {isActive(
                    selectedRestaurant
                  )
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Restaurants;