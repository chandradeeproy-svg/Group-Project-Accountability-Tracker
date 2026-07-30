import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useProjects, useCreateProjectMutation } from "../hooks/useProjectsQuery.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/Button.jsx";
import { FormInput } from "../components/FormInput.jsx";

export default function MyGroups() {
  const { addToast } = useToast();

  const { data: projects = [], isLoading, error } = useProjects();

  const createProjectMutation = useCreateProjectMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      addToast("Please enter a project name", "error");
      return;
    }

    createProjectMutation.mutate(
      { name: newProjectName },
      {
        onSuccess: () => {
          setNewProjectName("");
          setShowCreateForm(false);
          addToast("Group created successfully!", "success");
        },
        onError: (error) => {
          addToast(error.message || "Failed to create group", "error");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
          ⏳ Loading Groups...
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
          <h3>⚠️ Error Loading Groups</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>My Groups</h1>
        <Button
          variant={showCreateForm ? "secondary" : "primary"}
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={createProjectMutation.isPending}
        >
          {showCreateForm ? "Cancel" : "+ Create New Group"}
        </Button>
      </div>

      {showCreateForm && (
        <div
          className="card glass animate-fade"
          style={{
            marginBottom: "32px",
            padding: "28px 32px",
            border: "1px solid var(--color-primary-light)",
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Create New Project Group</h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <FormInput
              label="Group Name"
              placeholder="e.g. Senior Design Project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              onClick={handleCreateProject}
              variant="success"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="card text-center" style={{ borderStyle: "dashed", padding: "64px" }}>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "1.1rem" }}>
            You are not a member of any Group so far.
          </p>
          <Button
            variant="outline"
            style={{ marginTop: "16px" }}
            onClick={() => setShowCreateForm(true)}
          >
            Start your first group
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2">
        {projects.map((group) => (
          <div
            key={group.projectid}
            className="card accent-border"
            style={{ transition: "transform 0.2s ease" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                <Link
                  to={`/groups/${group.projectid}`}
                  style={{
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {group.name}
                </Link>
              </h3>
              <span className="badge badge-secondary">{group.role}</span>
            </div>
            <p
              style={{
                color: "var(--color-text-tertiary)",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Created: {new Date(group.createdat).toLocaleDateString()}
            </p>
            <Link
              to={`/groups/${group.projectid}`}
              className="btn btn-outline"
              style={{ width: "100%" }}
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
