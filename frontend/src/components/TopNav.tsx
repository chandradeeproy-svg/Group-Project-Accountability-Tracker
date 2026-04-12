import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { Button } from "./Button";

export default function TopNav() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "64px",
    minHeight: "64px",
    maxHeight: "64px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "20px",
    paddingRight: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    flexWrap: "nowrap",
    overflow: "hidden",
  };

  const logoStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "1.3rem",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  const titleStyle: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingLeft: "20px",
    paddingRight: "20px",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
    flexWrap: "nowrap",
  };

  const avatarStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    minHeight: "40px",
    borderRadius: "8px",
    backgroundColor: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
    flexShrink: 0,
    lineHeight: "1",
  };

  return (
    <header style={headerStyle}>
      {/* Logo */}
      <div style={logoStyle}>📊 GPA</div>

      {/* Title */}
      <h1 style={titleStyle}>Group Project Accountability Tracker</h1>

      {/* Right Section */}
      <div style={rightSectionStyle}>
        <div style={avatarStyle} title={user?.name || "User"}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div
          style={{
            fontSize: "0.85rem",
            borderRight: "1px solid #e5e7eb",
            paddingRight: "16px",
            flexShrink: 0,
            lineHeight: "1.3",
            minWidth: "0",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.email}
          </div>
        </div>

        <Button
          size="sm"
          variant="danger"
          onClick={() => setShowLogoutModal(true)}
        >
          Logout
        </Button>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
        confirmText="Yes, Logout"
        type="danger"
        onConfirm={logout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
