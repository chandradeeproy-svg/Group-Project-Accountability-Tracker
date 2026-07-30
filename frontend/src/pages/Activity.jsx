import { useParams } from "react-router-dom";
import ActivityFeed from "../components/ActivityFeed.jsx";

export default function Activity() {
  const { projectId } = useParams();

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Project Activity</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          View the complete history of all actions in this project
        </p>
      </div>

      {projectId ? (
        <ActivityFeed projectId={projectId} />
      ) : (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderRadius: "12px",
          color: "#ef4444",
        }}>
          <p>Please select a project to view its activity</p>
        </div>
      )}
    </div>
  );
}
