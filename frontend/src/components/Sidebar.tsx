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

import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

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
            <h2>AI Food</h2>
            <span>Management</span>
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
                  <Icon size={19} strokeWidth={2} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ================= BOTTOM MENU ================= */}
        <div className="sidebar-bottom">
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
            <Settings size={19} strokeWidth={2} />
            <span>Settings</span>
          </NavLink>

          <button className="sidebar-logout">
            <LogOut size={19} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;