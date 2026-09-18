import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Package,
  Eye,
  X,
  MapPin,
  PackageCheck,
  ArrowRight,
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

  assignedAt?: string;
  updatedAt?: string;
}

type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered";

function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDelivery, setSelectedDelivery] =
    useState<Delivery | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  /* =========================
     FETCH DELIVERIES
     ========================= */

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/deliveries");

      console.log("Deliveries API Response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.deliveries ||
          response.data?.data ||
          [];

      setDeliveries(data);

      // Keep selected delivery updated after refresh
      if (selectedDelivery) {
        const selectedId =
          selectedDelivery._id || selectedDelivery.id;

        const updatedDelivery = data.find(
          (delivery: Delivery) =>
            (delivery._id || delivery.id) === selectedId
        );

        if (updatedDelivery) {
          setSelectedDelivery(updatedDelivery);
        }
      }
    } catch (err) {
      console.error("Deliveries API Error:", err);

      setError("Unable to load delivery data.");
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

  const getStatus = (delivery: Delivery): DeliveryStatus => {
    const status = delivery.status?.toLowerCase();

    if (
      status === "assigned" ||
      status === "picked_up" ||
      status === "out_for_delivery" ||
      status === "delivered"
    ) {
      return status;
    }

    return "assigned";
  };

  const getDeliveryId = (delivery: Delivery) =>
    delivery._id || delivery.id || "";

  const getCustomer = (delivery: Delivery) =>
    delivery.customerName ||
    delivery.customer ||
    "Customer";

  const getOrderId = (delivery: Delivery) =>
    delivery.orderId ||
    "N/A";

  const getToken = (delivery: Delivery) =>
    delivery.tokenNumber ||
    delivery.token ||
    getOrderId(delivery).slice(-5);

  const getDeliveryPerson = (delivery: Delivery) =>
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
      delivery.created_at ||
      delivery.assignedAt;

    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================
     STATUS LABEL
     ========================= */

  const statusLabel = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned";

      case "picked_up":
        return "Picked Up";

      case "out_for_delivery":
        return "Out for Delivery";

      case "delivered":
        return "Delivered";

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
      case "assigned":
        return <Clock size={15} />;

      case "picked_up":
        return <PackageCheck size={15} />;

      case "out_for_delivery":
        return <Truck size={15} />;

      case "delivered":
        return <CheckCircle size={15} />;

      default:
        return <Clock size={15} />;
    }
  };

  /* =========================
     NEXT STATUS
     ========================= */

  const getNextStatus = (
    status: DeliveryStatus
  ): DeliveryStatus | null => {
    switch (status) {
      case "assigned":
        return "picked_up";

      case "picked_up":
        return "out_for_delivery";

      case "out_for_delivery":
        return "delivered";

      case "delivered":
        return null;

      default:
        return null;
    }
  };

  /* =========================
     UPDATE DELIVERY STATUS
     ========================= */

  const updateDeliveryStatus = async (
    delivery: Delivery,
    newStatus: DeliveryStatus
  ) => {
    const deliveryId = getDeliveryId(delivery);

    if (!deliveryId) {
      setError("Delivery ID is missing.");
      return;
    }

    try {
      setUpdatingId(deliveryId);
      setError("");
      setStatusMessage("");

      const response = await api.patch(
        `/api/deliveries/${deliveryId}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      console.log(
        "Delivery Status Update Response:",
        response.data
      );

      // Update local delivery list immediately
      setDeliveries((previousDeliveries) =>
        previousDeliveries.map((item) =>
          getDeliveryId(item) === deliveryId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      // Update selected delivery if modal is open
      if (
        selectedDelivery &&
        getDeliveryId(selectedDelivery) === deliveryId
      ) {
        setSelectedDelivery({
          ...selectedDelivery,
          status: newStatus,
        });
      }

      setStatusMessage(
        `Delivery status updated to ${statusLabel(
          newStatus
        )}.`
      );

      // Refresh from backend
      await fetchDeliveries();
    } catch (err: any) {
      console.error(
        "Delivery Status Update Error:",
        err
      );

      const backendMessage =
        err?.response?.data?.detail;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Unable to update delivery status."
      );
    } finally {
      setUpdatingId(null);
    }
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

      const status = getStatus(delivery);

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

  const assignedCount = deliveries.filter(
    (delivery) =>
      getStatus(delivery) === "assigned"
  ).length;

  const pickedUpCount = deliveries.filter(
    (delivery) =>
      getStatus(delivery) === "picked_up"
  ).length;

  const outForDeliveryCount =
    deliveries.filter(
      (delivery) =>
        getStatus(delivery) === "out_for_delivery"
    ).length;

  const deliveredCount = deliveries.filter(
    (delivery) =>
      getStatus(delivery) === "delivered"
  ).length;

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

          <p>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">

      {/* =========================
          HEADER
          ========================= */}

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
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="delivery-error">
          {error}
        </div>
      )}

      {/* =========================
          SUCCESS MESSAGE
          ========================= */}

      {statusMessage && (
        <div className="delivery-success">
          {statusMessage}
        </div>
      )}

      {/* =========================
          STATISTICS
          ========================= */}

      <div className="delivery-stats">

        {/* ASSIGNED */}

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon pending">
            <Clock size={22} />
          </div>

          <div>
            <p>Assigned</p>
            <h2>{assignedCount}</h2>
          </div>

        </div>

        {/* PICKED UP */}

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon transit">
            <PackageCheck size={22} />
          </div>

          <div>
            <p>Picked Up</p>
            <h2>{pickedUpCount}</h2>
          </div>

        </div>

        {/* OUT FOR DELIVERY */}

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon transit">
            <Truck size={22} />
          </div>

          <div>
            <p>Out for Delivery</p>
            <h2>{outForDeliveryCount}</h2>
          </div>

        </div>

        {/* DELIVERED */}

        <div className="delivery-stat-card">

          <div className="delivery-stat-icon delivered">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Delivered</p>
            <h2>{deliveredCount}</h2>
          </div>

        </div>

      </div>

      {/* =========================
          MAIN CONTAINER
          ========================= */}

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
                  setSearch(e.target.value)
                }
              />

            </div>

            <select
              className="delivery-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="picked_up">
                Picked Up
              </option>

              <option value="out_for_delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>
            </select>

          </div>

        </div>

        {/* =========================
            DELIVERY CARDS
            ========================= */}

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

                const deliveryId =
                  getDeliveryId(delivery);

                const nextStatus =
                  getNextStatus(status);

                const isUpdating =
                  updatingId === deliveryId;

                return (
                  <div
                    className="delivery-card"
                    key={
                      deliveryId ||
                      `${getOrderId(delivery)}-${index}`
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
                          #{getToken(delivery)}
                        </strong>

                      </div>

                      <div
                        className={`delivery-status ${status}`}
                      >
                        <StatusIcon
                          status={status}
                        />

                        {statusLabel(status)}
                      </div>

                    </div>

                    {/* CUSTOMER */}

                    <div className="delivery-customer">

                      <div className="delivery-customer-icon">
                        <Package size={18} />
                      </div>

                      <div>
                        <strong>
                          {getCustomer(delivery)}
                        </strong>

                        <span>
                          Order #
                          {getOrderId(delivery).slice(-8)}
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
                          {getDeliveryPerson(delivery)}
                        </strong>
                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="delivery-address">

                      <MapPin size={16} />

                      <span>
                        {getAddress(delivery)}
                      </span>

                    </div>

                    {/* FOOTER */}

                    <div className="delivery-footer">

                      <div>
                        <span>
                          Order Time
                        </span>

                        <strong>
                          {getDate(delivery)}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Amount
                        </span>

                        <strong>
                          ₹
                          {Number(
                            getAmount(delivery)
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <button
                        className="delivery-view-button"
                        onClick={() => {
                          setSelectedDelivery(
                            delivery
                          );

                          setStatusMessage("");

                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />

                        View
                      </button>

                    </div>

                    {/* NEXT STATUS ACTION */}

                    {nextStatus && (
                      <div className="delivery-card-action">

                        <button
                          className="delivery-status-action"
                          disabled={isUpdating}
                          onClick={() =>
                            updateDeliveryStatus(
                              delivery,
                              nextStatus
                            )
                          }
                        >
                          {isUpdating ? (
                            <>
                              <RefreshCw
                                size={15}
                                className="spin"
                              />

                              Updating...
                            </>
                          ) : (
                            <>
                              {nextStatus === "picked_up" && (
                                <PackageCheck size={15} />
                              )}

                              {nextStatus === "out_for_delivery" && (
                                <Truck size={15} />
                              )}

                              {nextStatus === "delivered" && (
                                <CheckCircle size={15} />
                              )}

                              Mark as{" "}
                              {statusLabel(nextStatus)}

                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>

                      </div>
                    )}

                    {status === "delivered" && (
                      <div className="delivery-completed-message">
                        <CheckCircle size={15} />

                        Delivery completed
                      </div>
                    )}

                  </div>
                );
              }
            )

          )}

        </div>

      </div>

      {/* =========================
          MODAL
          ========================= */}

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

              {/* MODAL HEADER */}

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
                      {getToken(selectedDelivery)}
                    </h2>
                  </div>

                </div>

                <button
                  className="delivery-modal-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              {/* MODAL BODY */}

              <div className="delivery-modal-body">

                <div className="delivery-detail">
                  <span>
                    Customer
                  </span>

                  <strong>
                    {getCustomer(selectedDelivery)}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Order ID
                  </span>

                  <strong>
                    {getOrderId(selectedDelivery)}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Delivery Partner
                  </span>

                  <strong>
                    {getDeliveryPerson(selectedDelivery)}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Address
                  </span>

                  <strong>
                    {getAddress(selectedDelivery)}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      getAmount(selectedDelivery)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="delivery-detail">
                  <span>
                    Order Time
                  </span>

                  <strong>
                    {getDate(selectedDelivery)}
                  </strong>
                </div>

                {/* STATUS */}

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
                      getStatus(selectedDelivery)
                    )}
                  </div>

                </div>

                {/* MODAL STATUS ACTION */}

                {getNextStatus(
                  getStatus(selectedDelivery)
                ) && (

                  <div className="delivery-modal-action">

                    <p>
                      Next Step
                    </p>

                    <button
                      className="delivery-status-action modal-action"
                      disabled={
                        updatingId ===
                        getDeliveryId(
                          selectedDelivery
                        )
                      }
                      onClick={() =>
                        updateDeliveryStatus(
                          selectedDelivery,
                          getNextStatus(
                            getStatus(
                              selectedDelivery
                            )
                          )!
                        )
                      }
                    >
                      {updatingId ===
                      getDeliveryId(
                        selectedDelivery
                      ) ? (
                        <>
                          <RefreshCw
                            size={15}
                            className="spin"
                          />

                          Updating...
                        </>
                      ) : (
                        <>
                          Mark as{" "}
                          {statusLabel(
                            getNextStatus(
                              getStatus(
                                selectedDelivery
                              )
                            )!
                          )}

                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                  </div>
                )}

                {getStatus(
                  selectedDelivery
                ) === "delivered" && (

                  <div className="delivery-completed-message modal-completed">
                    <CheckCircle size={16} />

                    Delivery completed successfully
                  </div>

                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Deliveries;