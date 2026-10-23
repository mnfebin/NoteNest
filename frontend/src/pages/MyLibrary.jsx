import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Compass,
  Trash2,
  FolderHeart,
  RefreshCw,
  AlertCircle,
  LogIn
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function MyLibrary() {
  const navigate = useNavigate();
  const {
    user,
    bookmarkedNotes,
    toggleBookmark,
    isBookmarksLoading,
    bookmarksError,
    fetchBookmarks
  } = useNotes();
  const [librarySearch, setLibrarySearch] = useState("");

  const filteredBookmarks = bookmarkedNotes.filter((note) => {
    const q = librarySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (note.title || "").toLowerCase().includes(q) ||
      (note.subject || "").toLowerCase().includes(q) ||
      (note.topic || "").toLowerCase().includes(q) ||
      (note.uploader || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Guest Mode Notice */}
      {!user && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            padding: "0.85rem 1.25rem",
            background: "var(--primary-light)",
            border: "1px solid var(--primary-border)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-main)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Bookmark size={18} color="var(--primary)" />
            <span>
              <strong>Guest Library:</strong> You are viewing locally saved notes. Sign in to synchronize your bookmarks across all college devices.
            </span>
          </div>
          <Link to="/login" className="btn btn-primary btn-sm">
            <LogIn size={14} /> Sign In
          </Link>
        </div>
      )}

      {/* Header */}
      <div
        className="section-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span className="badge badge-purple">
              <Bookmark size={14} /> Saved Resources
            </span>
            <span className="badge badge-neutral">
              {bookmarkedNotes.length} {bookmarkedNotes.length === 1 ? "saved note" : "saved notes"}
            </span>
          </div>
          <h1 className="section-title">My Study Library</h1>
          <p className="section-subtitle">
            Quickly access your bookmarked lecture notes, cheat sheets, and exam prep guides across semesters.
          </p>
        </div>

        {bookmarkedNotes.length > 0 && (
          <Button
            variant="outline"
            size="md"
            icon={Compass}
            onClick={() => navigate("/notes")}
          >
            Find More Notes
          </Button>
        )}
      </div>

      {/* API Error state with retry */}
      {bookmarksError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            background: "var(--warning-light)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "#92400E"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <AlertCircle size={18} />
            <span>{bookmarksError}. Showing available cached bookmarks.</span>
          </div>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchBookmarks}>
            Retry
          </Button>
        </div>
      )}

      {/* Search within Library */}
      {bookmarkedNotes.length > 0 && (
        <div style={{ marginBottom: "2rem", maxWidth: "480px" }}>
          <SearchBar
            value={librarySearch}
            onChange={setLibrarySearch}
            placeholder="Search within your saved notes..."
            size="md"
          />
        </div>
      )}

      {/* Loading State */}
      {isBookmarksLoading && bookmarkedNotes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
          <RefreshCw size={28} className="spin" style={{ color: "var(--primary)", marginBottom: "0.75rem" }} />
          <p>Loading your saved study materials...</p>
        </div>
      ) : bookmarkedNotes.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={FolderHeart}
          title="Your library is empty"
          message="You haven't bookmarked any notes yet. Browse the repository to save useful lecture materials and exam revisions for quick access."
          actionLabel="Explore Notes to Bookmark"
          onAction={() => navigate("/notes")}
          actionIcon={Compass}
        />
      ) : filteredBookmarks.length === 0 ? (
        /* Search Empty State */
        <EmptyState
          title="No saved notes match your query"
          message="We couldn't find any note in your library matching this search keyword."
          actionLabel="Clear Search"
          onAction={() => setLibrarySearch("")}
        />
      ) : (
        /* Bookmarks Grid */
        <div className="notes-grid">
          {filteredBookmarks.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              customAction={
                <button
                  type="button"
                  className="note-card-bookmark-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBookmark(note.id);
                  }}
                  title="Remove from saved library"
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 size={16} />
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
