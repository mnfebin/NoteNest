import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { SEMESTERS } from "../data/notes";
import Button from "../components/Button";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useNotes();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    semester: "4",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errs.email = "College email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errs.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRegisterSuccess(true);
      showToast("Account created successfully (Demo Mode)!", "success");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    }, 600);
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "500px",
        paddingTop: "2.5rem",
        paddingBottom: "3rem"
      }}
    >
      <div className="card" style={{ padding: "2.5rem 2rem", background: "#FFFFFF" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="navbar-logo-icon"
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 1rem",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-md)"
            }}
          >
            <BookOpen size={26} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
            Join NoteNest
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Create your student account to share and bookmark study resources
          </p>
        </div>

        {registerSuccess && (
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
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <input
              id="register-name"
              name="fullName"
              type="text"
              className={`form-input ${errors.fullName ? "input-error" : ""}`}
              placeholder="e.g. Alex Rivera"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.fullName}
              </span>
            )}
          </div>

          {/* Email & Semester */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                College Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="name@college.edu"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <span className="form-error">
                  <AlertCircle size={14} /> {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-semester">
                Semester
              </label>
              <select
                id="register-semester"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleInputChange}
              >
                {SEMESTERS.filter((s) => s.value !== "all").map((sem) => (
                  <option key={sem.value} value={sem.value}>
                    {sem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleInputChange}
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">
              Confirm Password
            </label>
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <div style={{ marginTop: "1.75rem" }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UserPlus}
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              {isLoading ? "Creating Account..." : "Register Account"}
            </Button>
          </div>
        </form>

        {/* Link to Login */}
        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 700, color: "var(--primary)" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
