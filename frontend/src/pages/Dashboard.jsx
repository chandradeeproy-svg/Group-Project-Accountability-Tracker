import { useAuth } from "../auth/AuthContext.jsx";
import { useProjects } from "../hooks/useProjectsQuery.js";
import {
  useMyTasks,
  useUpdateTaskStatusMutation,
  useApproveTaskMutation
} from "../hooks/useTasksQuery.js";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useConfirmModal } from "../hooks/useConfirmModal.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
  const { addToast } = useToast();

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useMyTasks();

  const updateTaskMutation = useUpdateTaskStatusMutation();
  const approveTaskMutation = useApproveTaskMutation();

  const handleStatusChange = (taskId, status) => {
    askConfirm(
      "Update Task Status",
      `Change status to ${status}?`,
      () => updateTaskMutation.mutate({ taskId, status })
    );
  };

  const handleApprove = (taskId) => {
    askConfirm(
      "Approve Task",
      "This will mark the task as approved.",
      () => approveTaskMutation.mutate({ taskId })
    );
  };

  const isLoading = projectsLoading || tasksLoading;
  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--color-text-secondary)"
        }}>
          ⏳ Loading Dashboard...
        </div>
      </div>
    );
  }

  if (projectsError || tasksError) {
    return (
      <div className="page-wrapper">
        <div style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderRadius: "12px",
          color: "#ef4444"
        }}>
          <h3>⚠️ Error Loading Dashboard</h3>
          <p>{projectsError?.message || tasksError?.message || "Please try again"}</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(
    (t) => t.status !== "APPROVED" && t.status !== "CANCELLED"
  );

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Dashboard</h1>
      </div>

      <div
        className="glass"
        style={{
          padding: "32px",
          borderRadius: "24px",
          marginBottom: "32px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          background: "rgba(99, 102, 241, 0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "8px",
          }}
        >
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          You have{" "}
          <strong style={{ color: "var(--color-primary)" }}>
            {activeTasks.length}
          </strong>{" "}
          active tasks requiring your attention. Keep up the great work!
        </p>
      </div>

      <div className="grid grid-cols-2">
        <section className="animate-fade">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>My Tasks</h2>
            <Link
              to="/tasks"
              className="btn btn-outline"
              style={{ fontSize: "0.85rem", padding: "6px 12px" }}
            >
              View All
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div
              className="card"
              style={{
                borderStyle: "dashed",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--color-text-tertiary)" }}>
                📋 No tasks assigned to you yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {tasks.slice(0, 5).map((task) => {
                const isOverdue =
                  task.deadline &&
                  new Date(task.deadline) < new Date() &&
                  task.status !== "APPROVED";

                const isMutating =
                  updateTaskMutation.isPending ||
                  approveTaskMutation.isPending;

                return (
                  <div
                    key={task.taskid}
                    className="card"
                    style={{
                      transition: "all 0.2s ease",
                      ...(isOverdue && {
                        borderLeft: "4px solid #ef4444",
                      }),
                      opacity: isMutating ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "12px",
                      }}
                    >
                      <strong style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                        {task.title}
                      </strong>
                      <span className="badge badge-secondary">
                        {task.projectname}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "16px",
                        fontSize: "0.9rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className={
                          isOverdue ? "badge badge-danger" : "badge badge-warning"
                        }
                      >
                        {task.status}
                      </span>

                      {task.deadline && (
                        <span
                          style={{
                            color: isOverdue
                              ? "var(--color-danger)"
                              : "var(--color-text-tertiary)",
                          }}
                        >
                          📅 {new Date(task.deadline).toLocaleDateString()}
                          {isOverdue && <strong> (OVERDUE)</strong>}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      {task.status === "CREATED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            handleStatusChange(task.taskid, "IN_PROGRESS")
                          }
                          disabled={isMutating}
                          style={{
                            opacity: isMutating ? 0.6 : 1,
                            cursor: isMutating ? "not-allowed" : "pointer",
                          }}
                        >
                          {isMutating ? "Updating..." : "Start"}
                        </Button>
                      )}

                      {task.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(task.taskid, "DONE")}
                          disabled={isMutating}
                          style={{
                            opacity: isMutating ? 0.6 : 1,
                            cursor: isMutating ? "not-allowed" : "pointer",
                          }}
                        >
                          {isMutating ? "Updating..." : "Mark Done"}
                        </Button>
                      )}

                      {task.status === "DONE" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(task.taskid)}
                          disabled={isMutating}
                          style={{
                            opacity: isMutating ? 0.6 : 1,
                            cursor: isMutating ? "not-allowed" : "pointer",
                          }}
                        >
                          {isMutating ? "Approving..." : "✅ Approve"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="animate-fade" style={{ animationDelay: "0.1s" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>My Projects</h2>
            <Link
              to="/groups"
              className="btn btn-outline"
              style={{ fontSize: "0.85rem", padding: "6px 12px" }}
            >
              Manage
            </Link>
          </div>

          {projects.length === 0 ? (
            <div
              className="card"
              style={{
                borderStyle: "dashed",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--color-text-tertiary)" }}>
                👥 You are not in any groups yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {projects.map((project) => (
                <Link
                  key={project.projectid}
                  to={`/groups/${project.projectid}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "20px",
                      border: "1px solid var(--color-border)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(99, 102, 241, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "1.1rem",
                          color: "var(--color-primary)",
                        }}
                      >
                        {project.name}
                      </strong>
                      <span className="badge badge-secondary">
                        👤 {project.role}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      Created:{" "}
                      {new Date(project.createdat).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
