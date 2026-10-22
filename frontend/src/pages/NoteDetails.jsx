import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Bookmark,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  Share2,
  BookOpen,
  Sparkles,
  Layers,
  Eye,
  FileCheck,
  Send
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { SUBJECT_METADATA } from "../data/notes";
import Button from "../components/Button";
import Modal from "../components/Modal";
import NoteCard from "../components/NoteCard";
import EmptyState from "../components/EmptyState";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, isBookmarked, toggleBookmark, downloadNote, addReport, showToast } = useNotes();

  // Find note
  const note = notes.find((n) => n.id === id);

  // Report Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inaccurate or outdated technical content");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // If note not found
  if (!note) {
    return (
      <div className="container" style={{ paddingTop: "2rem" }}>
        <EmptyState
          title="Note Not Found"
          message="The requested study resource could not be found or may have been removed."
          actionLabel="Return to Explore"
          onAction={() => navigate("/notes")}
          actionIcon={ArrowLeft}
        />
      </div>
    );
  }

  const bookmarked = isBookmarked(note.id);
  const subjectMeta = SUBJECT_METADATA[note.subject] || {
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE"
  };

  // Related notes from the same subject or semester
  const relatedNotes = notes
    .filter((n) => n.id !== note.id && (n.subject === note.subject || n.semester === note.semester))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Note link copied to clipboard!", "info");
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    setTimeout(() => {
      addReport({
        noteId: note.id,
        noteTitle: note.title,
        reason: reportReason,
        details: reportDetails
      });
      setIsSubmittingReport(false);
      setIsReportOpen(false);
      setReportDetails("");
    }, 400);
  };

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Back to Explore link */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/notes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-secondary)",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft size={16} /> Back to Explore Notes
        </Link>
      </div>

      {/* Main Content Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.3fr 1fr",
          gap: "2rem",
          alignItems: "start"
        }}
      >
        {/* Left Column: Details, Preview, Key Concepts */}
        <div>
          {/* Header Card */}
          <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span
                className="badge"
                style={{
                  backgroundColor: subjectMeta.bg,
                  color: subjectMeta.color,
                  borderColor: subjectMeta.border,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  fontSize: "0.825rem",
                  padding: "0.3rem 0.75rem"
                }}
              >
                {note.subject}
              </span>
              <span className="badge badge-purple" style={{ fontSize: "0.825rem", padding: "0.3rem 0.75rem" }}>
                Semester {note.semester}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: "0.825rem", padding: "0.3rem 0.75rem" }}>
                {note.topic}
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--text-main)",
                lineHeight: "1.3",
                marginBottom: "1rem"
              }}
            >
              {note.title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: "1.65",
                marginBottom: "1.5rem"
              }}
            >
              {note.description}
            </p>

            {/* Tags */}
            {note.tags && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Tags:</span>
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: "0.775rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Key Topics / Syllabus Outline */}
          <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FileCheck size={20} color="var(--primary)" />
              Key Concepts & Syllabus Coverage
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(note.keyConcepts || [
                "Fundamental architecture principles",
                "Formulas, proofs, and solved numerical problems",
                "University exam question bank mappings"
              ]).map((concept, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--bg-card-subtle)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "0.1rem"
                    }}
                  >
                    {index + 1}
                  </div>
                  <span style={{ fontSize: "0.925rem", color: "var(--text-main)", lineHeight: "1.5" }}>
                    {concept}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Document Preview Card */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Eye size={20} color="var(--accent-purple)" />
                Document Preview ({note.previewPages || 16} Pages)
              </h2>
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Verified Syllabus Match
              </span>
            </div>

            {/* Mock PDF Sheet Viewer */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1.5px dashed var(--border-light)",
                borderRadius: "var(--radius-lg)",
                padding: "2.5rem 1.5rem",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-md)",
                  background: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem"
                }}
              >
                <FileText size={32} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                {note.fileName || `${note.title}.pdf`}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Formatted PDF document • {note.fileSize} • Uploaded by {note.uploader}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={Download}
                  onClick={() => downloadNote(note)}
                >
                  Download Free PDF
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={Share2}
                  onClick={handleShare}
                >
                  Share Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions, Metadata Card & Related */}
        <div>
          {/* Quick Actions Card */}
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
              Resource Actions
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Button
                variant="primary"
                size="lg"
                icon={Download}
                onClick={() => downloadNote(note)}
                style={{ width: "100%" }}
              >
                Download Note ({note.fileSize})
              </Button>

              <Button
                variant={bookmarked ? "secondary" : "outline"}
                size="md"
                icon={Bookmark}
                onClick={() => toggleBookmark(note.id)}
                style={{ width: "100%" }}
              >
                {bookmarked ? "Saved in My Library" : "Bookmark Note"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={AlertTriangle}
                onClick={() => setIsReportOpen(true)}
                style={{ width: "100%", color: "var(--text-muted)", fontSize: "0.825rem" }}
              >
                Report Inappropriate / Broken Note
              </Button>
            </div>

            {/* Metadata List */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                fontSize: "0.875rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Uploader:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{note.uploader}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Upload Date:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{note.uploadDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>File Format:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{note.fileType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>File Size:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{note.fileSize}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Downloads:</span>
                <span style={{ fontWeight: 600, color: "var(--primary)" }}>{note.downloads} times</span>
              </div>
            </div>
          </div>

          {/* Related Notes Card */}
          {relatedNotes.length > 0 && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem" }}>
                Related Materials
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {relatedNotes.map((relNote) => (
                  <Link
                    key={relNote.id}
                    to={`/notes/${relNote.id}`}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-light)",
                      backgroundColor: "var(--bg-card-subtle)",
                      display: "block",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary-border)";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)";
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)" }}>
                      {relNote.subject} • Sem {relNote.semester}
                    </span>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.2rem", lineHeight: "1.3" }}>
                      {relNote.title}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem", display: "block" }}>
                      {relNote.downloads} downloads • {relNote.fileSize}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report Resource"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsReportOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={Send}
              disabled={isSubmittingReport}
              onClick={handleReportSubmit}
            >
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleReportSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              Reporting note: <strong style={{ color: "var(--text-main)" }}>"{note.title}"</strong>
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="report-reason">
              Reason for Reporting
            </label>
            <select
              id="report-reason"
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="Inaccurate or outdated technical content">Inaccurate or outdated technical content</option>
              <option value="Corrupted or blank PDF file">Corrupted or blank PDF file</option>
              <option value="Copyright infringement or proprietary book scan">Copyright infringement or proprietary book scan</option>
              <option value="Wrong subject or wrong semester categorization">Wrong subject or wrong semester categorization</option>
              <option value="Inappropriate language or spam">Inappropriate language or spam</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="report-details">
              Additional Details (Optional)
            </label>
            <textarea
              id="report-details"
              className="form-textarea"
              rows={3}
              placeholder="Explain what specific section or issue was found..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
