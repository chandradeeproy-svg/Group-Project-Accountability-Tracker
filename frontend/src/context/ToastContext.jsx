import React, { createContext, useContext, useState, useCallback } from "react";
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children, }) => {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    return (<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>);
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};
