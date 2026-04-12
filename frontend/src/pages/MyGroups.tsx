import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProjects, createProject } from "../api/projectsApi";
import { useToast } from "../context/ToastContext";

export default function MyGroups() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (!token) return;
    loadProjects();
  }, [token]);

  const loadProjects = () => {
    if (!token) return;
    getProjects(token)
      .then(setProjects)
      .catch((error) => {
        console.error(error);
        addToast("Failed to load groups", "error");
      })
      .finally(() => setLoading(false));
  };

  const handleCreateProject = async () => {
    if (!token || !newProjectName.trim()) return;

    try {
      await createProject(newProjectName, token);
      setNewProjectName("");
      setShowCreateForm(false);
      loadProjects();
      addToast("Group created successfully!", "success");
    } catch (error) {
      console.error("Failed to create project:", error);
      addToast("Failed to create group", "error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My Groups</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {showCreateForm ? "Cancel" : "+ Create New Group"}
        </button>
      </div>

      {showCreateForm && (
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <h3>Create New Project Group</h3>
          <input
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ padding: "8px", width: "300px", marginRight: "10px" }}
          />
          <button
            onClick={handleCreateProject}
            style={{ padding: "8px 20px", cursor: "pointer" }}
          >
            Create
          </button>
        </div>
      )}

      {projects.length === 0 && <p>You are not a member of any Group so far</p>}

      <div style={{ marginTop: "20px" }}>
        {projects.map((group) => {
          return (
            <div
              key={group.projectid}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              <h3>
                <Link to={`/groups/${group.projectid}`}>{group.name}</Link>
              </h3>
              <p>Role: {group.role}</p>
              <p>Created: {new Date(group.createdat).toLocaleDateString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
