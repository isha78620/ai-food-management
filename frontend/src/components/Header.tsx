import {
  Menu,
  Bell,
  User,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="top-header">

      {/* Mobile Menu Button */}
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Page Brand */}
      <div className="header-brand">
        <div className="header-brand-icon">
          <span>🍴</span>
        </div>

        <div>
          <h2>AI Food Management</h2>
          <p>Smart Restaurant Management</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="header-actions">

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="notification-dot"></span>
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            <User size={19} />
          </div>

          <div className="admin-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;