import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import Modal from "./Modal";
import Button from "./Button";

export const REPORT_REASONS = [
  "Inappropriate content",
  "Incorrect or misleading information",
  "Copyright concern",
  "Spam or duplicate content",
  "Other"
];

export default function ReportModal({ isOpen, onClose, note }) {
  const { user, addReport, showToast } = useNotes();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast("Please sign in to report this note.", "warning");
      return;
    }

    if (!reason) {
      showToast("Please select a reason for reporting.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await addReport({
        noteId: note.id,
        noteTitle: note.title,
        reason,
        description: description.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription("");
        setReason(REPORT_REASONS[0]);
        onClose();
      }, 1500);
    } catch (err) {
      showToast(err.message || "Failed to submit report. Please try again.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitted(false);
      setDescription("");
      setReason(REPORT_REASONS[0]);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Study Material"
      footer={
        submitted ? null : (
          <>
            <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {user ? (
              <Button
                variant="danger"
                size="md"
                icon={AlertTriangle}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Report..." : "Submit Report"}
              </Button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-md">
                Sign In to Report
              </Link>
            )}
          </>
        )
      }
    >
      {submitted ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
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
            <CheckCircle2 size={28} />
          </div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
            Report Submitted
          </h4>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Thank you for helping maintain high academic quality. Our moderators will review this note.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Note Title preview */}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "var(--bg-app)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              marginBottom: "1.25rem"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>
              Selected Note
            </span>
            <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
              {note.title}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              {note.subject} • Semester {note.semester}
            </div>
          </div>

          {!user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.85rem 1rem",
                background: "var(--warning-light)",
                border: "1px solid var(--warning-border)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "#92400E"
              }}
            >
              <Lock size={18} />
              <span>
                You must be logged in as a student to submit a report to administrators.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="report-reason-select">
              Reason for Reporting <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="report-reason-select"
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting || !user}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="report-description-text">
              Additional Details (Optional)
            </label>
            <textarea
              id="report-description-text"
              className="form-textarea"
              rows={3}
              placeholder="Provide specific details about the issue (e.g., page number, error description, or context)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || !user}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)"
            }}
          >
            <ShieldAlert size={14} />
            <span>
              Reports are reviewed by the NoteNest academic moderation panel. Notes are not removed automatically.
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
}
