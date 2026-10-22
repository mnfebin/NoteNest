import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Compass,
  Trash2,
  BookOpen,
  ArrowRight,
  FolderHeart
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function MyLibrary() {
  const navigate = useNavigate();
  const { bookmarkedNotes, toggleBookmark } = useNotes();
  const [librarySearch, setLibrarySearch] = useState("");

  const filteredBookmarks = bookmarkedNotes.filter((note) => {
    const q = librarySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.subject.toLowerCase().includes(q) ||
      note.topic.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Header */}
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
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
            Quickly access your bookmarked lecture notes, cheat sheets, and exam prep guides across devices.
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

      {/* Bookmarks Grid or Empty State */}
      {bookmarkedNotes.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title="Your library is empty"
          message="You haven't bookmarked any notes yet. Browse the repository to save useful lecture materials and exam revisions for quick offline access."
          actionLabel="Explore Notes to Bookmark"
          onAction={() => navigate("/notes")}
          actionIcon={Compass}
        />
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          title="No saved notes match your query"
          message="We couldn't find any note in your library matching this search keyword."
          actionLabel="Clear Search"
          onAction={() => setLibrarySearch("")}
        />
      ) : (
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
