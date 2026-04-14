import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string; // Standardize support for className
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const composedClasses = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      className={composedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="loading-spinner"></span>
          {typeof children === "string" ? "Processing..." : children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
