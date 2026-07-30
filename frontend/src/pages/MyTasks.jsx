import { useAuth } from "../auth/AuthContext.jsx";
import { useMyTasks, useUpdateTaskStatusMutation } from "../hooks/useTasksQuery.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useConfirmModal } from "../hooks/useConfirmModal.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";

export default function MyTasks() {
  const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
  const { addToast } = useToast();

  const { data: tasks = [], isLoading, error } = useMyTasks();

  const updateTaskMutation = useUpdateTaskStatusMutation();

  const handleStatusChange = (taskId, status, statusText) => {
    askConfirm(
      `Update Task Status`,
      `Change status to ${statusText}?`,
      () => updateTaskMutation.mutate({ taskId, status })
    );
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
          ⏳ Loading tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderRadius: "12px",
          color: "#ef4444",
        }}>
          <h3>⚠️ Error Loading Tasks</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in" style={{ maxWidth: "1000px" }}>
      <div style={{
        marginBottom: "32px",
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "24px",
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>
          My Tasks
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          Manage all tasks assigned to you across all active projects.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center glass" style={{
          padding: "80px 40px",
          borderStyle: "dashed",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🏖️</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
            No tasks assigned
          </h2>
          <p style={{ color: "var(--color-text-tertiary)" }}>
            You're all caught up for now!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {tasks.map((task) => {
            const isOverdue =
              task.deadline &&
              new Date(task.deadline) < new Date() &&
              task.status !== "APPROVED" &&
              task.status !== "DONE";

            const isLoading = updateTaskMutation.isPending;

            return (
              <div
                key={task.taskid}
                className="card animate-fade"
                style={{
                  transition: "all 0.2s ease",
                  ...(isOverdue && { borderLeft: "4px solid #ef4444" }),
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "24px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-primary)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px",
                      }}
                    >
                      {task.projectname}
                    </div>

                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        marginBottom: "12px",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {task.title}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className={`badge ${
                          task.status === "APPROVED"
                            ? "badge-success"
                            : task.status === "DONE"
                            ? "badge-success"
                            : task.status === "IN_PROGRESS"
                            ? "badge-warning"
                            : "badge-secondary"
                        }`}
                      >
                        {task.status}
                      </span>

                      {task.deadline && (
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: isOverdue
                              ? "var(--color-danger)"
                              : "var(--color-text-tertiary)",
                            fontWeight: isOverdue ? 700 : 400,
                          }}
                        >
                          📅 {new Date(task.deadline).toLocaleDateString()}
                          {isOverdue && " (OVERDUE)"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    {task.status === "CREATED" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          handleStatusChange(task.taskid, "IN_PROGRESS", "In Progress")
                        }
                        disabled={isLoading}
                        style={{
                          opacity: isLoading ? 0.6 : 1,
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {isLoading ? "Updating..." : "Start Task"}
                      </Button>
                    )}

                    {task.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          handleStatusChange(task.taskid, "DONE", "Done")
                        }
                        disabled={isLoading}
                        style={{
                          opacity: isLoading ? 0.6 : 1,
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {isLoading ? "Updating..." : "Mark Done"}
                      </Button>
                    )}

                    {(task.status === "APPROVED" || task.status === "DONE") && (
                      <div
                        className="badge badge-success"
                        style={{
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        ✅ {task.status === "APPROVED" ? "Approved" : "Completed"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
