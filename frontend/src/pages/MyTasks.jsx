import { useAuth } from "../auth/AuthContext.jsx";
import { useState, useEffect } from "react";
import { getMyTasks, updateTaskStatus } from "../api/tasksApi.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useConfirmModal } from "../hooks/useConfirmModal.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";
export default function MyTasks() {
    const { token } = useAuth();
    const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
    const { addToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        getMyTasks(token)
            .then(setTasks)
            .catch((error) => {
            addToast("Failed to load tasks", "error");
            console.error(error);
        })
            .finally(() => setLoading(false));
    }, [token, addToast]);
    const handleStatusChange = async (taskId, status) => {
        if (!token)
            return;
        try {
            await updateTaskStatus(taskId, status, token);
            const updatedTasks = await getMyTasks(token);
            setTasks(updatedTasks);
            addToast("Task status updated successfully", "success");
        }
        catch (error) {
            addToast("Failed to update task status", "error");
            console.error("Failed to update status:", error);
        }
    };
    if (loading)
        return <div className="page-wrapper"><div className="text-center">Loading tasks...</div></div>;
    return (<div className="page-wrapper fade-in" style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>My Tasks</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          Manage all tasks assigned to you across all active projects.
        </p>
      </div>

      {tasks.length === 0 ? (<div className="card text-center glass" style={{ padding: "80px 40px", borderStyle: "dashed" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🏖️</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>No tasks assigned</h2>
          <p style={{ color: "var(--color-text-tertiary)" }}>You're all caught up for now!</p>
        </div>) : (<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {tasks.map((task) => {
                const isOverdue = task.deadline &&
                    new Date(task.deadline) < new Date() &&
                    task.status !== "APPROVED" &&
                    task.status !== "DONE";
                return (<div key={task.taskid} className="card animate-fade" style={{ transition: "transform 0.2s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                      {task.projectname}
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", color: "var(--color-text-primary)" }}>
                      {task.title}
                    </h3>
                    
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`badge ${task.status === "APPROVED" ? "badge-success" :
                        task.status === "DONE" ? "badge-success" :
                            task.status === "IN_PROGRESS" ? "badge-warning" : "badge-secondary"}`}>
                        {task.status}
                      </span>
                      
                      {task.deadline && (<span style={{
                            fontSize: "0.9rem",
                            color: isOverdue ? "var(--color-danger)" : "var(--color-text-tertiary)",
                            fontWeight: isOverdue ? 700 : 400
                        }}>
                          📅 {new Date(task.deadline).toLocaleDateString()}
                          {isOverdue && " (OVERDUE)"}
                        </span>)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    {task.status === "CREATED" && (<Button size="sm" variant="primary" onClick={() => askConfirm("Start Task", "Begin working on this task?", () => handleStatusChange(task.taskid, "IN_PROGRESS"), "primary")}>
                        Start Task
                      </Button>)}
                    {task.status === "IN_PROGRESS" && (<Button size="sm" variant="success" onClick={() => askConfirm("Complete Task", "Have you finished your work?", () => handleStatusChange(task.taskid, "DONE"), "success")}>
                        Mark Done
                      </Button>)}
                    {(task.status === "APPROVED" || task.status === "DONE") && (<div className="badge badge-success" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        ✅ {task.status === "APPROVED" ? "Approved" : "Completed"}
                      </div>)}
                  </div>
                </div>
              </div>);
            })}
        </div>)}

      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onCancel={closeModal} type={confirmConfig.type}/>
    </div>);
}
