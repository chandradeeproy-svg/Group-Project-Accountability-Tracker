import { NavLink } from "react-router-dom";
const navItems = [
    { label: "🏠 Dashboard", path: "/" },
    { label: "✅ My Tasks", path: "/tasks" },
    { label: "👥 My Groups", path: "/groups" },
];
export default function Sidebar() {
    return (<aside className="app-sidebar">
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {navItems.map((item) => (<NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            {item.label}
          </NavLink>))}
      </nav>
    </aside>);
}
