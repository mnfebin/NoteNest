import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Users,
  Download,
  AlertTriangle,
  Search,
  Trash2,
  CheckCircle,
  Eye,
  Settings,
  LayoutDashboard,
  Filter,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import Button from "../components/Button";

export default function AdminDashboard() {
  const { notes, reports, deleteNote, dismissReport, resetToSampleData } = useNotes();
  const [activeTab, setActiveTab] = useState("overview"); // overview, notes, reports, settings
  const [notesSearch, setNotesSearch] = useState("");
  const [reportNoteToDelete, setReportNoteToDelete] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeReports = Array.isArray(reports) ? reports : [];

  // Calculations
  const totalDownloads = safeNotes.reduce((sum, n) => sum + (n.downloads || 0), 0);
  const pendingReportsCount = safeReports.filter((r) => r.status === "Pending").length;
  const totalUsers = 1248; // Mock active college students count

  // Filter notes in table
  const filteredNotes = safeNotes.filter((note) => {
    const q = notesSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (note.title || "").toLowerCase().includes(q) ||
      (note.subject || "").toLowerCase().includes(q) ||
      (note.uploader || "").toLowerCase().includes(q)
    );
  });

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const confirmDeleteReportedNote = () => {
    if (reportNoteToDelete) {
      deleteNote(reportNoteToDelete.noteId);
      dismissReport(reportNoteToDelete.id);
      setReportNoteToDelete(null);
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
              Monitor study material quality, resolve student reports, and audit repository activities.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={resetToSampleData}
            >
              Reset Seed Data
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
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <LayoutDashboard size={17} /> Overview
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
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <FileText size={17} /> Notes Repository
              </span>
              <span style={{ fontSize: "0.75rem", background: "var(--bg-card-subtle)", padding: "0.1rem 0.4rem", borderRadius: "999px" }}>
                {notes.length}
              </span>
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
                color: activeTab === "reports" ? "var(--danger)" : "var(--text-secondary)",
                backgroundColor: activeTab === "reports" ? "var(--danger-light)" : "transparent",
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <AlertTriangle size={17} /> Pending Reports
              </span>
              {reports.length > 0 && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    background: "var(--danger)",
                    color: "#FFFFFF",
                    padding: "0.1rem 0.45rem",
                    borderRadius: "999px",
                    fontWeight: 700
                  }}
                >
                  {reports.length}
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
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <Settings size={17} /> Platform Settings
            </button>
          </nav>
        </aside>

        {/* Admin Main Body */}
        <main>
          {/* STATS ROW (Always visible in Overview, or relevant in all) */}
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
              value={totalUsers.toLocaleString()}
              subtext="+42 new this week"
              color="#2563EB"
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
            />
            <StatCard
              icon={FileText}
              label="Total Notes"
              value={notes.length}
              subtext="Peer reviewed PDFs"
              color="#7C3AED"
              bgColor="#F5F3FF"
              borderColor="#DDD6FE"
            />
            <StatCard
              icon={Download}
              label="Total Downloads"
              value={totalDownloads.toLocaleString()}
              subtext="Cumulative semester reads"
              color="#059669"
              bgColor="#ECFDF5"
              borderColor="#A7F3D0"
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Reports"
              value={pendingReportsCount}
              subtext={pendingReportsCount > 0 ? "Requires review" : "All reports cleared"}
              color={pendingReportsCount > 0 ? "#DC2626" : "#64748B"}
              bgColor={pendingReportsCount > 0 ? "#FEF2F2" : "#F8FAFC"}
              borderColor={pendingReportsCount > 0 ? "#FECACA" : "#E2E8F0"}
            />
          </div>

          {/* TAB 1: OVERVIEW & RECENT AUDIT */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Reports Alert Box if any reports */}
              {reports.length > 0 && (
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
                        {reports.length} Content {reports.length === 1 ? "Report" : "Reports"} Awaiting Inspection
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Students have flagged potential syllabus errors or formatting issues.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setActiveTab("reports")}
                  >
                    Review Reports
                  </Button>
                </div>
              )}

              {/* Recent Notes Table Preview */}
              <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                      Recent Uploads Overview
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Latest notes submitted across all engineering branches
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("notes")}
                  >
                    View All Repository ({notes.length})
                  </Button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title & Subject</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Semester</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Uploader</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Downloads</th>
                        <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.slice(0, 6).map((n) => (
                        <tr key={n.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{n.title}</div>
                            <div style={{ fontSize: "0.775rem", color: "var(--primary)" }}>{n.subject} • {n.topic}</div>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem" }}>
                            <span className="badge badge-neutral">Sem {n.semester}</span>
                          </td>
                          <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>{n.uploader}</td>
                          <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600 }}>{n.downloads}</td>
                          <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              <Link to={`/notes/${n.id}`} className="btn btn-ghost btn-sm" title="View details">
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
              </div>
            </div>
          )}

          {/* TAB 2: FULL NOTES REPOSITORY MANAGEMENT */}
          {activeTab === "notes" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Repository Materials ({filteredNotes.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Filter, inspect, and remove notes from the public directory
                  </p>
                </div>

                <div style={{ width: "280px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filter by title, uploader..."
                    value={notesSearch}
                    onChange={(e) => setNotesSearch(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
                  />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title & Subject</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Semester</th>
                      <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Size</th>
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
                          <span className="badge badge-neutral">Sem {n.semester}</span>
                        </td>
                        <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-muted)" }}>{n.fileSize}</td>
                        <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>{n.uploader}</td>
                        <td style={{ padding: "0.85rem 0.5rem", fontWeight: 600 }}>{n.downloads}</td>
                        <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.35rem" }}>
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
          )}

          {/* TAB 3: REPORTS MANAGEMENT TABLE */}
          {activeTab === "reports" && (
            <div className="card" style={{ padding: "1.75rem", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Reports Management ({reports.length})
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Review complaints submitted by students and take corrective moderation actions
                  </p>
                </div>
              </div>

              {reports.length === 0 ? (
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
                    No Pending Reports!
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    All student flagged content has been reviewed and cleared.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-light)",
                        background: "var(--bg-card-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => dismissReport(rep.id)}
                        >
                          Dismiss
                        </Button>
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
                Platform Settings & Maintenance
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Demo environment parameters and college configuration
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                    Demo Data Management
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
                    Reset all local storage notes, reports, and bookmarks to the official seed syllabus.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={resetToSampleData}
                  >
                    Reset All Data to Factory Seed
                  </Button>
                </div>

                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                    Course Attribution
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Team 4 — Second Year Computer Science & Engineering (FSD Course Project)
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
