import { useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Flame,
  XCircle,
  Eye,
  X,
  Utensils,
} from "lucide-react";

import api from "../services/api";

interface KitchenOrder {
  _id?: string;
  id?: string;
  orderId?: string;

  tokenNumber?: string | number;
  token?: string | number;

  customerName?: string;
  customer?: string;

  restaurantId?: string;
  restaurantName?: string;

  items?: any[];
  foodItems?: any[];

  totalAmount?: number;
  total?: number;

  status?: string;

  createdAt?: string;
  created_at?: string;

  updatedAt?: string;
  updated_at?: string;
}

function Kitchen() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<KitchenOrder | null>(null);

  const [showModal, setShowModal] = useState(false);

  /* =========================
     LOAD KITCHEN ORDERS
     ========================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/kitchen/orders");

      console.log(
        "Kitchen API Response:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders ||
          response.data?.data ||
          [];

      setOrders(data);
    } catch (err) {
      console.error("Kitchen API Error:", err);

      setError(
        "Unable to load kitchen orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     STATUS
     ========================= */

  const getStatus = (order: KitchenOrder) => {
    return (
      order.status?.toLowerCase() ||
      "unknown"
    );
  };

  /* =========================
     ORDER ID
     ========================= */

  const getOrderId = (order: KitchenOrder) => {
    return (
      order.orderId ||
      order._id ||
      order.id ||
      "N/A"
    );
  };

  /* =========================
     TOKEN
     ========================= */

  const getToken = (order: KitchenOrder) => {
    return (
      order.tokenNumber ||
      order.token ||
      getOrderId(order).slice(-5)
    );
  };

  /* =========================
     CUSTOMER
     ========================= */

  const getCustomer = (order: KitchenOrder) => {
    return (
      order.customerName ||
      order.customer ||
      "Customer"
    );
  };

  /* =========================
     ITEMS
     ========================= */

  const getItems = (order: KitchenOrder) => {
    return order.items || order.foodItems || [];
  };

  /* =========================
     TOTAL
     ========================= */

  const getTotal = (order: KitchenOrder) => {
    return (
      order.totalAmount ??
      order.total ??
      0
    );
  };

  /* =========================
     DATE
     ========================= */

  const getDate = (order: KitchenOrder) => {
    const date =
      order.createdAt ||
      order.created_at;

    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "N/A";
    }
  };

  /* =========================
     FILTER
     ========================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        getCustomer(order)
          .toLowerCase()
          .includes(searchText) ||
        getOrderId(order)
          .toLowerCase()
          .includes(searchText) ||
        String(getToken(order))
          .toLowerCase()
          .includes(searchText);

      const status =
        getStatus(order);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  /* =========================
     COUNTS
     ========================= */

  const placedCount = orders.filter(
    (order) =>
      getStatus(order) === "placed"
  ).length;

  const preparingCount = orders.filter(
    (order) =>
      getStatus(order) === "preparing"
  ).length;

  const readyCount = orders.filter(
    (order) =>
      getStatus(order) === "ready"
  ).length;

  const completedCount = orders.filter(
    (order) =>
      getStatus(order) === "completed"
  ).length;

  /* =========================
     STATUS LABEL
     ========================= */

  const statusLabel = (
    status: string
  ) => {
    switch (status) {
      case "placed":
        return "Placed";

      case "preparing":
        return "Preparing";

      case "ready":
        return "Ready";

      case "completed":
        return "Completed";

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
      case "placed":
        return <Clock size={15} />;

      case "preparing":
        return <Flame size={15} />;

      case "ready":
        return <CheckCircle size={15} />;

      case "completed":
        return <CheckCircle size={15} />;

      case "cancelled":
        return <XCircle size={15} />;

      default:
        return <Clock size={15} />;
    }
  };

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="kitchen-page">
        <div className="kitchen-loading">
          <ChefHat
            size={34}
            className="kitchen-loading-icon"
          />

          <p>
            Loading kitchen orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-page">

      {/* =========================
          HEADER
          ========================= */}

      <div className="kitchen-header">

        <div>
          <p className="kitchen-welcome">
            Kitchen Management
          </p>

          <h1>Kitchen</h1>

          <p className="kitchen-subtitle">
            Monitor and manage food orders
            currently being prepared.
          </p>
        </div>

        <button
          className="kitchen-refresh-button"
          onClick={fetchOrders}
        >
          <RefreshCw size={18} />

          Refresh
        </button>

      </div>

      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="kitchen-error">
          {error}
        </div>
      )}

      {/* =========================
          STATISTICS
          ========================= */}

      <div className="kitchen-stats">

        <div className="kitchen-stat-card">

          <div className="kitchen-stat-icon placed">
            <Clock size={22} />
          </div>

          <div>
            <p>Placed</p>
            <h2>{placedCount}</h2>
          </div>

        </div>

        <div className="kitchen-stat-card">

          <div className="kitchen-stat-icon preparing">
            <Flame size={22} />
          </div>

          <div>
            <p>Preparing</p>
            <h2>{preparingCount}</h2>
          </div>

        </div>

        <div className="kitchen-stat-card">

          <div className="kitchen-stat-icon ready">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Ready</p>
            <h2>{readyCount}</h2>
          </div>

        </div>

        <div className="kitchen-stat-card">

          <div className="kitchen-stat-icon completed">
            <Utensils size={22} />
          </div>

          <div>
            <p>Completed</p>
            <h2>{completedCount}</h2>
          </div>

        </div>

      </div>

      {/* =========================
          ORDER CONTAINER
          ========================= */}

      <div className="kitchen-container">

        {/* TOOLBAR */}

        <div className="kitchen-toolbar">

          <div>
            <h2>Kitchen Orders</h2>

            <p>
              {filteredOrders.length} orders
              found
            </p>
          </div>

          <div className="kitchen-controls">

            <div className="kitchen-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search order or customer..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="kitchen-filter"
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

              <option value="placed">
                Placed
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="ready">
                Ready
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

          </div>

        </div>

        {/* =========================
            ORDERS
            ========================= */}

        <div className="kitchen-orders">

          {filteredOrders.length === 0 ? (

            <div className="kitchen-empty">

              <ChefHat size={48} />

              <h3>
                No kitchen orders
              </h3>

              <p>
                There are no orders matching
                your current filter.
              </p>

            </div>

          ) : (

            filteredOrders.map(
              (order, index) => {

                const status =
                  getStatus(order);

                const items =
                  getItems(order);

                return (
                  <div
                    className="kitchen-order-card"
                    key={getOrderId(order)}
                    style={{
                      animationDelay:
                        `${index * 0.06}s`,
                    }}
                  >

                    {/* TOP */}

                    <div className="kitchen-order-top">

                      <div className="kitchen-token">

                        <span>
                          TOKEN
                        </span>

                        <strong>
                          #{getToken(order)}
                        </strong>

                      </div>

                      <div
                        className={`kitchen-status ${status}`}
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

                    <div className="kitchen-customer">

                      <div className="kitchen-customer-icon">
                        <Utensils
                          size={18}
                        />
                      </div>

                      <div>

                        <strong>
                          {getCustomer(
                            order
                          )}
                        </strong>

                        <span>
                          Order #
                          {getOrderId(
                            order
                          ).slice(-8)}
                        </span>

                      </div>

                    </div>

                    {/* ITEMS */}

                    <div className="kitchen-items">

                      <p>
                        Food Items
                      </p>

                      {items.length > 0 ? (

                        items
                          .slice(0, 3)
                          .map(
                            (
                              item: any,
                              itemIndex: number
                            ) => {

                              const itemName =
                                typeof item ===
                                "string"
                                  ? item
                                  : item.name ||
                                    item.foodName ||
                                    item.itemName ||
                                    "Food Item";

                              const quantity =
                                typeof item ===
                                "object"
                                  ? item.quantity ||
                                    item.qty ||
                                    1
                                  : 1;

                              return (
                                <div
                                  className="kitchen-item"
                                  key={
                                    itemIndex
                                  }
                                >
                                  <span>
                                    {itemName}
                                  </span>

                                  <strong>
                                    ×{quantity}
                                  </strong>
                                </div>
                              );
                            }
                          )

                      ) : (

                        <div className="kitchen-item">
                          <span>
                            Food details
                            unavailable
                          </span>
                        </div>

                      )}

                      {items.length > 3 && (
                        <small>
                          +
                          {items.length -
                            3}{" "}
                          more items
                        </small>
                      )}

                    </div>

                    {/* FOOTER */}

                    <div className="kitchen-order-footer">

                      <div>

                        <span>
                          Order Time
                        </span>

                        <strong>
                          {getDate(order)}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Total
                        </span>

                        <strong>
                          ₹
                          {Number(
                            getTotal(order)
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      <button
                        className="kitchen-view-button"
                        onClick={() => {
                          setSelectedOrder(
                            order
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

      {/* =========================
          ORDER DETAILS MODAL
          ========================= */}

      {showModal &&
        selectedOrder && (

          <div
            className="kitchen-modal-overlay"
            onClick={() =>
              setShowModal(false)
            }
          >

            <div
              className="kitchen-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="kitchen-modal-header">

                <div className="kitchen-modal-title">

                  <div className="kitchen-modal-icon">
                    <ChefHat
                      size={25}
                    />
                  </div>

                  <div>
                    <p>
                      Kitchen Order
                    </p>

                    <h2>
                      Token #
                      {getToken(
                        selectedOrder
                      )}
                    </h2>
                  </div>

                </div>

                <button
                  className="kitchen-modal-close"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="kitchen-modal-body">

                <div className="kitchen-detail-row">

                  <span>
                    Customer
                  </span>

                  <strong>
                    {getCustomer(
                      selectedOrder
                    )}
                  </strong>

                </div>

                <div className="kitchen-detail-row">

                  <span>
                    Order ID
                  </span>

                  <strong>
                    {getOrderId(
                      selectedOrder
                    )}
                  </strong>

                </div>

                <div className="kitchen-detail-row">

                  <span>
                    Restaurant
                  </span>

                  <strong>
                    {selectedOrder
                      .restaurantName ||
                      selectedOrder
                        .restaurantId ||
                      "N/A"}
                  </strong>

                </div>

                <div className="kitchen-detail-row">

                  <span>
                    Order Time
                  </span>

                  <strong>
                    {getDate(
                      selectedOrder
                    )}
                  </strong>

                </div>

                <div className="kitchen-detail-row">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      getTotal(
                        selectedOrder
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div className="kitchen-modal-status">

                  <span>
                    Status
                  </span>

                  <div
                    className={`kitchen-status ${getStatus(
                      selectedOrder
                    )}`}
                  >
                    <StatusIcon
                      status={getStatus(
                        selectedOrder
                      )}
                    />

                    {statusLabel(
                      getStatus(
                        selectedOrder
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

export default Kitchen;