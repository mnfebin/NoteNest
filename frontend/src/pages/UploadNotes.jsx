import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { SUBJECTS, SEMESTERS } from "../data/notes";
import Button from "../components/Button";

export default function UploadNotes() {
  const navigate = useNavigate();
  const { addNote } = useNotes();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "4",
    topic: "",
    keyConcept1: "",
    keyConcept2: "",
    keyConcept3: ""
  });

  // Selected File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({
        ...prev,
        file: "Only PDF format files (.pdf) are allowed for study notes."
      }));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: "File size exceeds 25 MB limit."
      }));
      return;
    }

    setSelectedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      raw: file
    });

    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Note title is required.";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title should be at least 5 characters.";
    }

    if (!formData.subject || formData.subject === "All Subjects") {
      newErrors.subject = "Please select a valid engineering subject.";
    }

    if (!formData.semester) {
      newErrors.semester = "Please specify the semester.";
    }

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic / Module name is required (e.g. Memory Management).";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please provide a short description or syllabus summary.";
    } else if (formData.description.trim().length < 15) {
      newErrors.description = "Description should be at least 15 characters.";
    }

    if (!selectedFile) {
      newErrors.file = "Please attach a PDF document.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate upload latency
    setTimeout(() => {
      const concepts = [
        formData.keyConcept1,
        formData.keyConcept2,
        formData.keyConcept3
      ].filter(Boolean);

      const created = addNote({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        semester: formData.semester,
        topic: formData.topic,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        keyConcepts: concepts.length > 0 ? concepts : undefined
      });

      setIsSubmitting(false);
      setUploadSuccess(created);
    }, 700);
  };

  const availableSubjects = SUBJECTS.filter((s) => s !== "All Subjects");
  const availableSemesters = SEMESTERS.filter((s) => s.value !== "all");

  return (
    <div className="container" style={{ maxWidth: "800px", paddingTop: "1rem" }}>
      {/* Header */}
      <div className="section-header" style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-blue">
            <UploadCloud size={14} /> Contribute to NoteNest
          </span>
        </div>
        <h1 className="section-title">Upload Study Materials</h1>
        <p className="section-subtitle">
          Share your high-yield lecture notes, exam cheat sheets, and unit summaries with the CSE student community.
        </p>
      </div>

      {/* Success Banner if note was uploaded */}
      {uploadSuccess ? (
        <div
          className="card"
          style={{
            padding: "2.5rem 2rem",
            textAlign: "center",
            background: "#FFFFFF",
            border: "1.5px solid var(--success-border)"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--success-light)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem"
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
            Note Published Successfully!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem", lineHeight: "1.6" }}>
            <strong>"{uploadSuccess.title}"</strong> is now live on NoteNest! Classmates can now search, bookmark, and study your notes.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate(`/notes/${uploadSuccess.id}`)}
            >
              View Uploaded Note
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setUploadSuccess(null);
                setFormData({
                  title: "",
                  description: "",
                  subject: "",
                  semester: "4",
                  topic: "",
                  keyConcept1: "",
                  keyConcept2: "",
                  keyConcept3: ""
                });
                setSelectedFile(null);
              }}
            >
              Upload Another Note
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </Button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="card" style={{ padding: "2rem", background: "#FFFFFF" }}>
          {/* Note Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-title">
              Note Title *
            </label>
            <input
              id="note-title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? "input-error" : ""}`}
              placeholder="e.g. Operating Systems — Memory Management & Paging Formulas"
              value={formData.title}
              onChange={handleInputChange}
            />
            {errors.title && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.title}
              </span>
            )}
          </div>

          {/* Subject & Semester Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
            {/* Subject */}
            <div className="form-group">
              <label className="form-label" htmlFor="note-subject">
                Subject / Course *
              </label>
              <select
                id="note-subject"
                name="subject"
                className={`form-select ${errors.subject ? "input-error" : ""}`}
                value={formData.subject}
                onChange={handleInputChange}
              >
                <option value="">Select subject...</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <span className="form-error">
                  <AlertCircle size={14} /> {errors.subject}
                </span>
              )}
            </div>

            {/* Semester */}
            <div className="form-group">
              <label className="form-label" htmlFor="note-semester">
                Semester *
              </label>
              <select
                id="note-semester"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleInputChange}
              >
                {availableSemesters.map((sem) => (
                  <option key={sem.value} value={sem.value}>
                    {sem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-topic">
              Topic / Unit Name *
            </label>
            <input
              id="note-topic"
              name="topic"
              type="text"
              className={`form-input ${errors.topic ? "input-error" : ""}`}
              placeholder="e.g. Virtual Memory, LRU Page Replacement, TLB"
              value={formData.topic}
              onChange={handleInputChange}
            />
            {errors.topic && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.topic}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-desc">
              Description & Syllabus Outline *
            </label>
            <textarea
              id="note-desc"
              name="description"
              rows={4}
              className={`form-textarea ${errors.description ? "input-error" : ""}`}
              placeholder="Briefly describe what this note covers, question patterns, or derivation steps included..."
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.description}
              </span>
            )}
          </div>

          {/* Optional Key Concepts */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">
              Key Concepts Highlights (Optional)
            </label>
            <p className="form-hint" style={{ marginBottom: "0.5rem" }}>
              Add up to 3 bullet points that will appear on the note preview card.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="text"
                name="keyConcept1"
                className="form-input"
                placeholder="Key concept 1 (e.g. Solved numerical problems for university exams)"
                value={formData.keyConcept1}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="keyConcept2"
                className="form-input"
                placeholder="Key concept 2 (e.g. Hand-drawn architecture diagrams)"
                value={formData.keyConcept2}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="keyConcept3"
                className="form-input"
                placeholder="Key concept 3 (e.g. Quick revision formula sheets)"
                value={formData.keyConcept3}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">
              PDF Document Attachment *
            </label>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${
                    errors.file ? "var(--danger)" : isDragging ? "var(--primary)" : "var(--border-light)"
                  }`,
                  backgroundColor: isDragging ? "var(--primary-light)" : "var(--bg-app)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 0.75rem",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <UploadCloud size={24} />
                </div>

                <p style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  Click to select or drag and drop your PDF here
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  PDF format only • Up to 25 MB file size
                </p>
              </div>
            ) : (
              /* Selected File Preview Box */
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-border)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-sm)",
                      background: "#FFFFFF",
                      color: "#DC2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.925rem", color: "var(--text-main)", display: "block" }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                      PDF document • {selectedFile.size}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{
                    color: "var(--text-light)",
                    padding: "0.35rem",
                    borderRadius: "50%"
                  }}
                  title="Remove selected file"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-light)")}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {errors.file && (
              <span className="form-error">
                <AlertCircle size={14} /> {errors.file}
              </span>
            )}
          </div>

          {/* Form Notice */}
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "var(--bg-card-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.825rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1.75rem"
            }}
          >
            <Info size={18} color="var(--primary)" flexShrink={0} />
            <span>
              <strong>Frontend Demo Note:</strong> Uploads are saved into your browser's local state and will instantly appear in Explore Notes and your Profile.
            </span>
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UploadCloud}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing Notes..." : "Publish Note to Community"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
