import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  GraduationCap,
  UploadCloud,
  Download,
  Bookmark,
  Trash2,
  LogOut,
  AlertTriangle,
  Building,
  IdCard,
  PlusCircle
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function Profile() {
  const navigate = useNavigate();
  const {
    profile,
    myUploadedNotes,
    bookmarks,
    deleteNote,
    showToast
  } = useNotes();

  // Delete confirmation modal state
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Total downloads received by this user's uploads
  const totalMyDownloads = myUploadedNotes.reduce((sum, n) => sum + (n.downloads || 0), 0);

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleLogout = () => {
    showToast("Logged out of student session (Demo Mode)", "info");
    navigate("/login");
  };

  const initials = (profile?.name || "Alex Rivera")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("");

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Student Profile Card */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2rem", background: "#FFFFFF" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}
        >
          {/* Avatar and Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: "78px",
                height: "78px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                color: "#FFFFFF",
                fontSize: "1.85rem",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {profile.name}
                </h1>
                <span className="badge badge-blue">Verified Student</span>
                <span className="badge badge-purple">Semester {profile.semester}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  marginTop: "0.5rem",
                  flexWrap: "wrap",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Mail size={15} color="var(--primary)" /> {profile.email}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <GraduationCap size={15} color="var(--accent-purple)" /> {profile.branch}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Building size={15} color="var(--accent-teal)" /> {profile.college}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Button
              variant="primary"
              size="md"
              icon={UploadCloud}
              onClick={() => navigate("/upload")}
            >
              Upload New Note
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={LogOut}
              onClick={handleLogout}
              title="Logout from session"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Student Activity Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem"
        }}
      >
        <StatCard
          icon={UploadCloud}
          label="My Uploads"
          value={myUploadedNotes.length}
          subtext="Contributed study notes"
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
        />
        <StatCard
          icon={Download}
          label="Downloads Received"
          value={totalMyDownloads}
          subtext="Peer students helped"
          color="#059669"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
        />
        <StatCard
          icon={Bookmark}
          label="Saved Library"
          value={bookmarks.length}
          subtext="Bookmarked for revision"
          color="#7C3AED"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
        />
      </div>

      {/* My Uploaded Notes Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
              My Uploaded Notes ({myUploadedNotes.length})
            </h2>
            <p className="section-subtitle">
              Study notes and question solutions you have published for your classmates
            </p>
          </div>
        </div>

        {myUploadedNotes.length === 0 ? (
          <EmptyState
            icon={UploadCloud}
            title="You haven't uploaded any notes yet"
            message="Share your handwritten summaries, semester formula sheets, or exam guides to help classmates and build your student profile."
            actionLabel="Upload Your First Note"
            onAction={() => navigate("/upload")}
            actionIcon={UploadCloud}
          />
        ) : (
          <div className="notes-grid">
            {myUploadedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isOwner={true}
                onDelete={() => setNoteToDelete(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Confirm Note Deletion"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setNoteToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={Trash2}
              onClick={confirmDelete}
            >
              Delete Note Permanently
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
              Are you sure you want to delete this upload?
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              You are deleting <strong>"{noteToDelete?.title}"</strong>. This will remove the file and associated bookmark links from NoteNest.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
