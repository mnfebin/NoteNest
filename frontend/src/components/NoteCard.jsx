import React from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Download,
  Calendar,
  FileText,
  Tag,
  ArrowRight,
  Trash2
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { SUBJECT_METADATA } from "../data/notes";

export default function NoteCard({
  note,
  onDelete,
  isOwner = false,
  customAction = null
}) {
  if (!note) return null;

  const { isBookmarked, toggleBookmark, downloadNote } = useNotes();
  const bookmarked = isBookmarked(note.id);

  const subjectMeta = SUBJECT_METADATA[note.subject] || {
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE"
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(note.id);
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    downloadNote(note);
  };

  return (
    <article className="note-card">
      {/* Card Header: Badges & Bookmark */}
      <div className="note-card-header">
        <div className="note-card-badges">
          <span
            className="badge"
            style={{
              backgroundColor: subjectMeta.bg,
              color: subjectMeta.color,
              borderColor: subjectMeta.border,
              borderWidth: "1px",
              borderStyle: "solid"
            }}
          >
            {note.subject}
          </span>
          <span className="badge badge-neutral">
            Sem {note.semester}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {customAction}
          
          {isOwner && onDelete && (
            <button
              type="button"
              className="note-card-bookmark-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(note.id);
              }}
              title="Delete this upload"
              style={{ color: "var(--danger)" }}
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            type="button"
            className={`note-card-bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
            title={bookmarked ? "Bookmarked (Click to remove)" : "Bookmark this note"}
          >
            <Bookmark
              size={18}
              fill={bookmarked ? "var(--accent-purple)" : "none"}
              color={bookmarked ? "var(--accent-purple)" : "currentColor"}
            />
          </button>
        </div>
      </div>

      {/* Note Title */}
      <Link to={`/notes/${note.id}`} style={{ display: "block" }}>
        <h3 className="note-card-title" title={note.title}>
          {note.title}
        </h3>
      </Link>

      {/* Topic Subheading */}
      <div className="note-card-topic">
        <Tag size={13} />
        <span>{note.topic}</span>
      </div>

      {/* Description */}
      <p className="note-card-desc">
        {note.description}
      </p>

      {/* Footer Meta */}
      <div className="note-card-footer">
        <div className="note-card-uploader" title={`Uploaded by ${note.uploader}`}>
          <div className="uploader-avatar">
            {note.uploader ? note.uploader[0].toUpperCase() : "U"}
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            {note.uploader}
          </span>
        </div>

        <div className="note-card-meta">
          <span className="note-card-stat" title={`${note.downloads} total downloads`}>
            <Download size={13} />
            <span>{note.downloads}</span>
          </span>
          <span className="note-card-stat" title={`File size: ${note.fileSize}`}>
            <FileText size={13} />
            <span>{note.fileSize}</span>
          </span>
        </div>
      </div>

      {/* Bottom Action strip */}
      <div
        style={{
          marginTop: "0.85rem",
          paddingTop: "0.75rem",
          borderTop: "1px dashed var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Calendar size={12} />
          {note.uploadDate}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleDownloadClick}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.775rem", color: "var(--primary)" }}
            title="Download PDF"
          >
            <Download size={13} /> Get PDF
          </button>
          <Link
            to={`/notes/${note.id}`}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.25rem 0.65rem", fontSize: "0.775rem" }}
          >
            View <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
