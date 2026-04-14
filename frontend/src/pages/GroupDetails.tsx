import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  getTasksByProject,
  updateTaskStatus,
  approveTask,
  createTask,
  getProjectActivity,
} from "../api/tasksApi";
import { searchUsers } from "../api/usersApi";
import {
  addProjectMember,
  getProjectMembers,
  getProjectById,
} from "../api/projectsApi";
import ConfirmModal from "../components/ConfirmModal";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";

type Tab = "TASKS" | "MEMBERS" | "ACTIVITY" | "SCORES";
const TABS: Tab[] = ["TASKS", "MEMBERS", "ACTIVITY", "SCORES"];

export default function GroupDetail() {
  const { groupId } = useParams();
  const { token, user } = useAuth();
  const { confirmConfig, askConfirm, closeModal } = useConfirmModal();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("TASKS");
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task creation form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  // Member search
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load all data
  useEffect(() => {
    if (!token || !groupId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // Load essential project data first
        const proj = await getProjectById(groupId, token);
        setProject(proj);

        // Load other data in parallel, but handle individual errors
        const tasksPromise = getTasksByProject(groupId, token)
          .then(setTasks)
          .catch((e) => {
            console.error("Tasks load failed:", e);
            addToast("Failed to load tasks", "error");
          });
        const membersPromise = getProjectMembers(groupId, token)
          .then(setMembers)
          .catch((e) => {
            console.error("Members load failed:", e);
            addToast("Failed to load members", "error");
          });
        const activityPromise = getProjectActivity(groupId, token)
          .then(setActivity)
          .catch((e) => {
            console.error(
              "Activity load failed (Check if evidence_events table exists):",
              e,
            );
            setActivity([]); // Default to empty if it fails
          });

        await Promise.all([tasksPromise, membersPromise, activityPromise]);
      } catch (error) {
        console.error("Primary project data load failed:", error);
        addToast("Failed to load group data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId, token]);

  const loadTasks = () => {
    if (!token || !groupId) return;
    getTasksByProject(groupId, token)
      .then(setTasks)
      .catch((e) => {
        console.error(e);
        addToast("Failed to refresh tasks", "error");
      });
  };

  const loadMembers = () => {
    if (!token || !groupId) return;
    getProjectMembers(groupId, token)
      .then(setMembers)
      .catch((e) => {
        console.error(e);
        addToast("Failed to refresh members", "error");
      });
  };

  const loadActivity = () => {
    if (!token || !groupId) return;
    getProjectActivity(groupId, token).then(setActivity).catch(console.error);
  };

  const handleCreateTask = async () => {
    if (!token || !groupId || !newTaskTitle.trim() || creatingTask) return;
    if (!newTaskAssignee) {
      addToast("Please assign the task to someone", "error");
      return;
    }

    setCreatingTask(true);
    try {
      await createTask(
        groupId,
        newTaskTitle,
        newTaskDeadline,
        token,
        newTaskAssignee,
      );
      setNewTaskTitle("");
      setNewTaskDeadline("");
      setNewTaskAssignee("");
      setShowTaskForm(false);
      addToast("Task created successfully!", "success");
      loadTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
      addToast("Failed to create task", "error");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    status: "IN_PROGRESS" | "DONE" | "CANCELLED",
  ) => {
    if (!token) return;
    try {
      await updateTaskStatus(taskId, status, token);
      loadTasks();
      loadActivity();
    } catch (error) {
      console.error("Failed to update status:", error);
      addToast("Failed to update task status", "error");
    }
  };

  const handleApprove = async (taskId: string) => {
    if (!token) return;
    try {
      await approveTask(taskId, token);
      loadTasks();
      loadActivity();
    } catch (error) {
      console.error("Failed to approve:", error);
      addToast("Failed to approve task", "error");
    }
  };

  const handleSearchUsers = async () => {
    if (!token || !userSearch.trim()) return;
    try {
      const results = await searchUsers(userSearch, token);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      addToast("Failed to search users", "error");
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!token || !groupId) return;
    try {
      await addProjectMember(groupId, userId, "MEMBER", token);
      addToast("Member added successfully!", "success");
      setSearchResults([]);
      setUserSearch("");
      setShowMemberForm(false);
      loadMembers();
    } catch (error) {
      console.error("Failed to add member:", error);
      addToast("Failed to add member", "error");
    }
  };

  if (loading) return <div className="page-wrapper"><div className="text-center">Loading Group Data...</div></div>;

  const projectOwnerId = project?.ownerid || project?.ownerId;
  const isProjectOwner = projectOwnerId === user?.id;

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>{project?.name || "Group Details"}</h1>
        
        {/* Tabs */}
        <div 
          className="glass"
          style={{ 
            display: "inline-flex", 
            padding: "6px", 
            gap: "4px", 
            borderRadius: "14px",
            marginBottom: "20px"
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                backgroundColor: activeTab === tab ? "var(--color-primary)" : "transparent",
                color: activeTab === tab ? "white" : "var(--color-text-secondary)",
                padding: "8px 20px",
                borderRadius: "10px",
                fontSize: "0.9rem",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TASKS TAB */}
      {activeTab === "TASKS" && (
        <div className="animate-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Tasks</h2>
            {isProjectOwner && (
              <Button
                variant={showTaskForm ? "secondary" : "primary"}
                onClick={() => setShowTaskForm(!showTaskForm)}
              >
                {showTaskForm ? "Cancel" : "+ Create Task"}
              </Button>
            )}
          </div>

          {showTaskForm && (
            <div className="card glass-light" style={{ marginBottom: "32px", border: "1px solid var(--color-primary-light)" }}>
              <h3 style={{ marginBottom: "20px" }}>Create New Task</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <FormInput
                  label="Task Title"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <FormInput
                  label="Deadline"
                  type="datetime-local"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label className="form-label">Assign to:</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="form-input"
                  style={{ borderColor: newTaskAssignee ? "var(--color-border)" : "var(--color-danger)" }}
                >
                </select>
              </div>
              <Button
                onClick={handleCreateTask}
                disabled={creatingTask || !newTaskTitle.trim()}
                loading={creatingTask}
                variant="success"
              >
                Create Task
              </Button>
            </div>
          )}

          {tasks.length === 0 && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No tasks created yet.
            </p>
          )}

          {tasks.map((task) => {
            const isOverdue =
              task.deadline &&
              new Date(task.deadline) < new Date() &&
              task.status !== "APPROVED";

            const taskOwnerId = task.ownerid || task.ownerId;
            const assignee = members.find(
              (m) => (m.userid || m.userId) === taskOwnerId,
            );

            return (
              <div key={task.taskid || task.taskId} className="card animate-fade" style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "1.1rem" }}>{task.title}</strong>
                  <span className={`badge ${task.status === "APPROVED" ? "badge-success" : "badge-warning"}`}>
                    {task.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "24px", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                  <div>👤 {assignee?.name || "Unknown"}</div>
                  {task.deadline && (
                    <div style={{ color: isOverdue ? "var(--color-danger)" : "inherit", fontWeight: isOverdue ? 700 : 400 }}>
                      📅 {new Date(task.deadline).toLocaleString()}
                      {isOverdue && " (OVERDUE)"}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  {taskOwnerId === user?.id && task.status === "CREATED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        askConfirm(
                          "Start Task",
                          "Are you sure you want to start this task?",
                          () => handleStatusChange(task.taskid || task.taskId, "IN_PROGRESS"),
                          "primary"
                        )
                      }
                    >
                      Start Task
                    </Button>
                  )}

                  {taskOwnerId === user?.id && task.status === "IN_PROGRESS" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        askConfirm(
                          "Mark Task Done",
                          "Are you sure you have completed this task?",
                          () => handleStatusChange(task.taskid || task.taskId, "DONE"),
                          "success"
                        )
                      }
                    >
                      Mark as Done
                    </Button>
                  )}

                  {isProjectOwner && task.status === "DONE" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        askConfirm(
                          "Approve Task",
                          "Are you sure you want to approve this task completion?",
                          () => handleApprove(task.taskid || task.taskId),
                          "success"
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

      {/* MEMBERS TAB */}
      {activeTab === "MEMBERS" && (
        <div className="animate-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Members</h2>
            {isProjectOwner && (
              <Button
                variant={showMemberForm ? "secondary" : "primary"}
                onClick={() => setShowMemberForm(!showMemberForm)}
              >
                {showMemberForm ? "Cancel" : "+ Add Member"}
              </Button>
            )}
          </div>

          {showMemberForm && (
            <div className="card glass" style={{ marginBottom: "32px", border: "1px solid var(--color-primary-light)" }}>
              <h3 style={{ marginBottom: "20px" }}>Add Member to Group</h3>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <FormInput
                  label="Search Users"
                  placeholder="name or email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <Button onClick={handleSearchUsers}>Search</Button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>Search Results:</h4>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="card"
                      style={{
                        padding: "12px 20px",
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{result.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>{result.email}</div>
                      </div>
                      <Button size="sm" onClick={() => handleAddMember(result.id)}>Add</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "20px" }}>Current Members</h3>
            <div className="grid grid-cols-2">
              {members.map((member) => (
                <div key={member.userid || member.userId} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {member.name}
                        {(member.userid || member.userId) === user?.id && <span style={{ color: "var(--color-primary)", marginLeft: "8px", fontWeight: 500 }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-text-tertiary)", marginTop: "4px" }}>{member.email}</div>
                    </div>
                    <span className={`badge ${member.role === "OWNER" ? "badge-primary" : "badge-secondary"}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === "ACTIVITY" && (
        <div className="animate-fade">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Group Activity</h2>
          {activity.length === 0 ? (
            <div className="card text-center" style={{ borderStyle: "dashed", padding: "48px" }}>
              <p style={{ color: "var(--color-text-tertiary)" }}>No activity recorded yet for this project.</p>
            </div>
          ) : (
            <div
              style={{
                borderLeft: "3px solid var(--color-primary-light)",
                paddingLeft: "32px",
                marginLeft: "8px",
                marginTop: "20px",
              }}
            >
              {activity.map((event) => {
                const date = new Date(event.timestamp);
                const timeStr = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString();

                return (
                  <div
                    key={event.event_id}
                    style={{ marginBottom: "32px", position: "relative" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "-39px",
                        top: "4px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        border: "3px solid white",
                        boxShadow: "0 0 0 4px var(--color-primary-light)",
                      }}
                    ></div>
                    <div
                      style={{
                        fontSize: "1em",
                        color: "#333",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ color: "#007bff" }}>
                        {event.username || "System"}
                      </strong>
                      {event.type === "TASK_CREATED" && (
                        <span>
                          {" 📝 Task Created: "}
                          <strong style={{ color: "#555" }}>
                            {event.metadata?.taskTitle ||
                              event.metadata?.title ||
                              "Unnamed Task"}
                          </strong>
                        </span>
                      )}
                      {event.type === "TASK_STATUS_CHANGED" && (
                        <span>
                          {" ✏️ Updated "}
                          <strong style={{ color: "#555" }}>
                            {event.metadata?.taskTitle || "a task"}
                          </strong>{" "}
                          to{" "}
                          <strong style={{ color: "#28a745" }}>
                            {event.metadata?.to}
                          </strong>
                        </span>
                      )}
                      {event.type === "TASK_APPROVED" && (
                        <span>
                          {" ✅ Approved: "}
                          <strong style={{ color: "#555" }}>
                            {event.metadata?.taskTitle || "a task"}
                          </strong>
                        </span>
                      )}
                      {event.type === "MEMBER_ADDED" && (
                        <span>
                          {" 👥 Added Member: "}
                          <strong style={{ color: "#555" }}>
                            {event.metadata?.memberName || "a member"}
                          </strong>
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "#999",
                      }}
                    >
                      {dateStr} at {timeStr}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SCORES TAB */}
      {activeTab === "SCORES" && (
        <div className="animate-fade">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>Accountability Scores</h2>
          <div className="grid grid-cols-2">
            {members.map((member) => {
              const memberTasks = tasks.filter(
                (t) => t.ownerid === member.userid,
              );
              const approvedTasks = memberTasks.filter(
                (t) => t.status === "APPROVED",
              );
              const score =
                memberTasks.length > 0
                  ? Math.round(
                      (approvedTasks.length / memberTasks.length) * 100,
                    )
                  : 0;

              return (
                <div key={member.userid} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem" }}>{member.name}</h3>
                      <div className="badge badge-secondary">
                        {approvedTasks.length} / {memberTasks.length} tasks approved
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "2.25rem",
                          fontWeight: 800,
                          color: score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-danger)",
                        }}
                      >
                        {score}%
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "10px",
                      backgroundColor: "var(--color-bg)",
                      borderRadius: "10px",
                      marginTop: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${score}%`,
                        backgroundColor: score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-danger)",
                        transition: "width 1s ease-out",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
