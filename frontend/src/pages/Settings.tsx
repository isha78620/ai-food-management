import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const [adminName, setAdminName] = useState("Admin");
  const [email, setEmail] = useState("admin@aifood.com");
  const [phone, setPhone] = useState("+91 98765 43210");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifications, setNotifications] = useState({
    newOrders: true,
    delivery: true,
    lowStock: true,
    feedback: true,
    aiInsights: false,
  });

const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("smartFoodCourtDarkMode") === "true";
});
  const [message, setMessage] = useState("");

//  const [darkMode, setDarkMode] = useState(() => {
//   return localStorage.getItem("smartFoodCourtDarkMode") === "true";
// });

useEffect(() => {
  document.documentElement.classList.toggle(
    "dark-mode",
    darkMode
  );

  localStorage.setItem(
    "smartFoodCourtDarkMode",
    String(darkMode)
  );
}, [darkMode]);

  const showSavedMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSavedMessage("Profile settings saved successfully.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !newPassword || !confirmPassword) {
      showSavedMessage("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSavedMessage("New password and confirm password do not match.");
      return;
    }

    showSavedMessage("Password changed successfully.");

    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleNotificationChange = (
    key: keyof typeof notifications
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences</p>
        </div>
      </div>

      {/* Saved Message */}
      {message && (
        <div className="settings-success">
          <CheckCircle2 size={20} />
          <span>{message}</span>
        </div>
      )}

      <div className="settings-layout">

        {/* LEFT SETTINGS MENU */}
        <div className="settings-menu">

          <button
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            <User size={20} />
            <div>
              <strong>Profile</strong>
              <span>Personal information</span>
            </div>
          </button>

          <button
            className={activeSection === "security" ? "active" : ""}
            onClick={() => setActiveSection("security")}
          >
            <Lock size={20} />
            <div>
              <strong>Security</strong>
              <span>Password & account</span>
            </div>
          </button>

          <button
            className={activeSection === "notifications" ? "active" : ""}
            onClick={() => setActiveSection("notifications")}
          >
            <Bell size={20} />
            <div>
              <strong>Notifications</strong>
              <span>Alert preferences</span>
            </div>
          </button>

          <button
            className={activeSection === "appearance" ? "active" : ""}
            onClick={() => setActiveSection("appearance")}
          >
            <Palette size={20} />
            <div>
              <strong>Appearance</strong>
              <span>Theme preferences</span>
            </div>
          </button>

        </div>

        {/* RIGHT CONTENT */}
        <div className="settings-content">

          {/* PROFILE */}
          {activeSection === "profile" && (
            <div className="settings-card">

              <div className="section-heading">
                <div className="section-icon">
                  <User size={22} />
                </div>

                <div>
                  <h2>Admin Profile</h2>
                  <p>Update your personal account information.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave}>

                <div className="profile-top">

                  <div className="profile-avatar">
                    {adminName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{adminName}</h3>
                    <p>System Administrator</p>
                  </div>

                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Admin Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Enter admin name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value="System Administrator"
                      disabled
                    />
                  </div>

                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="settings-card">

              <div className="section-heading">
                <div className="section-icon">
                  <Lock size={22} />
                </div>

                <div>
                  <h2>Security</h2>
                  <p>Keep your administrator account secure.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange}>

                <div className="password-section">

                  <div className="form-group">
                    <label>Current Password</label>

                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter current password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                </div>

                <div className="security-note">
                  <Lock size={18} />
                  <span>
                    Use a strong password containing letters, numbers,
                    and special characters.
                  </span>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    <Lock size={18} />
                    Change Password
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="settings-card">

              <div className="section-heading">
                <div className="section-icon">
                  <Bell size={22} />
                </div>

                <div>
                  <h2>Notifications</h2>
                  <p>Choose which notifications you want to receive.</p>
                </div>
              </div>

              <div className="notification-list">

                <div className="notification-item">
                  <div>
                    <h3>New Orders</h3>
                    <p>Get notified when a new order is placed.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.newOrders}
                      onChange={() =>
                        handleNotificationChange("newOrders")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div>
                    <h3>Delivery Updates</h3>
                    <p>Receive updates about delivery status.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.delivery}
                      onChange={() =>
                        handleNotificationChange("delivery")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div>
                    <h3>Low Stock Alerts</h3>
                    <p>Get alerts when inventory reaches a low level.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.lowStock}
                      onChange={() =>
                        handleNotificationChange("lowStock")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div>
                    <h3>Customer Feedback</h3>
                    <p>Receive notifications for new feedback.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.feedback}
                      onChange={() =>
                        handleNotificationChange("feedback")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div>
                    <h3>AI Business Insights</h3>
                    <p>Receive updates about AI-generated insights.</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.aiInsights}
                      onChange={() =>
                        handleNotificationChange("aiInsights")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  onClick={() =>
                    showSavedMessage(
                      "Notification preferences saved successfully."
                    )
                  }
                >
                  <Save size={18} />
                  Save Preferences
                </button>
              </div>

            </div>
          )}

          {/* APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="settings-card">

              <div className="section-heading">
                <div className="section-icon">
                  <Palette size={22} />
                </div>

                <div>
                  <h2>Appearance</h2>
                  <p>Customize the appearance of your dashboard.</p>
                </div>
              </div>

              <div className="appearance-option">

                <div>
                  <h3>Dark Mode</h3>
                  <p>
                    Use a darker interface for your dashboard.
                  </p>
                </div>

                <label className="switch">
                 <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>

              </div>

              <div className="theme-preview">

                <div className="preview-header">
                  <span>Dashboard Theme</span>
                  <span className="gold-dot"></span>
                </div>

                <div className="preview-body">

                  <div className="preview-sidebar">
                    <div className="preview-logo"></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="preview-main">
                    <div className="preview-card"></div>
                    <div className="preview-card small"></div>
                  </div>

                </div>

              </div>

              <div className="theme-info">
                <Palette size={18} />
                <span>
                  Current dashboard theme uses the orange and golden
                  accent design.
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;