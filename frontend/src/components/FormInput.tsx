import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random()}`;

  const containerStyle: React.CSSProperties = {
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#111827",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    border: error ? "1px solid #ef4444" : "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "1rem",
    backgroundColor: "#ffffff",
    color: "#111827",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    fontFamily: "inherit",
    ...props.style,
  };

  const errorStyle: React.CSSProperties = {
    marginTop: "0.4rem",
    fontSize: "0.85rem",
    color: "#ef4444",
    fontWeight: 500,
  };

  const helperStyle: React.CSSProperties = {
    marginTop: "0.4rem",
    fontSize: "0.85rem",
    color: "#6b7280",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input id={inputId} style={inputStyle} {...props} />
      {error && <div style={errorStyle}>{error}</div>}
      {helperText && !error && <div style={helperStyle}>{helperText}</div>}
    </div>
  );
};
