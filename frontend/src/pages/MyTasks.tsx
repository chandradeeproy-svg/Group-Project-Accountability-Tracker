import { useAuth } from "../auth/AuthContext";
import { useState, useEffect } from "react";
import { getMyTasks, updateTaskStatus } from "../api/tasksApi";
import ConfirmModal from "../components/ConfirmModal";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";

export default function MyTasks() {
  const { token } = useAuth();
  const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyTasks(token)
      .then(setTasks)
      .catch((error) => {
        addToast("Failed to load tasks", "error");
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
      const updatedTasks = await getMyTasks(token);
      setTasks(updatedTasks);
      addToast("Task status updated successfully", "success");
    } catch (error) {
      addToast("Failed to update task status", "error");
      console.error("Failed to update status:", error);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading tasks...</div>;

  const pageStyle: React.CSSProperties = {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: "28px",
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: "60px 20px",
    textAlign: "center",
    border: "2px dashed #e5e7eb",
    borderRadius: "8px",
    marginTop: "24px",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  };

  const tasksContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "24px",
  };

  const taskItemStyle: React.CSSProperties = {
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  const taskInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const taskActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ marginBottom: "8px", fontSize: "2rem", color: "#111827" }}>
          My Tasks
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Manage all tasks assigned to you across all projects.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: "3.5rem", marginBottom: "12px" }}>📋</div>
          <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 500 }}>
            No tasks assigned to you yet
          </p>
          <p style={{ margin: "8px 0 0 0", color: "#9ca3af" }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        <div style={tasksContainerStyle}>
          {tasks.map((task) => {
            const isOverdue =
              task.deadline &&
              new Date(task.deadline) < new Date() &&
              task.status !== "APPROVED" &&
              task.status !== "DONE";

            const displayStatus = isOverdue
              ? "overdue"
              : task.status === "DONE"
                ? "done"
                : task.status === "IN_PROGRESS"
                  ? "in-progress"
                  : task.status === "APPROVED"
                    ? "completed"
                    : "pending";

            return (
              <div key={task.taskid} style={taskItemStyle}>
                <div style={taskInfoStyle}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#4f46e5",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {task.projectname}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "4px 0",
                      wordBreak: "break-word",
                    }}
                  >
                    {task.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusBadge status={displayStatus} />
                    {task.deadline && (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: isOverdue ? "#ef4444" : "#6b7280",
                          fontWeight: isOverdue ? 600 : 400,
                        }}
                      >
                        📅 {new Date(task.deadline).toLocaleDateString()}
                        {isOverdue && <strong> (OVERDUE)</strong>}
                      </span>
                    )}
                  </div>
                </div>

                <div style={taskActionsStyle}>
                  {task.status === "CREATED" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        askConfirm(
                          "Start Task",
                          "Are you sure you want to start this task?",
                          () => handleStatusChange(task.taskid, "IN_PROGRESS"),
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
                      Complete
                    </Button>
                  )}
                  {(task.status === "APPROVED" || task.status === "DONE") && (
                    <div
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      ✅ {task.status === "APPROVED" ? "Approved" : "Done"}
                    </div>
                  )}
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
