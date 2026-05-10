// =============================================================
// [DEAD CODE] This component is unused.
// Only imported by TaskCard.jsx, which is also unused.
// No other file references StatusBadge.
// Kept for reference — safe to delete when ready.
// =============================================================

// import React from "react";
// const statusStyles = {
//     pending: {
//         backgroundColor: "#fef3c7",
//         color: "#92400e",
//     },
//     "in-progress": {
//         backgroundColor: "#dbeafe",
//         color: "#1e40af",
//     },
//     done: {
//         backgroundColor: "#dcfce7",
//         color: "#166534",
//     },
//     completed: {
//         backgroundColor: "#dcfce7",
//         color: "#166534",
//     },
//     overdue: {
//         backgroundColor: "#fee2e2",
//         color: "#991b1b",
//     },
// };
// export const StatusBadge = ({ status, text }) => {
//     const style = {
//         display: "inline-block",
//         padding: "0.35rem 0.75rem",
//         borderRadius: "4px",
//         fontSize: "0.85rem",
//         fontWeight: 600,
//         ...statusStyles[status],
//     };
//     return <span style={style}>{text || status.toUpperCase()}</span>;
// };

// Minimal named export to prevent any import errors
export const StatusBadge = () => null;
