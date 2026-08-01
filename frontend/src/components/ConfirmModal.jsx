import { Button } from "./Button.jsx";
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes, Proceed", cancelText = "Cancel", type = "primary", }) {
    if (!isOpen)
        return null;
    const handleConfirm = async () => {
        await onConfirm();
        onCancel();
    };
    return (<div className="fade-in" style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
        }} onClick={onCancel} role="presentation">
      <div className="card animate-fade" style={{
            padding: "32px",
            width: "90%",
            maxWidth: "440px",
            textAlign: "center",
            border: "1px solid var(--color-border)",
            backgroundColor: "white",
        }} onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            width: "60px", height: "60px",
            borderRadius: "3px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px",
            margin: "0 auto 16px",
            backgroundColor: "#f5f5f5",
            border: "1px solid var(--color-border)"
        }}>
            {type === "danger" ? "⚠️" : type === "success" ? "✅" : "❓"}
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "8px" }}>
            {title}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button onClick={onCancel} variant="outline" style={{ flex: 1 }}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} variant={type === "danger" ? "danger" : type === "success" ? "success" : "primary"} style={{ flex: 1 }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>);
}
