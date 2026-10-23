import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Users,
  Download,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Eye,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  XCircle,
  Clock,
  Lock
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import Button from "../components/Button";

export default function AdminDashboard() {
  const { isAdmin, user, showToast } = useNotes();

  const [activeTab, setActiveTab] = useState("overview"); // overview, notes, reports, settings
  const [notesSearch, setNotesSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reportNoteToDelete, setReportNoteToDelete] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Real backend metrics & data states
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

  // Load Admin Data from real API
  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const [dashRes, notesRes, reportsRes] = await Promise.all([
        api.admin.getDashboard().catch(() => null),
        api.admin.getNotes().catch(() => null),
        api.admin.getReports().catch(() => null)
      ]);

      if (dashRes?.data) setStats(dashRes.data);
      if (notesRes?.data) setAdminNotes(notesRes.data);
      if (reportsRes?.data) setAdminReports(reportsRes.data);
    } catch (err) {
      console.warn("Failed to load admin metrics:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

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

  // Note Status Actions
  const handleUpdateStatus = async (noteId, newStatus) => {
    try {
      await api.admin.updateNoteStatus(noteId, newStatus);
      showToast(`Note marked as ${newStatus}`, "success");
      loadAdminData();
    } catch (err) {
      showToast(err.message || "Failed to update note status", "danger");
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await api.admin.deleteNote(noteToDelete.id);
      showToast("Note deleted from repository", "info");
      setNoteToDelete(null);
      loadAdminData();
    } catch (err) {
      showToast(err.message || "Failed to delete note", "danger");
    }
  };

  // Report Actions
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await api.admin.updateReportStatus(reportId, newStatus);
      showToast(`Report marked as ${newStatus}`, "success");
      loadAdminData();
    } catch (err) {
      showToast(err.message || "Failed to update report", "danger");
    }
  };

  const confirmDeleteReportedNote = async () => {
    if (!reportNoteToDelete) return;
    try {
      await api.admin.deleteNote(reportNoteToDelete.noteId);
      await api.admin.updateReportStatus(reportNoteToDelete.id, "RESOLVED");
      showToast("Note removed and report resolved", "info");
      setReportNoteToDelete(null);
      loadAdminData();
    } catch (err) {
      showToast(err.message || "Failed to remove reported note", "danger");
    }
  };

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Admin Header Banner */}
      <div
        className="card"
        style={{
          padding: "1.75rem 2rem",
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#FFFFFF",
          border: "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
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
              <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                CSE Academic Review Panel
              </span>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              NoteNest Governance & Operations
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#94A3B8", marginTop: "0.25rem" }}>
              Monitor study material quality, review student submissions, resolve reports, and audit repository activities.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadAdminData}
            >
              Refresh Data
            </Button>
            <Link to="/notes" className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> Open Public Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Grid with Sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "2rem",
          alignItems: "start"
        }}
      >
        {/* Admin Navigation Sidebar */}
        <aside className="card" style={{ padding: "1rem", background: "#FFFFFF" }}>
          <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Admin Menu
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: activeTab === "overview" ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: activeTab === "overview" ? "var(--primary-light)" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              <LayoutDashboard size={17} /> Overview Metrics
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
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <FileText size={17} /> Study Notes
              </div>
              {stats.pendingNotes > 0 && (
                <span className="badge badge-warning" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
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
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <AlertTriangle size={17} /> Reports Review
              </div>
              {stats.openReports > 0 && (
                <span className="badge badge-danger" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                  {stats.openReports}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: activeTab === "settings" ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: activeTab === "settings" ? "var(--primary-light)" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              <Settings size={17} /> Platform Settings
            </button>
          </nav>
        </aside>

        {/* Tab Content */}
        <main style={{ minWidth: 0 }}>
          {/* Quick Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2rem"
            }}
          >
            <StatCard
              icon={Users}
              label="Active Students"
              value={stats.totalUsers}
              subtext="Registered accounts"
              color="#2563EB"
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
            />
            <StatCard
              icon={FileText}
              label="Total Notes"
              value={stats.totalNotes}
              subtext={`${stats.approvedNotes} approved, ${stats.pendingNotes} pending`}
              color="#7C3AED"
              bgColor="#F5F3FF"
              borderColor="#DDD6FE"
            />
            <StatCard
              icon={Download}
              label="Total Downloads"
              value={stats.totalDownloads.toLocaleString()}
              subtext="Cumulative student reads"
              color="#059669"
              bgColor="#ECFDF5"
              borderColor="#A7F3D0"
            />
            <StatCard
              icon={AlertTriangle}
              label="Open Reports"
              value={stats.openReports}
              subtext={stats.openReports > 0 ? "Requires review" : "All cleared"}
              color={stats.openReports > 0 ? "#DC2626" : "#64748B"}
              bgColor={stats.openReports > 0 ? "#FEF2F2" : "#F8FAFC"}
              borderColor={stats.openReports > 0 ? "#FECACA" : "#E2E8F0"}
            />
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                        {stats.openReports} Student {stats.openReports === 1 ? "Report" : "Reports"} Awaiting Inspection
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Students have flagged potential syllabus errors or formatting issues.
                      </p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setActiveTab("reports")}>
                    Review Reports
                  </Button>
                </div>
              )}

              {/* Pending Approvals Notice */}
              {stats.pendingNotes > 0 && (
                <div
                  className="card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Clock size={22} color="#D97706" />
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#92400E" }}>
                        {stats.pendingNotes} Notes Awaiting Approval
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#B45309" }}>
                        Submissions by students require administrator verification before appearing publicly.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("PENDING");
                      setActiveTab("notes");
                    }}
                  >
                    Review Submissions
                  </Button>
                </div>
              )}

              {/* Recent Notes Preview */}
              <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                      Recent Repository Uploads
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Latest materials submitted across all semesters
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("notes")}>
                    View All ({adminNotes.length})
                  </Button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title & Subject</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Uploader</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Downloads</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminNotes.slice(0, 5).map((n) => (
                        <tr key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{n.title}</div>
                            <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>{n.subject} • Sem {n.semester}</div>
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
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>{n.uploader}</td>
                          <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600 }}>{n.downloads}</td>
                          <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              {n.status === "PENDING" && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--success)" }}
                                  title="Approve Note"
                                  onClick={() => handleUpdateStatus(n.id, "APPROVED")}
                                >
                                  <CheckCircle size={15} />
                                </button>
                              )}
                              <Link to={`/notes/${n.id}`} className="btn btn-ghost btn-sm" title="View details">
                                <Eye size={15} />
                              </Link>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "var(--danger)" }}
                                onClick={() => setNoteToDelete(n)}
                                title="Delete note"
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
              </div>
            </div>
          )}

          {/* TAB 2: STUDY NOTES MANAGEMENT */}
          {activeTab === "notes" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Repository Materials ({filteredNotes.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Approve pending submissions, filter, inspect, and remove notes
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {/* Status Filter */}
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "auto" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search title, uploader..."
                    value={notesSearch}
                    onChange={(e) => setNotesSearch(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "220px" }}
                  />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title & Subject</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Semester</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Uploader</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Downloads</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((n) => (
                      <tr key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{n.title}</div>
                          <div style={{ fontSize: "0.775rem", color: "var(--primary)" }}>{n.subject} • {n.topic}</div>
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
                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <span className="badge badge-neutral">Sem {n.semester}</span>
                        </td>
                        <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>{n.uploader}</td>
                        <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600 }}>{n.downloads}</td>
                        <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                            {n.status !== "APPROVED" && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "var(--success)" }}
                                title="Approve Note"
                                onClick={() => handleUpdateStatus(n.id, "APPROVED")}
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
                                onClick={() => handleUpdateStatus(n.id, "REJECTED")}
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                            <Link to={`/notes/${n.id}`} className="btn btn-ghost btn-sm" title="View details">
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
            </div>
          )}

          {/* TAB 3: REPORTS MANAGEMENT */}
          {activeTab === "reports" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Student Reports Management ({adminReports.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Review complaints submitted by students and take corrective moderation actions
                  </p>
                </div>
              </div>

              {adminReports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--success-light)",
                      color: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem"
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                    No Reports on Record!
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    All student flagged content has been reviewed and cleared.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {adminReports.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-light)",
                        background: rep.status === "OPEN" ? "#FFFBEB" : "var(--bg-card-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                          <span className={`badge ${rep.status === "OPEN" ? "badge-danger" : "badge-neutral"}`} style={{ fontSize: "0.75rem" }}>
                            {rep.status}
                          </span>
                          <span className="badge badge-purple" style={{ fontSize: "0.75rem" }}>
                            {rep.reason}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Reported on {rep.date}
                          </span>
                        </div>

                        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                          {rep.noteTitle}
                        </h4>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "0.5rem" }}>
                          "{rep.details}"
                        </p>
                        <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                          Reporter: <strong>{rep.reporter}</strong>
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Link to={`/notes/${rep.noteId}`} className="btn btn-outline btn-sm">
                          <Eye size={14} /> Inspect
                        </Link>
                        {rep.status !== "RESOLVED" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleUpdateReportStatus(rep.id, "RESOLVED")}
                          >
                            Resolve
                          </Button>
                        )}
                        {rep.status !== "DISMISSED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateReportStatus(rep.id, "DISMISSED")}
                          >
                            Dismiss
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setReportNoteToDelete(rep)}
                        >
                          Remove Note
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLATFORM SETTINGS */}
          {activeTab === "settings" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Platform Settings & Administration
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                System configuration and academic course attribution
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                    Database Synchronization
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
                    Reload live statistics and metadata directly from the PostgreSQL database.
                  </p>
                  <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAdminData}>
                    Refresh Live Metrics
                  </Button>
                </div>

                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                    Student Team Attribution
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    NoteNest — Developed by Team 4 (Second-Year Computer Science & Engineering Students)
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal for Notes Table */}
      <Modal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Admin: Delete Study Material"
        footer={
          <>
            <Button variant="outline" size="md" onClick={() => setNoteToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" icon={Trash2} onClick={confirmDeleteNote}>
              Remove Note
            </Button>
          </>
        }
      >
        <p style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          Are you sure you want to remove <strong>"{noteToDelete?.title}"</strong> from NoteNest? This will delete the note across all searches and student libraries.
        </p>
      </Modal>

      {/* Delete Confirmation Modal for Reports Table */}
      <Modal
        isOpen={!!reportNoteToDelete}
        onClose={() => setReportNoteToDelete(null)}
        title="Admin: Delete Reported Material"
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
        <p style={{ fontSize: "0.925rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          You are removing <strong>"{reportNoteToDelete?.noteTitle}"</strong> in response to report:
          <br />
          <em>"{reportNoteToDelete?.reason}"</em>.
        </p>
      </Modal>
    </div>
  );
}
