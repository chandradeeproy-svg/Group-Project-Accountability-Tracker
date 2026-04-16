import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProjects, createProject } from "../api/projectsApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";
import { FormInput } from "../components/FormInput.jsx";
export default function MyGroups() {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    useEffect(() => {
        if (!token)
            return;
        loadProjects();
    }, [token]);
    const loadProjects = () => {
        if (!token)
            return;
        getProjects(token)
            .then(setProjects)
            .catch((error) => {
            console.error(error);
            addToast("Failed to load groups", "error");
        })
            .finally(() => setLoading(false));
    };
    const handleCreateProject = async () => {
        if (!token || !newProjectName.trim())
            return;
        try {
            await createProject(newProjectName, token);
            setNewProjectName("");
            setShowCreateForm(false);
            loadProjects();
            addToast("Group created successfully!", "success");
        }
        catch (error) {
            console.error("Failed to create project:", error);
            addToast("Failed to create group", "error");
        }
    };
    if (loading)
        return <div className="page-wrapper"><div className="text-center">Loading Groups...</div></div>;
    return (<div className="page-wrapper fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>My Groups</h1>
        <Button variant={showCreateForm ? "secondary" : "primary"} onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "+ Create New Group"}
        </Button>
      </div>

      {showCreateForm && (<div className="card glass animate-fade" style={{ marginBottom: "32px", padding: "28px 32px", border: "1px solid var(--color-primary-light)" }}>
          <h3 style={{ marginBottom: "20px" }}>Create New Project Group</h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <FormInput label="Group Name" placeholder="e.g. Senior Design Project" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ flex: 1, marginBottom: 0 }}/>
            <Button onClick={handleCreateProject} variant="success">Create</Button>
          </div>
        </div>)}

      {projects.length === 0 && (<div className="card text-center" style={{ borderStyle: "dashed", padding: "64px" }}>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "1.1rem" }}>You are not a member of any Group so far.</p>
          <Button variant="outline" style={{ marginTop: "16px" }} onClick={() => setShowCreateForm(true)}>Start your first group</Button>
        </div>)}

      <div className="grid grid-cols-2">
        {projects.map((group) => {
            return (<div key={group.projectid} className="card accent-border" style={{ transition: "transform 0.2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                  <Link to={`/groups/${group.projectid}`} style={{ color: "var(--color-text-primary)", textDecoration: "none" }}>{group.name}</Link>
                </h3>
                <span className="badge badge-secondary">{group.role}</span>
              </div>
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                Created: {new Date(group.createdat).toLocaleDateString()}
              </p>
              <Link to={`/groups/${group.projectid}`} className="btn btn-outline" style={{ width: "100%" }}>
                View Details
              </Link>
            </div>);
        })}
      </div>
    </div>);
}
