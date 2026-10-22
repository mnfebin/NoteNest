import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Compass,
  UploadCloud,
  Bookmark,
  ShieldCheck,
  User,
  Menu,
  X,
  LogOut,
  Sparkles
} from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { bookmarks, profile } = useNotes();
  const navigate = useNavigate();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="navbar-logo-icon" style={{ background: "linear-gradient(135deg, #2563EB, #4F46E5)", color: "#FFFFFF" }}>
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span>Note<span style={{ color: "var(--primary)" }}>Nest</span></span>
          <span className="badge badge-blue" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem", marginLeft: "-0.2rem" }}>
            CSE v1.0
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav>
          <ul className="navbar-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/notes" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Compass size={16} />
                Explore Notes
              </NavLink>
            </li>
            <li>
              <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <UploadCloud size={16} />
                Upload Notes
              </NavLink>
            </li>
            <li>
              <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Bookmark size={16} />
                My Library
                {bookmarks.length > 0 && (
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "#FFFFFF",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "999px",
                      marginLeft: "0.2rem"
                    }}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <ShieldCheck size={16} />
                Admin
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Desktop Auth / Profile Actions */}
        <div className="navbar-actions">
          <Link
            to="/profile"
            className="btn btn-ghost btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
            title={`Logged in as ${profile?.name || "Student"}`}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--primary-light)",
                border: "1.5px solid var(--primary-border)",
                color: "var(--primary)",
                fontWeight: "700",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {(profile?.name || "Alex Rivera").split(" ").filter(Boolean).map(n => n[0]).join("")}
            </div>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Profile</span>
          </Link>

          <Link to="/login" className="btn btn-outline btn-sm">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Register
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? "open" : ""}`}>
        <NavLink to="/" end className="nav-link" onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/notes" className="nav-link" onClick={closeMenu}>
          <Compass size={18} />
          Explore Notes
        </NavLink>
        <NavLink to="/upload" className="nav-link" onClick={closeMenu}>
          <UploadCloud size={18} />
          Upload Notes
        </NavLink>
        <NavLink to="/library" className="nav-link" onClick={closeMenu}>
          <Bookmark size={18} />
          My Library ({bookmarks.length})
        </NavLink>
        <NavLink to="/admin" className="nav-link" onClick={closeMenu}>
          <ShieldCheck size={18} />
          Admin Dashboard
        </NavLink>
        <NavLink to="/profile" className="nav-link" onClick={closeMenu}>
          <User size={18} />
          Student Profile ({profile?.name || "Alex"})
        </NavLink>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
          <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={closeMenu}>
            Login
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={closeMenu}>
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
