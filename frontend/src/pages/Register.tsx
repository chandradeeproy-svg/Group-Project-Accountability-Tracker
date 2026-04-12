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

  const containerStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    overflow: "hidden",
    fontFamily: "inherit",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "440px",
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
          <div style={iconStyle}>🚀</div>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>
            Join the Group Project Accountability Tracker
          </p>
        </div>

        <form onSubmit={handleRegister} style={formStyle}>
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
            size="md"
            loading={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div style={linkStyle}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
