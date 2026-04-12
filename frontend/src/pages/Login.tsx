import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { login as loginApi } from "../api/authApi";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(data.user, data.token);
      addToast("Welcome back!", "success");
    } catch (error) {
      addToast("Login failed. Please check your credentials.", "error");
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const containerStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    overflow: "hidden",
    fontFamily: "inherit",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: "32px",
    textAlign: "center",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "3.5rem",
    marginBottom: "12px",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: "#111827",
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "8px",
  };

  const subtitleStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "0.95rem",
    margin: 0,
    marginTop: "4px",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  const linkStyle: React.CSSProperties = {
    marginTop: "24px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "0.95rem",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>🎯</div>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Group Project Accountability Tracker</p>
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          <FormInput
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
          />

          <FormInput
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div style={linkStyle}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
