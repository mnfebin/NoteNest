import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Code2, Users2, Shield, Sparkles } from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function Footer() {
  const { resetToSampleData } = useNotes();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div>
            <div className="navbar-logo" style={{ marginBottom: "0.85rem" }}>
              <div className="navbar-logo-icon" style={{ background: "linear-gradient(135deg, #2563EB, #4F46E5)", color: "#FFFFFF" }}>
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <span>Note<span style={{ color: "var(--primary)" }}>Nest</span></span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", maxWidth: "340px", marginBottom: "1.25rem" }}>
              A peer-to-peer academic note sharing platform built for engineering students to upload, organize, and discover verified semester study materials.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
              <Users2 size={16} />
              <span>Full Stack Development Coursework (CSE Year 2)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <li>
                <Link to="/" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Home Feed
                </Link>
              </li>
              <li>
                <Link to="/notes" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Explore All Notes
                </Link>
              </li>
              <li>
                <Link to="/upload" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Upload Notes
                </Link>
              </li>
              <li>
                <Link to="/library" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Bookmarked Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Subjects */}
          <div>
            <h4 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
              Key Subjects
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <li>
                <Link to="/notes?subject=Data+Structures" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Data Structures
                </Link>
              </li>
              <li>
                <Link to="/notes?subject=Database+Management+Systems" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Database Management
                </Link>
              </li>
              <li>
                <Link to="/notes?subject=Operating+Systems" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Operating Systems
                </Link>
              </li>
              <li>
                <Link to="/notes?subject=Computer+Networks" style={{ transition: "color 0.15s ease" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  Computer Networks
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Info & Demo controls */}
          <div>
            <h4 style={{ fontSize: "0.925rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
              Platform Status
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.85rem", lineHeight: "1.5" }}>
              Frontend Prototype v1.0. Running with React state and localStorage mock persistence.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link to="/admin" className="btn btn-outline btn-sm" style={{ width: "fit-content" }}>
                <Shield size={14} /> Open Admin Portal
              </Link>
              <button
                type="button"
                onClick={resetToSampleData}
                className="btn btn-ghost btn-sm"
                style={{ width: "fit-content", fontSize: "0.75rem", color: "var(--text-muted)" }}
                title="Restore all notes and reports back to initial seed dataset"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NoteNest. Built with React & Vite by CSE Project Team 4.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link to="/login" style={{ color: "var(--text-muted)" }}>Sign In</Link>
            <Link to="/register" style={{ color: "var(--text-muted)" }}>Sign Up</Link>
            <span style={{ color: "var(--border-light)" }}>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-secondary)" }}>
              <Code2 size={15} color="var(--primary)" /> Frontend Phase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
