import React from "react";
export const FormInput = ({ label, error, helperText, id, className = "", ...props }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    return (<div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column" }}>
      {label && (<label htmlFor={inputId} className="form-label">
          {label}
        </label>)}
      <input id={inputId} className={`form-input ${error ? "error" : ""} ${className}`.trim()} {...props}/>
      {error && (<div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-danger)", fontWeight: 500 }}>
          {error}
        </div>)}
      {helperText && !error && (<div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>
          {helperText}
        </div>)}
    </div>);
};
