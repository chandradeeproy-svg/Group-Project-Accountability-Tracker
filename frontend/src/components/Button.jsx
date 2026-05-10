// [DEAD CODE] import React from "react"; // Not needed with Vite JSX transform
export const Button = ({ variant = "primary", size = "md", loading = false, children, disabled, className = "", ...props }) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const composedClasses = `btn ${variantClass} ${sizeClass} ${className}`.trim();
    return (<button className={composedClasses} disabled={disabled || loading} {...props}>
      {loading ? (<span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="loading-spinner"></span>
          {typeof children === "string" ? "Processing..." : children}
        </span>) : (children)}
    </button>);
};
