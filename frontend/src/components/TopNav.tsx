import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { Button } from "./Button";

export default function TopNav() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <header className="app-header">
      {/* Logo */}
      <div 
        style={{ 
          fontWeight: 800, 
          fontSize: "1.5rem", 
          background: "linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.03em",
        }}
      >
        GPA Tracker 🎯
      </div>

      {/* Title - Hidden on small screens */}
      <h1 
        style={{ 
          flex: 1, 
          textAlign: "center", 
          fontSize: "0.95rem", 
          fontWeight: 600, 
          color: "var(--color-text-tertiary)", 
          margin: 0,
          opacity: 0.8
        }}
        className="hide-mobile"
      >
        Group Project Accountability
      </h1>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRight: "1px solid var(--color-border)", paddingRight: "20px" }}>
          <div 
            style={{ 
              width: "36px", height: "36px", 
              borderRadius: "10px", 
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.9rem"
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div style={{ lineHeight: "1.2" }} className="hide-mobile">
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{user?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{user?.email}</div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLogoutModal(true)}
          style={{ fontSize: "0.8rem", padding: "6px 12px" }}
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
