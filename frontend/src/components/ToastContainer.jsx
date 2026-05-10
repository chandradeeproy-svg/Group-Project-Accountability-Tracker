// [DEAD CODE] import React from "react"; // Not needed with Vite JSX transform
import { useToast } from "../context/ToastContext.jsx";
const toastStyles = {
    success: {
        backgroundColor: "#10b981",
        color: "white",
    },
    error: {
        backgroundColor: "#ef4444",
        color: "white",
    },
    info: {
        backgroundColor: "#3b82f6",
        color: "white",
    },
    warning: {
        backgroundColor: "#f59e0b",
        color: "white",
    },
};
export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();
    const containerStyle = {
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        maxWidth: "400px",
    };
    const toastStyle = (type) => ({
        padding: "1rem",
        borderRadius: "6px",
        marginBottom: "0.5rem",
        fontSize: "0.95rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        animation: "slideIn 0.3s ease",
        ...toastStyles[type],
    });
    return (<>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={containerStyle}>
        {toasts.map((toast) => (<div key={toast.id} style={toastStyle(toast.type)}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontSize: "1.2rem",
                marginLeft: "1rem",
            }}>
              ×
            </button>
          </div>))}
      </div>
    </>);
};
