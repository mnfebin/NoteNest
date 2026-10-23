import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Users,
  Download,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Eye,
  LayoutDashboard,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  XCircle,
  Clock,
  Lock,
  LogOut,
  BookOpen,
  Search
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import Button from "../components/Button";

// Initial fallback mock data for when live backend is offline
const DEMO_FALLBACK_STATS = {
  totalUsers: 142,
  totalNotes: 8,
  pendingNotes: 2,
  approvedNotes: 6,
  rejectedNotes: 0,
  openReports: 3,
  totalDownloads: 1420
};

const DEMO_FALLBACK_REPORTS = [
  {
    id: "rep-demo-101",
    noteId: "note-1",
    noteTitle: "Operating Systems — CPU Scheduling & Deadlocks Master Notes",
    noteSubject: "Operating Systems",
    reason: "Inaccurate or outdated technical content",
    details: "Banker's Algorithm formula in section 4.2 has a minor typo in available matrix calculation.",
    reporter: "rahul.sharma@college.edu",
    reporterName: "Rahul Sharma",
    date: "2026-10-21",
    status: "OPEN"
  },
  {
    id: "rep-demo-102",
    noteId: "note-3",
    noteTitle: "Database Management Systems — Normalization & SQL Queries",
    noteSubject: "Database Systems",
    reason: "Copyright concern",
    details: "Contains a diagram scanned from a standard textbook without citation.",
    reporter: "sneha.patel@college.edu",
    reporterName: "Sneha Patel",
    date: "2026-10-22",
    status: "REVIEWED"
  },
  {
    id: "rep-demo-103",
    noteId: "note-4",
    noteTitle: "Computer Networks — TCP/IP Protocol Suite & Subnetting",
    noteSubject: "Computer Networks",
    reason: "Spam or duplicate content",
    details: "Duplicate submission of the unit 2 subnetting worksheet.",
    reporter: "kavita.nair@college.edu",
    reporterName: "Kavita Nair",
    date: "2026-10-23",
    status: "OPEN"
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, user, logout, showToast } = useNotes();

  // Tab State: "overview" (Dashboard), "notes" (Manage Notes), "reports" (Manage Reports)
  const [activeTab, setActiveTab] = useState("overview");

  // Filtering & search states
  const [notesSearch, setNotesSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
  const [reportsSearch, setReportsSearch] = useState("");

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [adminError, setAdminError] = useState(null);

  // Destructive Action Confirmation Modals
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [reportNoteToDelete, setReportNoteToDelete] = useState(null);

  // Backend Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    pendingNotes: 0,
    approvedNotes: 0,
    rejectedNotes: 0,
    openReports: 0,
    totalDownloads: 0
  });
  const [adminNotes, setAdminNotes] = useState([]);
  const [adminReports, setAdminReports] = useState([]);

  // Load Admin Data from backend API
  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setAdminError(null);

    try {
      const [dashRes, notesRes, reportsRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getNotes(),
        api.admin.getReports()
      ]);

      if (dashRes?.success && dashRes.data) {
        setStats(dashRes.data);
      }
      if (notesRes?.success && Array.isArray(notesRes.data)) {
        setAdminNotes(notesRes.data);
      }
      if (reportsRes?.success && Array.isArray(reportsRes.data)) {
        setAdminReports(reportsRes.data);
      }
      setIsDemoFallback(false);
    } catch (err) {
      console.warn("Backend admin endpoints unreachable or returned error:", err.message);
      // Fallback to clearly labeled Demo Data for academic presentation
      setIsDemoFallback(true);
      setAdminError(err.message || "Could not connect to live backend database.");
      setStats((prev) => (prev.totalUsers > 0 ? prev : DEMO_FALLBACK_STATS));
      setAdminReports((prev) => (prev.length > 0 ? prev : DEMO_FALLBACK_REPORTS));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // If user is not an administrator, show unauthorized guard
  if (!isAdmin) {
    return (
      <div className="container" style={{ maxWidth: "560px", paddingTop: "4rem", textAlign: "center" }}>
        <div className="card" style={{ padding: "3rem 2rem", background: "#FFFFFF" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--danger-light)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}
          >
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.75rem" }}>
            Administrator Access Required
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "2rem" }}>
            This governance portal is restricted to users with the <strong>ADMIN</strong> role. You are currently{" "}
            {user ? (
              <>logged in as a regular student (<strong>{user.email}</strong>)</>
            ) : (
              "not signed in"
            )}.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/login" className="btn btn-primary btn-md">
              <ShieldCheck size={16} /> Sign In as Admin
            </Link>
            <Link to="/notes" className="btn btn-outline btn-md">
              Return to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter notes by search & status
  const filteredNotes = adminNotes.filter((note) => {
    const q = notesSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (note.title || "").toLowerCase().includes(q) ||
      (note.subject || "").toLowerCase().includes(q) ||
      (note.uploader || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "ALL" || note.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Filter reports by search & status
  const filteredReports = adminReports.filter((rep) => {
    const q = reportsSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (rep.noteTitle || "").toLowerCase().includes(q) ||
      (rep.reason || "").toLowerCase().includes(q) ||
      (rep.reporter || "").toLowerCase().includes(q) ||
      (rep.details || "").toLowerCase().includes(q);

    const matchesStatus = reportStatusFilter === "ALL" || rep.status === reportStatusFilter;
    return matchesQuery && matchesStatus;
  });

  // Note Actions: Approve / Reject
  const handleUpdateNoteStatus = async (noteId, newStatus) => {
    try {
      await api.admin.updateNoteStatus(noteId, newStatus);
      showToast(`Note marked as ${newStatus}`, "success");
      setAdminNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, status: newStatus } : n))
      );
    } catch (err) {
      showToast(err.message || "Failed to update note status", "danger");
    }
  };

  // Note Actions: Delete Note Permanently
  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await api.admin.deleteNote(noteToDelete.id);
      showToast(`"${noteToDelete.title}" removed permanently`, "info");
      setAdminNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      setNoteToDelete(null);
    } catch (err) {
      showToast(err.message || "Failed to delete note", "danger");
    }
  };

  // Report Actions: Update Status (REVIEWED, DISMISSED, RESOLVED)
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await api.admin.updateReportStatus(reportId, newStatus);
      showToast(`Report marked as ${newStatus}`, "success");
      setAdminReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      if (newStatus === "RESOLVED" || newStatus === "DISMISSED") {
        setStats((prev) => ({
          ...prev,
          openReports: Math.max(0, prev.openReports - 1)
        }));
      }
    } catch (err) {
      showToast(err.message || "Failed to update report", "danger");
    }
  };

  // Report Actions: Remove Inappropriate Note & Resolve Report
  const confirmDeleteReportedNote = async () => {
    if (!reportNoteToDelete) return;
    try {
      if (reportNoteToDelete.noteId) {
        await api.admin.deleteNote(reportNoteToDelete.noteId).catch(() => null);
      }
      await api.admin.updateReportStatus(reportNoteToDelete.id, "RESOLVED");
      showToast("Note removed and report marked as RESOLVED", "info");
      setAdminNotes((prev) => prev.filter((n) => n.id !== reportNoteToDelete.noteId));
      setAdminReports((prev) =>
        prev.map((r) =>
          r.id === reportNoteToDelete.id ? { ...r, status: "RESOLVED" } : r
        )
      );
      setStats((prev) => ({
        ...prev,
        openReports: Math.max(0, prev.openReports - 1),
        totalNotes: Math.max(0, prev.totalNotes - 1)
      }));
      setReportNoteToDelete(null);
    } catch (err) {
      showToast(err.message || "Failed to process removal", "danger");
    }
  };

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Top Banner with live/demo indicator */}
      <div
        className="card"
        style={{
          padding: "1.5rem 2rem",
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#FFFFFF",
          border: "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <span
                style={{
                  background: "rgba(59, 130, 246, 0.25)",
                  color: "#93C5FD",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(147, 197, 253, 0.3)"
                }}
              >
                Administrator Portal
              </span>

              {isDemoFallback ? (
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#FDE68A",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(253, 230, 138, 0.3)"
                  }}
                >
                  Demo Mode (Database Offline)
                </span>
              ) : (
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#A7F3D0",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(167, 243, 208, 0.3)"
                  }}
                >
                  ● Live Backend Connected
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              NoteNest Governance & Operations
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#94A3B8", marginTop: "0.25rem" }}>
              Review notes submissions, govern student reports, track platform statistics, and moderate materials.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadAdminData}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh Live Data"}
            </Button>
            <Link to="/notes" className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> Open Public Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Layout: Sidebar + Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: "1.75rem",
          alignItems: "start"
        }}
      >
        {/* SIDEBAR */}
        <aside className="card" style={{ padding: "1.25rem", background: "#FFFFFF" }}>
          {/* NoteNest Logo Brand in Sidebar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.5rem 0.75rem 1.25rem",
              borderBottom: "1px solid var(--border-light)",
              marginBottom: "1rem"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "var(--primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-main)", lineHeight: 1.2 }}>
                NoteNest
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
                Admin Console
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "0.25rem 0.75rem 0.5rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--text-light)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            Navigation
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: activeTab === "overview" ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: activeTab === "overview" ? "var(--primary-light)" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: activeTab === "notes" ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: activeTab === "notes" ? "var(--primary-light)" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <FileText size={18} /> Manage Notes
              </div>
              {stats.pendingNotes > 0 && (
                <span className="badge badge-warning" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                  {stats.pendingNotes}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: activeTab === "reports" ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: activeTab === "reports" ? "var(--primary-light)" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <AlertTriangle size={18} /> Manage Reports
              </div>
              {stats.openReports > 0 && (
                <span className="badge badge-danger" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                  {stats.openReports}
                </span>
              )}
            </button>
          </nav>

          {/* User Info & Logout Button */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-light)"
            }}
          >
            <div style={{ padding: "0 0.5rem 0.75rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>
                {user?.name || "Admin Moderator"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email || "admin@notenest.edu"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--danger)",
                backgroundColor: "var(--danger-light)",
                border: "1px solid var(--danger-border)",
                cursor: "pointer"
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main style={{ minWidth: 0 }}>
          {/* SECTION A: STATISTICS CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.75rem"
            }}
          >
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              subtext={isDemoFallback ? "Demo Student Count" : "Registered Students"}
              color="#2563EB"
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
            />
            <StatCard
              icon={FileText}
              label="Total Uploaded Notes"
              value={stats.totalNotes}
              subtext={`${stats.approvedNotes} Approved, ${stats.pendingNotes} Pending`}
              color="#7C3AED"
              bgColor="#F5F3FF"
              borderColor="#DDD6FE"
            />
            <StatCard
              icon={Download}
              label="Total Downloads"
              value={stats.totalDownloads.toLocaleString()}
              subtext="Cumulative Student Reads"
              color="#059669"
              bgColor="#ECFDF5"
              borderColor="#A7F3D0"
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Reports"
              value={stats.openReports}
              subtext={stats.openReports > 0 ? "Requires Admin Review" : "No Open Issues"}
              color={stats.openReports > 0 ? "#DC2626" : "#64748B"}
              bgColor={stats.openReports > 0 ? "#FEF2F2" : "#F8FAFC"}
              borderColor={stats.openReports > 0 ? "#FECACA" : "#E2E8F0"}
            />
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Alert for Pending Reports */}
              {stats.openReports > 0 && (
                <div
                  className="card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    background: "var(--danger-light)",
                    border: "1px solid var(--danger-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <AlertTriangle size={22} color="var(--danger)" />
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--danger)" }}>
                        {stats.openReports} Student {stats.openReports === 1 ? "Report" : "Reports"} Pending Review
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Students flagged potential errors, copyright concerns, or spam.
                      </p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setActiveTab("reports")}>
                    Manage Reports
                  </Button>
                </div>
              )}

              {/* SECTION B: RECENT UPLOADS TABLE */}
              <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                      Recent Uploads
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Latest study materials submitted by college students
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("notes")}>
                    View All Notes ({adminNotes.length})
                  </Button>
                </div>

                {/* Table Loading, Error, Empty, and Success States */}
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                    <RefreshCw size={24} className="spin" style={{ marginBottom: "0.75rem", color: "var(--primary)" }} />
                    <p>Loading recent uploads...</p>
                  </div>
                ) : adminError && adminNotes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--bg-app)", borderRadius: "var(--radius-sm)" }}>
                    <AlertTriangle size={28} color="var(--warning)" style={{ marginBottom: "0.5rem" }} />
                    <p style={{ color: "var(--text-main)", fontWeight: 600 }}>Could not load notes from database</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>{adminError}</p>
                    <Button variant="outline" size="sm" onClick={loadAdminData}>Retry</Button>
                  </div>
                ) : adminNotes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                    <FileText size={32} style={{ marginBottom: "0.5rem", color: "var(--text-light)" }} />
                    <p style={{ fontWeight: 600 }}>No uploads found</p>
                    <p style={{ fontSize: "0.85rem" }}>Students haven't submitted any notes yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Note Title</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Subject</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Semester</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Uploader</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Upload Date</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminNotes.slice(0, 5).map((n) => (
                          <tr key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "0.85rem 0.5rem" }}>
                              <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{n.title}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Topic: {n.topic || "Core Syllabus"}</div>
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", color: "var(--primary)", fontWeight: 600 }}>
                              {n.subject}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem" }}>
                              <span className="badge badge-neutral">Sem {n.semester}</span>
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>
                              {n.uploader}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                              {n.uploadDate || (n.createdAt ? new Date(n.createdAt).toISOString().split("T")[0] : "Recent")}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem" }}>
                              <span
                                className={`badge ${
                                  n.status === "APPROVED"
                                    ? "badge-success"
                                    : n.status === "PENDING"
                                    ? "badge-warning"
                                    : "badge-danger"
                                }`}
                              >
                                {n.status}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                                {n.status === "PENDING" && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: "var(--success)" }}
                                    title="Approve Note"
                                    onClick={() => handleUpdateNoteStatus(n.id, "APPROVED")}
                                  >
                                    <CheckCircle size={15} />
                                  </button>
                                )}
                                <Link
                                  to={`/notes/${n.id}`}
                                  className="btn btn-ghost btn-sm"
                                  title="Inspect Note"
                                >
                                  <Eye size={15} />
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--danger)" }}
                                  onClick={() => setNoteToDelete(n)}
                                  title="Remove note"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Reports Preview on Overview */}
              <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                      Recent Reports
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Pending complaints awaiting moderation decision
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("reports")}>
                    Manage All Reports ({adminReports.length})
                  </Button>
                </div>

                {adminReports.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
                    <CheckCircle2 size={28} color="var(--success)" style={{ marginBottom: "0.5rem" }} />
                    <p>No active reports on file. The repository is healthy!</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Report ID</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reported Note</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reporter</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reason</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                          <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReports.slice(0, 4).map((r) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {r.id.slice(0, 10)}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600, color: "var(--text-main)" }}>
                              {r.noteTitle}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>
                              {r.reporter}
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem" }}>
                              <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                                {r.reason}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem" }}>
                              <span
                                className={`badge ${
                                  r.status === "OPEN"
                                    ? "badge-danger"
                                    : r.status === "REVIEWED"
                                    ? "badge-warning"
                                    : "badge-neutral"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                                <Link to={`/notes/${r.noteId}`} className="btn btn-ghost btn-sm" title="View Reported Note">
                                  <Eye size={15} />
                                </Link>
                                {r.status !== "REVIEWED" && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: "var(--warning)" }}
                                    onClick={() => handleUpdateReportStatus(r.id, "REVIEWED")}
                                    title="Mark Reviewed"
                                  >
                                    <Clock size={15} />
                                  </button>
                                )}
                                {r.status !== "DISMISSED" && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleUpdateReportStatus(r.id, "DISMISSED")}
                                    title="Dismiss Report"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--danger)" }}
                                  onClick={() => setReportNoteToDelete(r)}
                                  title="Remove Inappropriate Content"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE NOTES */}
          {activeTab === "notes" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Manage Study Notes ({filteredNotes.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Review, approve, reject, or remove submitted lecture materials
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "auto" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Verification</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search title, subject, uploader..."
                      value={notesSearch}
                      onChange={(e) => setNotesSearch(e.target.value)}
                      style={{ padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.875rem", width: "240px" }}
                    />
                    <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                  </div>
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                  <FileText size={32} style={{ marginBottom: "0.5rem", color: "var(--text-light)" }} />
                  <p style={{ fontWeight: 600 }}>No notes match this filter</p>
                  <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("ALL"); setNotesSearch(""); }}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title & Topic</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Subject</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Semester</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Uploader</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Upload Date</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotes.map((n) => (
                        <tr key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{n.title}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{n.topic}</div>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--primary)", fontWeight: 600 }}>
                            {n.subject}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <span className="badge badge-neutral">Sem {n.semester}</span>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>
                            {n.uploader}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            {n.uploadDate || (n.createdAt ? new Date(n.createdAt).toISOString().split("T")[0] : "Recent")}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <span
                              className={`badge ${
                                n.status === "APPROVED"
                                  ? "badge-success"
                                  : n.status === "PENDING"
                                  ? "badge-warning"
                                  : "badge-danger"
                              }`}
                            >
                              {n.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              {n.status !== "APPROVED" && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--success)" }}
                                  title="Approve Note"
                                  onClick={() => handleUpdateNoteStatus(n.id, "APPROVED")}
                                >
                                  <CheckCircle size={15} />
                                </button>
                              )}
                              {n.status !== "REJECTED" && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--danger)" }}
                                  title="Reject Note"
                                  onClick={() => handleUpdateNoteStatus(n.id, "REJECTED")}
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                              <Link
                                to={`/notes/${n.id}`}
                                className="btn btn-ghost btn-sm"
                                title="Inspect Note"
                              >
                                <Eye size={15} />
                              </Link>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "var(--danger)" }}
                                onClick={() => setNoteToDelete(n)}
                                title="Delete note permanently"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECTION C — REPORTS MANAGEMENT TABLE */}
          {activeTab === "reports" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Reports Management Table ({filteredReports.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Review student complaint submissions and enforce academic standards
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <select
                    className="form-select"
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "auto" }}
                  >
                    <option value="ALL">All Reports</option>
                    <option value="OPEN">Open (Requires Action)</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                  </select>

                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search reports or notes..."
                      value={reportsSearch}
                      onChange={(e) => setReportsSearch(e.target.value)}
                      style={{ padding: "0.5rem 0.75rem 0.5rem 2rem", fontSize: "0.875rem", width: "230px" }}
                    />
                    <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                  </div>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                  <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: "0.75rem" }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                    No Reports Match Filter
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    All complaints under this criteria have been resolved.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Report ID</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reported Note Title</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reporting User</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Reason for Reporting</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Report Date</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Available Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((r) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {r.id.slice(0, 10)}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.noteTitle}</div>
                            {r.details && (
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem", fontStyle: "italic" }}>
                                "{r.details}"
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>
                            {r.reporter}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                              {r.reason}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            {r.date || (r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "Recent")}
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <span
                              className={`badge ${
                                r.status === "OPEN"
                                  ? "badge-danger"
                                  : r.status === "REVIEWED"
                                  ? "badge-warning"
                                  : "badge-neutral"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              <Link
                                to={`/notes/${r.noteId}`}
                                className="btn btn-outline btn-sm"
                                title="View Reported Note"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                              >
                                <Eye size={13} /> View Note
                              </Link>

                              {r.status !== "REVIEWED" && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                  onClick={() => handleUpdateReportStatus(r.id, "REVIEWED")}
                                  title="Mark Report as Reviewed"
                                >
                                  Reviewed
                                </button>
                              )}

                              {r.status !== "DISMISSED" && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                  onClick={() => handleUpdateReportStatus(r.id, "DISMISSED")}
                                  title="Dismiss Report"
                                >
                                  Dismiss
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                onClick={() => setReportNoteToDelete(r)}
                                title="Remove Inappropriate Content"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION MODAL: DELETE NOTE */}
      <Modal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Confirm Removal of Study Material"
        footer={
          <>
            <Button variant="outline" size="md" onClick={() => setNoteToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" icon={Trash2} onClick={confirmDeleteNote}>
              Confirm Permanent Delete
            </Button>
          </>
        }
      >
        <p style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          Are you sure you want to permanently remove <strong>"{noteToDelete?.title}"</strong>?
          This note will be deleted from student searches, downloads, and personal libraries.
        </p>
      </Modal>

      {/* CONFIRMATION MODAL: REMOVE INAPPROPRIATE REPORTED CONTENT */}
      <Modal
        isOpen={!!reportNoteToDelete}
        onClose={() => setReportNoteToDelete(null)}
        title="Confirm Content Removal & Resolve Report"
        footer={
          <>
            <Button variant="outline" size="md" onClick={() => setReportNoteToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" icon={Trash2} onClick={confirmDeleteReportedNote}>
              Remove Note & Resolve
            </Button>
          </>
        }
      >
        <div style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "0.75rem" }}>
            You are removing the note <strong>"{reportNoteToDelete?.noteTitle}"</strong> based on student complaint:
          </p>
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "var(--bg-app)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              marginBottom: "0.75rem"
            }}
          >
            <div><strong>Reason:</strong> {reportNoteToDelete?.reason}</div>
            {reportNoteToDelete?.details && (
              <div style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                "{reportNoteToDelete?.details}"
              </div>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            The note will be permanently purged from the repository, and this report will be marked as <strong>RESOLVED</strong>.
          </p>
        </div>
      </Modal>
    </div>
  );
}
