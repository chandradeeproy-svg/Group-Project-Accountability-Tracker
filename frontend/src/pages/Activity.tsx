import { useAuth } from "../auth/AuthContext";
import { useState, useEffect } from "react";
import { getAllActivity } from "../api/tasksApi";

export default function Activity() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAllActivity(token)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page-wrapper"><div className="text-center">Loading activity...</div></div>;

  return (
    <div className="page-wrapper fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Recent Activity</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          Comprehensive timeline of actions across all your projects.
        </p>
      </div>
      
      {activities.length === 0 ? (
        <div className="card text-center" style={{ borderStyle: "dashed", padding: "64px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔭</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>No activity yet</h2>
          <p style={{ color: "var(--color-text-tertiary)" }}>Activity for all group members will appear here as tasks are managed.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activities.map((event: any) => (
            <div key={event.event_id} className="card accent-border" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>{event.projectname}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>{new Date(event.timestamp).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "1rem", color: "var(--color-text-primary)" }}>
                <strong style={{ color: "var(--color-primary)" }}>{event.username || "System"}</strong> 
                <span style={{ marginLeft: "8px" }}>
                  {event.type === 'TASK_CREATED' && `📝 created task: ${event.metadata?.title || "New Task"}`}
                  {event.type === 'TASK_STATUS_CHANGED' && `✏️ changed status to ${event.metadata?.to}`}
                  {event.type === 'TASK_APPROVED' && `✅ approved a task completion.`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
