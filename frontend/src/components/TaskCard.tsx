import React from "react";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";
import type { StatusType } from "./StatusBadge";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: StatusType;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (newStatus: StatusType) => void;
  minimal?: boolean;
}

const priorityColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  priority = "medium",
  dueDate,
  assignee,
  onEdit,
  onDelete,
  onStatusChange,
  minimal = false,
}) => {
  const isOverdue =
    dueDate && new Date(dueDate) < new Date() && status !== "done";

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.2s ease",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
    gap: "0.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: minimal ? "0.95rem" : "1.05rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
    wordBreak: "break-word",
    flex: 1,
  };

  const metadataStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
    fontSize: "0.85rem",
    color: "#6b7280",
  };

  const metaItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: minimal ? 0 : "0.75rem",
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <StatusBadge status={isOverdue ? "overdue" : status} />
      </div>

      {description && !minimal && (
        <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0" }}>
          {description}
        </p>
      )}

      <div style={metadataStyle}>
        {priority && (
          <div style={metaItemStyle}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: priorityColors[priority],
              }}
            />
            {priority}
          </div>
        )}
        {dueDate && (
          <div style={metaItemStyle}>
            📅 {new Date(dueDate).toLocaleDateString()}
          </div>
        )}
        {assignee && <div style={metaItemStyle}>👤 {assignee}</div>}
      </div>

      {!minimal && (onEdit || onDelete || onStatusChange) && (
        <div style={actionsStyle}>
          {onStatusChange && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onStatusChange("done")}
            >
              Complete
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
