import { useAuth } from "../auth/AuthContext";
import { useState, useEffect } from "react";
import { getProjects } from "../api/projectsApi";
import { getMyTasks, updateTaskStatus, approveTask } from "../api/tasksApi";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";

export default function Dashboard() {
  const { token, user } = useAuth();
  const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    Promise.all([getProjects(token), getMyTasks(token)])
      .then(([projectsData, tasksData]) => {
        setProjects(projectsData);
        setTasks(tasksData);
      })
      .catch((error) => {
        addToast("Failed to load dashboard", "error");
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [token, addToast]);

  const handleStatusChange = async (
    taskId: string,
    status: "IN_PROGRESS" | "DONE" | "CANCELLED",
  ) => {
    if (!token) return;
    try {
      await updateTaskStatus(taskId, status, token);
      const tasksData = await getMyTasks(token);
      setTasks(tasksData);
      addToast("Task status updated", "success");
    } catch (error) {
      addToast("Failed to update task status", "error");
      console.error("Failed to update status:", error);
    }
  };

  const handleApprove = async (taskId: string) => {
    if (!token) return;
    try {
      await approveTask(taskId, token);
      const tasksData = await getMyTasks(token);
      setTasks(tasksData);
      addToast("Task approved", "success");
    } catch (error) {
      addToast("Failed to approve task", "error");
      console.error("Failed to approve:", error);
    }
  };

  if (loading)
    return <div style={{ padding: "20px" }}>Loading Dashboard...</div>;

  const activeTasks = tasks.filter(
    (t) => t.status !== "APPROVED" && t.status !== "CANCELLED",
  );

  const dashboardStyle: React.CSSProperties = {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "30px",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "10px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: "40px 20px",
    textAlign: "center",
    border: "2px dashed #e5e7eb",
    borderRadius: "8px",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
  };

  const welcomeBoxStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: "#f0f9ff",
    borderLeft: "4px solid #4f46e5",
    borderRadius: "6px",
    marginBottom: "25px",
  };

  const taskListStyle: React.CSSProperties = {
    maxHeight: "500px",
    overflowY: "auto",
  };

  const projectCardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    marginBottom: "10px",
    transition: "box-shadow 0.2s ease",
  };

  return (
    <div style={dashboardStyle}>
      <h1 style={{ marginBottom: "25px", fontSize: "2rem", color: "#111827" }}>
        Dashboard
      </h1>

      <div style={welcomeBoxStyle}>
        <h2
          style={{ margin: "0 0 8px 0", fontSize: "1.2rem", color: "#1e40af" }}
        >
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ margin: 0, color: "#475569" }}>
          You have <strong>{activeTasks.length}</strong> active tasks requiring
          your attention.
        </p>
      </div>

      <div style={gridStyle}>
        <section style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
              My Tasks
            </h2>
            <Link
              to="/tasks"
              style={{
                fontSize: "0.9em",
                color: "#4f46e5",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View All →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0 }}>📋 No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div style={taskListStyle}>
              {tasks.slice(0, 5).map((task) => {
                const isOverdue =
                  task.deadline &&
                  new Date(task.deadline) < new Date() &&
                  task.status !== "APPROVED";

                const statusColor = isOverdue ? "#ef4444" : "#6b7280";

                return (
                  <div key={task.taskid} style={projectCardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "10px",
                        gap: "8px",
                      }}
                    >
                      <strong
                        style={{
                          color: "#111827",
                          fontSize: "0.95rem",
                          flex: 1,
                        }}
                      >
                        {task.title}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.75em",
                          color: "#666",
                          padding: "3px 8px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.projectname}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "#6b7280",
                        marginBottom: "8px",
                      }}
                    >
                      Status:{" "}
                      <span style={{ fontWeight: 600, color: statusColor }}>
                        {task.status}
                      </span>
                    </div>

                    {task.deadline && (
                      <div
                        style={{
                          fontSize: "0.85em",
                          marginBottom: "10px",
                          color: statusColor,
                        }}
                      >
                        📅 {new Date(task.deadline).toLocaleDateString()}
                        {isOverdue && (
                          <span style={{ fontWeight: 700 }}> (OVERDUE)</span>
                        )}
                      </div>
                    )}

                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {task.status === "CREATED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            askConfirm(
                              "Start Task",
                              "Are you sure you want to start this task?",
                              () =>
                                handleStatusChange(task.taskid, "IN_PROGRESS"),
                              "primary",
                            )
                          }
                        >
                          Start
                        </Button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            askConfirm(
                              "Mark Task Done",
                              "Are you sure you have completed this task?",
                              () => handleStatusChange(task.taskid, "DONE"),
                              "success",
                            )
                          }
                        >
                          Mark Done
                        </Button>
                      )}
                      {task.projectownerid === user?.id &&
                        task.status === "DONE" && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              askConfirm(
                                "Approve Task",
                                "Are you sure you want to approve this task completion?",
                                () => handleApprove(task.taskid),
                                "success",
                              )
                            }
                          >
                            Approve Task
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
              My Project Groups
            </h2>
            <Link
              to="/groups"
              style={{
                fontSize: "0.9em",
                color: "#4f46e5",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Manage →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0 }}>👥 You are not in any groups yet.</p>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.projectid}
                to={`/groups/${project.projectid}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    ...projectCardStyle,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <strong style={{ color: "#4f46e5", fontSize: "0.95rem" }}>
                      {project.name}
                    </strong>
                  </div>
                  <div
                    style={{
                      fontSize: "0.85em",
                      color: "#6b7280",
                      marginBottom: "5px",
                    }}
                  >
                    👤 Role: {project.role}
                  </div>
                  <div style={{ fontSize: "0.75em", color: "#9ca3af" }}>
                    Created: {new Date(project.createdat).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeModal}
        type={confirmConfig.type}
      />
    </div>
  );
}
