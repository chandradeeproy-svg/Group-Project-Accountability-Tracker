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
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
  },
  danger: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
  },
  success: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
  },
  outline: {
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "8px 14px",
    fontSize: "0.875rem",
    height: "36px",
    minWidth: "80px",
    lineHeight: "1.4",
  },
  md: {
    padding: "10px 18px",
    fontSize: "0.95rem",
    height: "44px",
    minWidth: "100px",
    lineHeight: "1.4",
  },
  lg: {
    padding: "12px 24px",
    fontSize: "1.025rem",
    height: "52px",
    minWidth: "140px",
    lineHeight: "1.4",
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    borderRadius: "8px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.2s ease",
    fontWeight: 700,
    letterSpacing: "0.4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    border: "none",
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button style={baseStyle} disabled={disabled || loading} {...props}>
      {loading ? "..." : children}
    </button>
  );
};
