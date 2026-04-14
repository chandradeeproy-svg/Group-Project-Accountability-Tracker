import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { register as registerApi } from "../api/authApi";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name || name.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await registerApi(name, email, password);
      login(data.user, data.token);
      addToast("Account created successfully!", "success");
    } catch (error) {
      addToast("Registration failed. Please try again.", "error");
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="page-wrapper" 
      style={{ 
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
        maxWidth: "none", padding: "20px"
      }}
    >
      <div className="glass fade-in" style={{ width: "100%", maxWidth: "460px", padding: "40px", borderRadius: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🚀</div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "8px", tracking: "-0.02em" }}>Create Account</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>Join the Group Project Accountability Tracker</p>
        </div>

        <form onSubmit={handleRegister}>
          <FormInput
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
          />

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
            helperText="At least 6 characters"
          />

          <FormInput
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: "100%", marginTop: "12px" }}
          >
            Sign Up
          </Button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
