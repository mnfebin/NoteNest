import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_NOTES, INITIAL_REPORTS } from "../data/notes";

const NotesContext = createContext(null);

const STORAGE_KEYS = {
  NOTES: "notenest_notes_v1",
  BOOKMARKS: "notenest_bookmarks_v1",
  USER_UPLOADS: "notenest_user_uploads_v1",
  REPORTS: "notenest_reports_v1",
  USER_PROFILE: "notenest_profile_v1"
};

export const DEFAULT_PROFILE = {
  name: "Alex Rivera",
  email: "alex.rivera@college.edu",
  branch: "Computer Science & Engineering",
  semester: 4,
  college: "National Institute of Technology",
  studentId: "CSE-2024-082"
};

export function NotesProvider({ children }) {
  // 1. All Notes state with rigorous fallback
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load notes from localStorage, falling back to seed", e);
    }
    return INITIAL_NOTES;
  });

  // 2. Bookmarks state (array of note IDs)
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load bookmarks from localStorage", e);
    }
    return ["note-1", "note-3"];
  });

  // 3. User upload IDs
  const [userUploadIds, setUserUploadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_UPLOADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load user uploads from localStorage", e);
    }
    return ["note-3"];
  });

  // 4. Reports state for Admin Dashboard
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load reports from localStorage", e);
    }
    return INITIAL_REPORTS;
  });

  // 5. User Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.name) {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Failed to load profile", e);
    }
    return DEFAULT_PROFILE;
  });

  // 6. Global Toast notification feedback
  const [toast, setToast] = useState(null);

  // Sync state with localStorage safely
  useEffect(() => {
    try {
      if (Array.isArray(notes)) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      }
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      if (Array.isArray(bookmarks)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      }
    } catch (e) {
      console.error(e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      if (Array.isArray(userUploadIds)) {
        localStorage.setItem(STORAGE_KEYS.USER_UPLOADS, JSON.stringify(userUploadIds));
      }
    } catch (e) {
      console.error(e);
    }
  }, [userUploadIds]);

  useEffect(() => {
    try {
      if (Array.isArray(reports)) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      }
    } catch (e) {
      console.error(e);
    }
  }, [reports]);

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const hideToast = () => setToast(null);

  // Toggle Bookmark
  const toggleBookmark = (noteId) => {
    setBookmarks((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.includes(noteId);
      if (exists) {
        showToast("Removed from My Library", "info");
        return list.filter((id) => id !== noteId);
      } else {
        showToast("Saved to My Library", "success");
        return [...list, noteId];
      }
    });
  };

  const isBookmarked = (noteId) => Array.isArray(bookmarks) && bookmarks.includes(noteId);

  // Upload new note
  const addNote = (newNoteData) => {
    const id = "note-" + Date.now();
    const safeName = profile?.name || DEFAULT_PROFILE.name;
    const safeEmail = profile?.email || DEFAULT_PROFILE.email;

    const createdNote = {
      id,
      title: (newNoteData.title || "Untitled Note").trim(),
      description: (newNoteData.description || "No description provided.").trim(),
      subject: newNoteData.subject || "Computer Science",
      semester: Number(newNoteData.semester) || 4,
      topic: (newNoteData.topic || "General").trim(),
      uploader: safeName,
      uploaderEmail: safeEmail,
      uploadDate: new Date().toISOString().split("T")[0],
      fileType: "PDF",
      fileSize: newNoteData.fileSize || "3.5 MB",
      fileName: newNoteData.fileName || "Study_Notes.pdf",
      downloads: 0,
      previewPages: Math.floor(Math.random() * 15) + 6,
      tags: [(newNoteData.topic || "Notes").trim(), newNoteData.subject || "CSE"],
      keyConcepts: newNoteData.keyConcepts || [
        "Core exam-focused definitions and formulas",
        "Key module architectures and diagrams",
        "Solved previous year question patterns"
      ]
    };

    setNotes((prev) => [createdNote, ...(Array.isArray(prev) ? prev : [])]);
    setUserUploadIds((prev) => [id, ...(Array.isArray(prev) ? prev : [])]);
    showToast(`"${createdNote.title}" uploaded successfully!`, "success");
    return createdNote;
  };

  // Delete note
  const deleteNote = (noteId) => {
    setNotes((prev) => (Array.isArray(prev) ? prev.filter((n) => n.id !== noteId) : []));
    setBookmarks((prev) => (Array.isArray(prev) ? prev.filter((id) => id !== noteId) : []));
    setUserUploadIds((prev) => (Array.isArray(prev) ? prev.filter((id) => id !== noteId) : []));
    setReports((prev) => (Array.isArray(prev) ? prev.filter((r) => r.noteId !== noteId) : []));
    showToast("Note deleted successfully", "info");
  };

  // Add report
  const addReport = (reportData) => {
    const newReport = {
      id: "rep-" + Date.now(),
      noteId: reportData.noteId,
      noteTitle: reportData.noteTitle,
      reason: reportData.reason,
      details: reportData.details || "No additional comments provided.",
      reporter: profile?.email || DEFAULT_PROFILE.email,
      date: new Date().toISOString().split("T")[0],
      status: "Pending"
    };

    setReports((prev) => [newReport, ...(Array.isArray(prev) ? prev : [])]);
    showToast("Report submitted to administrators. Thank you!", "info");
    return newReport;
  };

  // Resolve or dismiss report
  const dismissReport = (reportId) => {
    setReports((prev) => (Array.isArray(prev) ? prev.filter((r) => r.id !== reportId) : []));
    showToast("Report dismissed", "info");
  };

  // Download simulation
  const downloadNote = (note) => {
    if (!note) return;
    setNotes((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) =>
        n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      )
    );

    const dummyContent = `NoteNest Academic Study Material\n=================================\n\nTitle: ${note.title}\nSubject: ${note.subject} (Semester ${note.semester})\nTopic: ${note.topic}\nUploader: ${note.uploader} (${note.uploaderEmail || "Verified Student"})\nUpload Date: ${note.uploadDate}\n\nKey Concepts:\n${(note.keyConcepts || []).map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nSummary:\n${note.description}\n\n---------------------------------\nDownloaded via NoteNest — Student Notes Sharing Platform\nKeep learning and sharing!`;

    const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(note.title || "Note").replace(/[^a-zA-Z0-9_-]/g, "_")}_NoteNest.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloading "${note.title}"...`, "success");
  };

  // Reset sample data helper
  const resetToSampleData = () => {
    setNotes(INITIAL_NOTES);
    setBookmarks(["note-1", "note-3"]);
    setUserUploadIds(["note-3"]);
    setReports(INITIAL_REPORTS);
    setProfile(DEFAULT_PROFILE);
    showToast("Demo data reset to initial default values", "info");
  };

  const safeNotes = Array.isArray(notes) ? notes : INITIAL_NOTES;
  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  const safeUploads = Array.isArray(userUploadIds) ? userUploadIds : [];
  const safeProfile = profile || DEFAULT_PROFILE;

  const bookmarkedNotes = safeNotes.filter((n) => safeBookmarks.includes(n.id));
  const myUploadedNotes = safeNotes.filter((n) => safeUploads.includes(n.id));

  return (
    <NotesContext.Provider
      value={{
        notes: safeNotes,
        bookmarks: safeBookmarks,
        bookmarkedNotes,
        myUploadedNotes,
        userUploadIds: safeUploads,
        reports: Array.isArray(reports) ? reports : INITIAL_REPORTS,
        profile: safeProfile,
        toast,
        showToast,
        hideToast,
        toggleBookmark,
        isBookmarked,
        addNote,
        deleteNote,
        addReport,
        dismissReport,
        downloadNote,
        resetToSampleData
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
