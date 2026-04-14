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
    return <div className="page-wrapper"><div className="text-center">Loading Dashboard...</div></div>;

  const activeTasks = tasks.filter(
    (t) => t.status !== "APPROVED" && t.status !== "CANCELLED",
  );

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, tracking: "-0.02em" }}>Dashboard</h1>
      </div>

      <div className="glass" style={{ padding: "32px", borderRadius: "24px", marginBottom: "32px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "8px" }}>
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          You have <strong style={{ color: "var(--color-primary)" }}>{activeTasks.length}</strong> active tasks requiring your attention. Keep up the great work!
        </p>
      </div>

      <div className="grid grid-cols-2">
        <section className="animate-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>My Tasks</h2>
            <Link to="/tasks" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
              View All
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="card text-center" style={{ borderStyle: "dashed", padding: "48px" }}>
              <p style={{ color: "var(--color-text-tertiary)" }}>📋 No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {tasks.slice(0, 5).map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "APPROVED";
                return (
                  <div key={task.taskid} className="card" style={{ transition: "transform 0.2s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <strong style={{ fontSize: "1.05rem", fontWeight: 700 }}>{task.title}</strong>
                      <span className="badge badge-secondary">{task.projectname}</span>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "0.9rem" }}>
                      <span className={isOverdue ? "badge badge-danger" : "badge badge-warning"}>
                        {task.status}
                      </span>
                      {task.deadline && (
                        <span style={{ color: isOverdue ? "var(--color-danger)" : "var(--color-text-tertiary)" }}>
                          📅 {new Date(task.deadline).toLocaleDateString()}
                          {isOverdue && <strong> (OVERDUE)</strong>}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      {task.status === "CREATED" && (
                        <Button size="sm" variant="primary" onClick={() => askConfirm("Start Task", "Are you sure?", () => handleStatusChange(task.taskid, "IN_PROGRESS"))}>
                          Start
                        </Button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <Button size="sm" variant="success" onClick={() => askConfirm("Mark Done", "Completed this task?", () => handleStatusChange(task.taskid, "DONE"))}>
                          Mark Done
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>My Projects</h2>
            <Link to="/groups" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
              Manage
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="card text-center" style={{ borderStyle: "dashed", padding: "48px" }}>
              <p style={{ color: "var(--color-text-tertiary)" }}>👥 You are not in any groups yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {projects.map((project) => (
                <Link key={project.projectid} to={`/groups/${project.projectid}`} style={{ textDecoration: "none" }}>
                  <div className="card btn-secondary" style={{ padding: "20px", border: "1px solid var(--color-border)", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}>{project.name}</strong>
                      <span className="badge badge-secondary">👤 {project.role}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>
                      Created: {new Date(project.createdat).toLocaleDateString()}
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
