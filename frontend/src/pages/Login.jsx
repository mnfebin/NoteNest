import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import Button from "../components/Button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useNotes();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "College email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await login(email, password);
      setLoginSuccess(true);
      setTimeout(() => {
        if (data.user?.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/notes");
        }
      }, 700);
    } catch (err) {
      setServerError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillStudent = () => {
    setEmail("alex.rivera@college.edu");
    setPassword("StudentPass2026!");
    setErrors({});
    setServerError("");
  };

  const handleQuickFillAdmin = () => {
    setEmail("admin@notenest.edu");
    setPassword("AdminPass2026!");
    setErrors({});
    setServerError("");
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "460px",
        paddingTop: "2.5rem",
        paddingBottom: "3rem"
      }}
    >
      <div className="card" style={{ padding: "2.5rem 2rem", background: "#FFFFFF" }}>
        {/* Logo and Welcome */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="navbar-logo-icon"
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 1rem",
              background: "linear-gradient(135deg, #2563EB, #4F46E5)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-md)"
            }}
          >
            <BookOpen size={26} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
            Welcome to NoteNest
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Sign in with your student credentials to access notes
          </p>
        </div>

        {loginSuccess && (
          <div
            style={{
              padding: "1rem",
              background: "var(--success-light)",
              border: "1px solid var(--success-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={18} />
            <span>Success! Redirecting to dashboard...</span>
          </div>
        )}

        {serverError && (
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "var(--danger-light)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600
            }}
          >
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Demo fill buttons */}
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleQuickFillStudent}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--primary)",
              background: "var(--primary-light)",
              border: "1px dashed var(--primary-border)",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <Sparkles size={13} /> Fill Student (Alex)
          </button>
          <button
            type="button"
            onClick={handleQuickFillAdmin}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#7C3AED",
              background: "#F5F3FF",
              border: "1px dashed #DDD6FE",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <ShieldCheck size={13} /> Fill Admin Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              College Email
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  if (serverError) setServerError("");
                }}
              />
            </div>
            {errors.email && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <span
                style={{ fontSize: "0.775rem", color: "var(--primary)", cursor: "pointer" }}
                onClick={() => showToast("Default demo password: StudentPass2026! or AdminPass2026!", "info")}
              >
                Forgot?
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  if (serverError) setServerError("");
                }}
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.password}
              </span>
            )}
          </div>

          {/* Submit */}
          <div style={{ marginTop: "1.75rem" }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={LogIn}
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              {isLoading ? "Signing In..." : "Sign In to NoteNest"}
            </Button>
          </div>
        </form>

        {/* Link to Register */}
        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don't have an account yet?{" "}
          <Link to="/register" style={{ fontWeight: 700, color: "var(--primary)" }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
