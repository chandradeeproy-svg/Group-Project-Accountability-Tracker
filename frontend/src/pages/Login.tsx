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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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

  return (
    <div 
      className="page-wrapper" 
      style={{ 
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        maxWidth: "none", padding: "20px"
      }}
    >
      <div className="glass fade-in" style={{ width: "100%", maxWidth: "440px", padding: "48px", borderRadius: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎯</div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "8px", tracking: "-0.02em" }}>Welcome Back</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>Group Project Accountability Tracker</p>
        </div>

        <form onSubmit={handleLogin}>
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
            size="lg"
            loading={loading}
            style={{ width: "100%", marginTop: "12px" }}
          >
            Login
          </Button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
