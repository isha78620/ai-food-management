import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Utensils,
  ChefHat,
  Truck,
  Package,
  Carrot,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  X,
  BarChart3,
} from "lucide-react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingBag,
    },
    {
      name: "Restaurants",
      path: "/restaurants",
      icon: Store,
    },
    {
      name: "Foods",
      icon: Utensils,
      path: "/foods",
    },
    {
      name: "Kitchen",
      path: "/kitchen",
      icon: ChefHat,
    },
    {
      name: "Deliveries",
      path: "/deliveries",
      icon: Truck,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
    },
    {
      name: "Ingredients",
      path: "/ingredients",
      icon: Carrot,
    },
    {
      name: "Feedback",
      path: "/feedback",
      icon: MessageSquare,
    },
    {
      name: "AI Analysis",
      path: "/ai-analysis",
      icon: Bot,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);

    // Real authentication logout will be connected here later.
    console.log("Logout clicked");
  };

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* ================= LOGO ================= */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-image">
            <img
              src="/logo.png"
              alt="AI Food Management Logo"
            />
          </div>

          <div className="logo-text">
            <h2>Smart </h2>
            <span>FoodCourt</span>
          </div>

          {/* Mobile Close */}
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-title">
            MAIN MENU
          </p>

          <div className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive
                        ? "sidebar-link-active"
                        : ""
                    }`
                  }
                >
                  <Icon
                    size={19}
                    strokeWidth={2}
                  />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ================= BOTTOM MENU ================= */}
        <div className="sidebar-bottom">

          {/* SETTINGS */}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
          >
            <Settings
              size={19}
              strokeWidth={2}
            />

            <span>Settings</span>
          </NavLink>

          {/* LOGOUT */}
          <button
            className="sidebar-logout"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut
              size={19}
              strokeWidth={2}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div
          className="logout-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ICON */}
            <div className="logout-icon">
              <LogOut size={24} />
            </div>

            {/* TITLE */}
            <h2>Logout?</h2>

            {/* MESSAGE */}
            <p>
              Are you sure you want to logout
              from your account?
            </p>

            {/* BUTTONS */}
            <div className="logout-actions">

              <button
                type="button"
                className="logout-cancel"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;