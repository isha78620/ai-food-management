import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  Eye,
  X,
  MapPin,
} from "lucide-react";

import api from "../services/api";

interface Delivery {
  _id?: string;
  id?: string;
  orderId?: string;

  tokenNumber?: string | number;
  token?: string | number;

  customerName?: string;
  customer?: string;

  deliveryPerson?: string;
  deliveryPersonName?: string;
  driverName?: string;

  address?: string;
  deliveryAddress?: string;

  status?: string;

  amount?: number;
  totalAmount?: number;
  total?: number;

  createdAt?: string;
  created_at?: string;
}

function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDelivery, setSelectedDelivery] =
    useState<Delivery | null>(null);

  const [showModal, setShowModal] = useState(false);

  /* =========================
     FETCH DELIVERIES
     ========================= */

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/deliveries");

      console.log(
        "Deliveries API Response:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.deliveries ||
          response.data?.data ||
          [];

      setDeliveries(data);
    } catch (err) {
      console.error(
        "Deliveries API Error:",
        err
      );

      setError(
        "Unable to load delivery data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  /* =========================
     HELPERS
     ========================= */

  const getStatus = (delivery: Delivery) =>
    delivery.status?.toLowerCase() || "pending";

  const getCustomer = (delivery: Delivery) =>
    delivery.customerName ||
    delivery.customer ||
    "Customer";

  const getOrderId = (delivery: Delivery) =>
    delivery.orderId ||
    delivery._id ||
    delivery.id ||
    "N/A";

  const getToken = (delivery: Delivery) =>
    delivery.tokenNumber ||
    delivery.token ||
    getOrderId(delivery).slice(-5);

  const getDeliveryPerson = (
    delivery: Delivery
  ) =>
    delivery.deliveryPersonName ||
    delivery.deliveryPerson ||
    delivery.driverName ||
    "Not Assigned";

  const getAddress = (delivery: Delivery) =>
    delivery.deliveryAddress ||
    delivery.address ||
    "Address not available";

  const getAmount = (delivery: Delivery) =>
    delivery.totalAmount ??
    delivery.amount ??
    delivery.total ??
    0;

  const getDate = (delivery: Delivery) => {
    const date =
      delivery.createdAt ||
      delivery.created_at;

    if (!date) return "N/A";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =========================
     FILTER
     ========================= */

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const text = search.toLowerCase();

      const matchesSearch =
        getCustomer(delivery)
          .toLowerCase()
          .includes(text) ||
        getOrderId(delivery)
          .toLowerCase()
          .includes(text) ||
        String(getToken(delivery))
          .toLowerCase()
          .includes(text) ||
        getDeliveryPerson(delivery)
          .toLowerCase()
          .includes(text);

      const status =
        getStatus(delivery);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    deliveries,
    search,
    statusFilter,
  ]);

  /* =========================
     COUNTS
     ========================= */

  const pendingCount = deliveries.filter(
    (delivery) =>
      getStatus(delivery) === "pending"
  ).length;

  const outForDeliveryCount =
    deliveries.filter((delivery) =>
      [
        "out_for_delivery",
        "out-for-delivery",
        "out for delivery",
      ].includes(getStatus(delivery))
    ).length;

  const deliveredCount = deliveries.filter(
    (delivery) =>
      getStatus(delivery) === "delivered"
  ).length;

  const cancelledCount =
    deliveries.filter(
      (delivery) =>
        getStatus(delivery) === "cancelled"
    ).length;

  /* =========================
     STATUS LABEL
     ========================= */

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "out_for_delivery":
      case "out-for-delivery":
      case "out for delivery":
        return "Out for Delivery";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  /* =========================
     STATUS ICON
     ========================= */

  const StatusIcon = ({
    status,
  }: {
    status: string;
  }) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={15} />;

      case "cancelled":
        return <XCircle size={15} />;

      case "out_for_delivery":
      case "out-for-delivery":
      case "out for delivery":
        return <Truck size={15} />;

      default:
        return <Clock size={15} />;
    }
  };

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="delivery-loading">
          <Truck
            size={36}
            className="delivery-loading-icon"
          />

          <p>
            Loading deliveries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">

      {/* HEADER */}

      <div className="delivery-header">

        <div>
          <p className="delivery-welcome">
            Delivery Management
          </p>

          <h1>Deliveries</h1>

          <p className="delivery-subtitle">
            Track and manage customer deliveries.
          </p>
        </div>

        <button
          className="delivery-refresh-button"
          onClick={fetchDeliveries}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={
              loading ? "spin" : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="delivery-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="delivery-stats">

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon pending">
            <Clock size={22} />
          </div>

          <div>
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>

        </div>

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon transit">
            <Truck size={22} />
          </div>

          <div>
            <p>Out for Delivery</p>
            <h2>
              {outForDeliveryCount}
            </h2>
          </div>

        </div>

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon delivered">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Delivered</p>
            <h2>{deliveredCount}</h2>
          </div>

        </div>

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon cancelled">
            <XCircle size={22} />
          </div>

          <div>
            <p>Cancelled</p>
            <h2>{cancelledCount}</h2>
          </div>

        </div>

      </div>

      {/* MAIN CONTAINER */}

      <div className="delivery-container">

        {/* TOOLBAR */}

        <div className="delivery-toolbar">

          <div>
            <h2>Delivery Orders</h2>

            <p>
              {filteredDeliveries.length} deliveries found
            </p>
          </div>

          <div className="delivery-controls">

            <div className="delivery-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search delivery..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="delivery-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="out_for_delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

          </div>

        </div>

        {/* DELIVERY CARDS */}

        <div className="delivery-grid">

          {filteredDeliveries.length === 0 ? (

            <div className="delivery-empty">

              <Truck size={50} />

              <h3>
                No deliveries found
              </h3>

              <p>
                No deliveries match your
                current search or filter.
              </p>

            </div>

          ) : (

            filteredDeliveries.map(
              (delivery, index) => {

                const status =
                  getStatus(delivery);

                return (
                  <div
                    className="delivery-card"
                    key={
                      getOrderId(
                        delivery
                      )
                    }
                    style={{
                      animationDelay:
                        `${index * 0.06}s`,
                    }}
                  >

                    {/* TOP */}

                    <div className="delivery-card-top">

                      <div className="delivery-token">

                        <span>
                          TOKEN
                        </span>

                        <strong>
                          #{getToken(
                            delivery
                          )}
                        </strong>

                      </div>

                      <div
                        className={`delivery-status ${status}`}
                      >
                        <StatusIcon
                          status={status}
                        />

                        {statusLabel(
                          status
                        )}
                      </div>

                    </div>

                    {/* CUSTOMER */}

                    <div className="delivery-customer">

                      <div className="delivery-customer-icon">
                        <Package size={18} />
                      </div>

                      <div>
                        <strong>
                          {getCustomer(
                            delivery
                          )}
                        </strong>

                        <span>
                          Order #
                          {getOrderId(
                            delivery
                          ).slice(-8)}
                        </span>
                      </div>

                    </div>

                    {/* DELIVERY PERSON */}

                    <div className="delivery-person">

                      <div>
                        <span>
                          Delivery Partner
                        </span>

                        <strong>
                          {getDeliveryPerson(
                            delivery
                          )}
                        </strong>
                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="delivery-address">

                      <MapPin size={16} />

                      <span>
                        {getAddress(
                          delivery
                        )}
                      </span>

                    </div>

                    {/* FOOTER */}

                    <div className="delivery-footer">

                      <div>
                        <span>
                          Order Time
                        </span>

                        <strong>
                          {getDate(
                            delivery
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Amount
                        </span>

                        <strong>
                          ₹
                          {Number(
                            getAmount(
                              delivery
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <button
                        className="delivery-view-button"
                        onClick={() => {
                          setSelectedDelivery(
                            delivery
                          );

                          setShowModal(
                            true
                          );
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

      {/* MODAL */}

      {showModal &&
        selectedDelivery && (

          <div
            className="delivery-modal-overlay"
            onClick={() =>
              setShowModal(false)
            }
          >

            <div
              className="delivery-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="delivery-modal-header">

                <div className="delivery-modal-title">

                  <div className="delivery-modal-icon">
                    <Truck size={24} />
                  </div>

                  <div>
                    <p>
                      Delivery Details
                    </p>

                    <h2>
                      Token #
                      {getToken(
                        selectedDelivery
                      )}
                    </h2>
                  </div>

                </div>

                <button
                  className="delivery-modal-close"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="delivery-modal-body">

                <div className="delivery-detail">
                  <span>
                    Customer
                  </span>

                  <strong>
                    {getCustomer(
                      selectedDelivery
                    )}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Order ID
                  </span>

                  <strong>
                    {getOrderId(
                      selectedDelivery
                    )}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Delivery Partner
                  </span>

                  <strong>
                    {getDeliveryPerson(
                      selectedDelivery
                    )}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Address
                  </span>

                  <strong>
                    {getAddress(
                      selectedDelivery
                    )}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      getAmount(
                        selectedDelivery
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Order Time
                  </span>

                  <strong>
                    {getDate(
                      selectedDelivery
                    )}
                  </strong>
                </div>

                <div className="delivery-detail-status">

                  <span>
                    Status
                  </span>

                  <div
                    className={`delivery-status ${getStatus(
                      selectedDelivery
                    )}`}
                  >
                    <StatusIcon
                      status={getStatus(
                        selectedDelivery
                      )}
                    />

                    {statusLabel(
                      getStatus(
                        selectedDelivery
                      )
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Deliveries;