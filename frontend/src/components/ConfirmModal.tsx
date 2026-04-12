import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "primary" | "success";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes, Proceed",
  cancelText = "Cancel",
  type = "primary",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "#ef4444";
      case "success":
        return "#10b981";
      default:
        return "#4f46e5";
    }
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    textAlign: "center",
  };

  const iconContainerStyle: React.CSSProperties = {
    width: "52px",
    height: "52px",
    backgroundColor: `${getButtonColor()}15`,
    color: getButtonColor(),
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "24px",
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 8px",
    fontSize: "1.25rem",
    color: "#111827",
    fontWeight: 600,
  };

  const messageStyle: React.CSSProperties = {
    margin: 0,
    color: "#6b7280",
    lineHeight: "1.5",
    fontSize: "0.95rem",
  };

  const buttonsContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
  };

  const handleConfirm = async () => {
    await onConfirm();
    onCancel();
  };

  return (
    <div style={backdropStyle} onClick={onCancel} role="presentation">
      <div
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={iconContainerStyle}>
            {type === "danger" ? "⚠️" : type === "success" ? "✅" : "❓"}
          </div>
          <h2 id="modal-title" style={titleStyle}>
            {title}
          </h2>
          <p id="modal-message" style={messageStyle}>
            {message}
          </p>
        </div>

        <div style={buttonsContainerStyle}>
          <Button onClick={onCancel} variant="outline" style={{ flex: 1 }}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={
              type === "danger"
                ? "danger"
                : type === "success"
                  ? "success"
                  : "primary"
            }
            style={{ flex: 1 }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
