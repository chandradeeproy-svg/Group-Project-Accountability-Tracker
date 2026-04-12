import { NavLink } from "react-router-dom";

const navItems = [
  { label: "🏠 Dashboard", path: "/" },
  { label: "✅ My Tasks", path: "/tasks" },
  { label: "👥 My Groups", path: "/groups" },
  { label: "📊 Scores", path: "/scores" },
];

export default function Sidebar() {
  const sidebarStyle: React.CSSProperties = {
    width: "220px",
    borderRight: "1px solid #e5e7eb",
    padding: "20px 12px",
    backgroundColor: "#ffffff",
    height: "calc(100vh - 64px)",
    overflowY: "auto",
    position: "sticky",
    top: "64px",
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    marginBottom: "6px",
    textDecoration: "none",
    color: isActive ? "#4f46e5" : "#6b7280",
    backgroundColor: isActive ? "#f0f4ff" : "transparent",
    borderLeft: isActive ? "3px solid #4f46e5" : "3px solid transparent",
    borderRadius: "4px",
    fontWeight: isActive ? 600 : 500,
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    cursor: "pointer",
  });

  return (
    <aside style={sidebarStyle}>
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
