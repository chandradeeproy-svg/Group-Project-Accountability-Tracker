// =============================================================
// [DEAD CODE] This component is unused.
// Never imported by any page — Dashboard, MyTasks, and
// GroupDetails all render tasks with inline JSX instead.
// Kept for reference — safe to delete when ready.
// =============================================================

// import React from "react";
// import { Button } from "./Button.jsx";
// import { StatusBadge } from "./StatusBadge.jsx";
// const priorityColors = {
//     low: "#10b981",
//     medium: "#f59e0b",
//     high: "#ef4444",
// };
// export const TaskCard = ({ title, description, status, priority = "medium",
//     dueDate, assignee, onEdit, onDelete, onStatusChange, minimal = false }) => {
//     const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "done";
//     const cardStyle = {
//         backgroundColor: "#ffffff",
//         border: "1px solid #e5e7eb",
//         borderRadius: "8px",
//         padding: "1rem",
//         marginBottom: "1rem",
//         boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//         transition: "box-shadow 0.2s ease",
//     };
//     const headerStyle = {
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//         marginBottom: "0.75rem",
//         gap: "0.5rem",
//     };
//     const titleStyle = {
//         fontSize: minimal ? "0.95rem" : "1.05rem",
//         fontWeight: 600,
//         color: "#111827",
//         margin: 0,
//         wordBreak: "break-word",
//         flex: 1,
//     };
//     const metadataStyle = {
//         display: "flex",
//         gap: "1rem",
//         marginBottom: "0.75rem",
//         flexWrap: "wrap",
//         fontSize: "0.85rem",
//         color: "#6b7280",
//     };
//     const metaItemStyle = {
//         display: "flex",
//         alignItems: "center",
//         gap: "0.3rem",
//     };
//     const actionsStyle = {
//         display: "flex",
//         gap: "0.5rem",
//         marginTop: minimal ? 0 : "0.75rem",
//     };
//     return (<div style={cardStyle}>
//       <div style={headerStyle}>
//         <h3 style={titleStyle}>{title}</h3>
//         <StatusBadge status={isOverdue ? "overdue" : status}/>
//       </div>
//       {description && !minimal && (<p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0" }}>
//           {description}
//         </p>)}
//       <div style={metadataStyle}>
//         {priority && (<div style={metaItemStyle}>
//             <span style={{ width: "8px", height: "8px", borderRadius: "50%",
//                 backgroundColor: priorityColors[priority] }}/>
//             {priority}
//           </div>)}
//         {dueDate && (<div style={metaItemStyle}>
//             📅 {new Date(dueDate).toLocaleDateString()}
//           </div>)}
//         {assignee && <div style={metaItemStyle}>👤 {assignee}</div>}
//       </div>
//       {!minimal && (onEdit || onDelete || onStatusChange) && (<div style={actionsStyle}>
//           {onStatusChange && (<Button size="sm" variant="success" onClick={() => onStatusChange("done")}>
//               Complete
//             </Button>)}
//           {onEdit && (<Button size="sm" variant="outline" onClick={onEdit}>
//               Edit
//             </Button>)}
//           {onDelete && (<Button size="sm" variant="danger" onClick={onDelete}>
//               Delete
//             </Button>)}
//         </div>)}
//     </div>);
// };

// Minimal named export to prevent any import errors
export const TaskCard = () => null;
