import { Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <TopNav />

      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar aria-label="Main Navigation" />

        <main
          style={{
            flex: 1,
            backgroundColor: "var(--color-bg)",
            overflowY: "auto",
            position: "relative",
            padding: "2rem",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
