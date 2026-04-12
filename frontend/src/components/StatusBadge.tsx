import React from "react";

export type StatusType =
  | "pending"
  | "in-progress"
  | "done"
  | "overdue"
  | "completed";

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
}

const statusStyles: Record<StatusType, React.CSSProperties> = {
  pending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  "in-progress": {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  done: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  completed: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  overdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "0.35rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: 600,
    ...statusStyles[status],
  };

  return <span style={style}>{text || status.toUpperCase()}</span>;
};
