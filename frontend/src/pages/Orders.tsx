import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import api from "../services/api";

interface OrderItem {
  foodName?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  _id?: string;
  id?: string;
  orderId?: string;

  customerName?: string;
  customer?: string;

  restaurantName?: string;
  restaurant?: string;

  status?: string;

  totalAmount?: number;
  total?: number;
  amount?: number;

  items?: OrderItem[];

  createdAt?: string;
  created_at?: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  /* =========================
     LOAD ORDERS
     ========================= */

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/orders");

      /*
        Supports both:

        [
          {...},
          {...}
        ]

        and:

        {
          orders: [...]
        }
      */

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* =========================
     FILTER ORDERS
     ========================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer =
        order.customerName ||
        order.customer ||
        "";

      const restaurant =
        order.restaurantName ||
        order.restaurant ||
        "";

      const orderId =
        order.orderId ||
        order._id ||
        order.id ||
        "";

      const status =
        order.status?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        customer.toLowerCase().includes(searchText) ||
        restaurant.toLowerCase().includes(searchText) ||
        orderId.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  /* =========================
     STATUS CLASS
     ========================= */

  const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "placed":
        return "order-status placed";

      case "accepted":
        return "order-status accepted";

      case "preparing":
        return "order-status preparing";

      case "ready":
        return "order-status ready";

      case "completed":
        return "order-status completed";

      case "cancelled":
        return "order-status cancelled";

      default:
        return "order-status";
    }
  };

  /* =========================
     FORMAT STATUS
     ========================= */

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  /* =========================
     ORDER ID
     ========================= */

  const getOrderId = (order: Order) => {
    return (
      order.orderId ||
      order._id ||
      order.id ||
      "N/A"
    );
  };

  /* =========================
     CUSTOMER
     ========================= */

  const getCustomerName = (order: Order) => {
    return (
      order.customerName ||
      order.customer ||
      "Customer"
    );
  };

  /* =========================
     RESTAURANT
     ========================= */

  const getRestaurantName = (order: Order) => {
    return (
      order.restaurantName ||
      order.restaurant ||
      "Restaurant"
    );
  };

  /* =========================
     AMOUNT
     ========================= */

  const getAmount = (order: Order) => {
    return (
      order.totalAmount ??
      order.total ??
      order.amount ??
      0
    );
  };

  /* =========================
     DATE
     ========================= */

  const getDate = (order: Order) => {
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
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "N/A";
    }
  };

  /* =========================
     UPDATE ORDER STATUS
     ========================= */

  const updateOrderStatus = async (
    order: Order,
    newStatus: string
  ) => {
    const orderId =
      order._id ||
      order.id ||
      order.orderId;

    if (!orderId) {
      alert("Order ID not found.");
      return;
    }

    try {
      setUpdatingStatus(true);

      await api.patch(
        `/api/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      /* Update table */

      setOrders((prevOrders) =>
        prevOrders.map((item) => {
          const itemId =
            item._id ||
            item.id ||
            item.orderId;

          if (itemId === orderId) {
            return {
              ...item,
              status: newStatus,
            };
          }

          return item;
        })
      );

      /* Update modal */

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
            }
          : null
      );

    } catch (err) {
      console.error(
        "Failed to update order status:",
        err
      );

      alert(
        "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =========================
     SUMMARY COUNTS
     ========================= */

  const totalOrders = orders.length;

  const placedOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "placed"
  ).length;

  const preparingOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "preparing"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "completed"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "cancelled"
  ).length;

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="orders-page">

        <div className="orders-loading">

          <RefreshCw
            size={30}
            className="orders-spin"
          />

          <p>
            Loading orders...
          </p>

        </div>

      </div>
    );
  }

  /* =========================
     PAGE
     ========================= */

  return (
    <div className="orders-page">

      {/* =========================
          HEADER
          ========================= */}

      <div className="orders-header">

        <div>

          <p className="orders-welcome">
            Manage your restaurant orders
          </p>

          <h1>
            Orders
          </h1>

          <p className="orders-subtitle">
            View, track and manage all customer
            orders.
          </p>

        </div>

        <button
          className="orders-refresh-button"
          onClick={loadOrders}
        >

          <RefreshCw size={18} />

          Refresh

        </button>

      </div>

      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="orders-error">
          {error}
        </div>
      )}

      {/* =========================
          SUMMARY CARDS
          ========================= */}

      <div className="orders-summary-grid">

        {/* Total */}

        <div className="orders-summary-card">

          <div className="orders-summary-icon total">
            <ShoppingBag size={22} />
          </div>

          <div>
            <p>
              Total Orders
            </p>

            <h2>
              {totalOrders}
            </h2>
          </div>

        </div>

        {/* Placed */}

        <div className="orders-summary-card">

          <div className="orders-summary-icon placed">
            <Clock size={22} />
          </div>

          <div>
            <p>
              Placed
            </p>

            <h2>
              {placedOrders}
            </h2>
          </div>

        </div>

        {/* Preparing */}

        <div className="orders-summary-card">

          <div className="orders-summary-icon preparing">
            <ChefHat size={22} />
          </div>

          <div>
            <p>
              Preparing
            </p>

            <h2>
              {preparingOrders}
            </h2>
          </div>

        </div>

        {/* Completed */}

        <div className="orders-summary-card">

          <div className="orders-summary-icon completed">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>
              Completed
            </p>

            <h2>
              {completedOrders}
            </h2>
          </div>

        </div>

        {/* Cancelled */}

        <div className="orders-summary-card">

          <div className="orders-summary-icon cancelled">
            <XCircle size={22} />
          </div>

          <div>
            <p>
              Cancelled
            </p>

            <h2>
              {cancelledOrders}
            </h2>
          </div>

        </div>

      </div>

      {/* =========================
          ORDERS SECTION
          ========================= */}

      <div className="orders-container">

        {/* =========================
            TOOLBAR
            ========================= */}

        <div className="orders-toolbar">

          <div className="orders-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search by order, customer or restaurant..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            className="orders-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="all">
              All Status
            </option>

            <option value="placed">
              Placed
            </option>

            <option value="accepted">
              Accepted
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

        {/* =========================
            TABLE
            ========================= */}

        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>

              <tr>
                <th>
                  Order ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Restaurant
                </th>

                <th>
                  Items
                </th>

                <th>
                  Total
                </th>

                <th>
                  Status
                </th>

                <th>
                  Date
                </th>

                <th>
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="orders-empty"
                  >

                    <ShoppingBag size={40} />

                    <h3>
                      No orders found
                    </h3>

                    <p>
                      There are no orders
                      matching your search.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredOrders.map(
                  (order) => (

                    <tr
                      key={getOrderId(order)}
                    >

                      {/* Order ID */}

                      <td>

                        <span className="order-id">

                          #
                          {getOrderId(
                            order
                          ).slice(-8)}

                        </span>

                      </td>

                      {/* Customer */}

                      <td>

                        <div className="customer-info">

                          <div className="customer-avatar">

                            {getCustomerName(
                              order
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <span>
                            {getCustomerName(
                              order
                            )}
                          </span>

                        </div>

                      </td>

                      {/* Restaurant */}

                      <td>

                        <span className="restaurant-name">

                          {getRestaurantName(
                            order
                          )}

                        </span>

                      </td>

                      {/* Items */}

                      <td>

                        <div className="order-items">

                          {order.items &&
                          order.items.length > 0 ? (

                            <>

                              {order.items
                                .slice(0, 2)
                                .map(
                                  (
                                    item,
                                    index
                                  ) => (

                                    <span
                                      key={index}
                                    >

                                      {item.foodName ||
                                        item.name ||
                                        "Food"}

                                      {" × "}

                                      {item.quantity ||
                                        1}

                                    </span>

                                  )
                                )}

                              {order.items.length >
                                2 && (

                                <small>

                                  +
                                  {order.items
                                    .length -
                                    2}{" "}
                                  more

                                </small>

                              )}

                            </>

                          ) : (

                            <span>
                              No item details
                            </span>

                          )}

                        </div>

                      </td>

                      {/* Total */}

                      <td>

                        <strong className="order-total">

                          ₹
                          {Number(
                            getAmount(order)
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>

                      {/* Status */}

                      <td>

                        <span
                          className={getStatusClass(
                            order.status
                          )}
                        >

                          {formatStatus(
                            order.status
                          )}

                        </span>

                      </td>

                      {/* Date */}

                      <td>

                        <span className="order-date">

                          {getDate(
                            order
                          )}

                        </span>

                      </td>

                      {/* Action */}

                      <td>

                        <button
                          className="order-view-button"
                          title="View order"
                          onClick={() => {

                            setSelectedOrder(
                              order
                            );

                            setShowOrderModal(
                              true
                            );

                          }}
                        >

                          <Eye size={17} />

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          ORDER DETAILS MODAL
          ========================= */}

      {showOrderModal &&
        selectedOrder && (

          <div
            className="order-modal-overlay"
            onClick={() =>
              setShowOrderModal(false)
            }
          >

            <div
              className="order-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* =========================
                  MODAL HEADER
                  ========================= */}

              <div className="order-modal-header">

                <div>

                  <p>
                    Order Details
                  </p>

                  <h2>

                    #
                    {getOrderId(
                      selectedOrder
                    ).slice(-8)}

                  </h2>

                </div>

                <button
                  className="order-modal-close"
                  onClick={() =>
                    setShowOrderModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              {/* =========================
                  CUSTOMER + RESTAURANT
                  ========================= */}

              <div className="order-modal-info">

                <div className="order-info-box">

                  <span>
                    Customer
                  </span>

                  <strong>
                    {getCustomerName(
                      selectedOrder
                    )}
                  </strong>

                </div>

                <div className="order-info-box">

                  <span>
                    Restaurant
                  </span>

                  <strong>
                    {getRestaurantName(
                      selectedOrder
                    )}
                  </strong>

                </div>

              </div>

              {/* =========================
                  ORDER ITEMS
                  ========================= */}

              <div className="order-modal-section">

                <h3>
                  Order Items
                </h3>

                <div className="modal-items">

                  {selectedOrder.items &&
                  selectedOrder.items.length >
                    0 ? (

                    selectedOrder.items.map(
                      (item, index) => (

                        <div
                          className="modal-item"
                          key={index}
                        >

                          <div>

                            <strong>

                              {item.foodName ||
                                item.name ||
                                "Food Item"}

                            </strong>

                            <span>

                              ×{" "}
                              {item.quantity ||
                                1}

                            </span>

                          </div>

                          <strong>

                            ₹
                            {(
                              Number(
                                item.price ||
                                  0
                              ) *
                              Number(
                                item.quantity ||
                                  1
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </div>

                      )
                    )

                  ) : (

                    <p className="modal-no-items">

                      No item details
                      available.

                    </p>

                  )}

                </div>

              </div>

              {/* =========================
                  TOTAL
                  ========================= */}

              <div className="modal-total">

                <span>
                  Total Amount
                </span>

                <strong>

                  ₹
                  {Number(
                    getAmount(
                      selectedOrder
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

              {/* =========================
                  STATUS TIMELINE
                  ========================= */}

              <div className="order-modal-section">

                <h3>
                  Order Status
                </h3>

                <div className="order-timeline">

                  {/* Placed */}

                  <div
                    className={`timeline-step ${
                      [
                        "placed",
                        "accepted",
                        "preparing",
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      1
                    </span>

                    <p>
                      Placed
                    </p>

                  </div>

                  {/* Line */}

                  <div
                    className={`timeline-line ${
                      [
                        "accepted",
                        "preparing",
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  />

                  {/* Accepted */}

                  <div
                    className={`timeline-step ${
                      [
                        "accepted",
                        "preparing",
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      2
                    </span>

                    <p>
                      Accepted
                    </p>

                  </div>

                  {/* Line */}

                  <div
                    className={`timeline-line ${
                      [
                        "preparing",
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  />

                  {/* Preparing */}

                  <div
                    className={`timeline-step ${
                      [
                        "preparing",
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      3
                    </span>

                    <p>
                      Preparing
                    </p>

                  </div>

                  {/* Line */}

                  <div
                    className={`timeline-line ${
                      [
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  />

                  {/* Ready */}

                  <div
                    className={`timeline-step ${
                      [
                        "ready",
                        "completed",
                      ].includes(
                        selectedOrder.status?.toLowerCase() ||
                          ""
                      )
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      4
                    </span>

                    <p>
                      Ready
                    </p>

                  </div>

                  {/* Line */}

                  <div
                    className={`timeline-line ${
                      selectedOrder.status?.toLowerCase() ===
                      "completed"
                        ? "active"
                        : ""
                    }`}
                  />

                  {/* Completed */}

                  <div
                    className={`timeline-step ${
                      selectedOrder.status?.toLowerCase() ===
                      "completed"
                        ? "active"
                        : ""
                    }`}
                  >

                    <span>
                      ✓
                    </span>

                    <p>
                      Completed
                    </p>

                  </div>

                </div>

              </div>

              {/* =========================
                  UPDATE STATUS
                  ========================= */}

              <div className="order-status-actions">

                <h3>
                  Manage Order
                </h3>

                <div className="status-action-buttons">

                  {/* Placed → Accepted */}

                  {selectedOrder.status?.toLowerCase() ===
                    "placed" && (

                    <button
                      className="status-action-button accept"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder,
                          "accepted"
                        )
                      }
                    >

                      {updatingStatus
                        ? "Updating..."
                        : "Accept Order"}

                    </button>

                  )}

                  {/* Accepted → Preparing */}

                  {selectedOrder.status?.toLowerCase() ===
                    "accepted" && (

                    <button
                      className="status-action-button preparing"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder,
                          "preparing"
                        )
                      }
                    >

                      {updatingStatus
                        ? "Updating..."
                        : "Start Preparing"}

                    </button>

                  )}

                  {/* Preparing → Ready */}

                  {selectedOrder.status?.toLowerCase() ===
                    "preparing" && (

                    <button
                      className="status-action-button ready"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder,
                          "ready"
                        )
                      }
                    >

                      {updatingStatus
                        ? "Updating..."
                        : "Mark Ready"}

                    </button>

                  )}

                  {/* Ready → Completed */}

                  {selectedOrder.status?.toLowerCase() ===
                    "ready" && (

                    <button
                      className="status-action-button complete"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder,
                          "completed"
                        )
                      }
                    >

                      {updatingStatus
                        ? "Updating..."
                        : "Complete Order"}

                    </button>

                  )}

                  {/* Completed */}

                  {selectedOrder.status?.toLowerCase() ===
                    "completed" && (

                    <p className="order-status-message success">

                      ✓ This order has been
                      completed.

                    </p>

                  )}

                  {/* Cancelled */}

                  {selectedOrder.status?.toLowerCase() ===
                    "cancelled" && (

                    <p className="order-status-message cancelled">

                      This order was cancelled.

                    </p>

                  )}

                </div>

              </div>

              {/* =========================
                  FOOTER
                  ========================= */}

              <div className="order-modal-footer">

                <span>
                  {getDate(
                    selectedOrder
                  )}
                </span>

                <span
                  className={getStatusClass(
                    selectedOrder.status
                  )}
                >

                  {formatStatus(
                    selectedOrder.status
                  )}

                </span>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Orders;