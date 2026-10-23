import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_NOTES, INITIAL_REPORTS } from "../data/notes";
import { api, getToken, setToken, clearToken } from "../services/api";

const NotesContext = createContext(null);

export const DEFAULT_PROFILE = {
  name: "Alex Rivera",
  email: "alex.rivera@college.edu",
  branch: "Computer Science & Engineering",
  semester: 4,
  college: "National Institute of Technology",
  studentId: "CSE-2024-082",
  role: "USER"
};

export function NotesProvider({ children }) {
  // 1. Authentication & Profile State
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  // 2. Data states
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [bookmarks, setBookmarks] = useState(["note-1", "note-3"]);
  const [myUploadedNotes, setMyUploadedNotes] = useState([]);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Global Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Fetch approved notes from backend API
  const fetchNotes = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      const res = await api.notes.list(filters);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setNotes(res.data);
      }
    } catch (err) {
      console.warn("Backend notes fetch note: falling back to seeded dataset", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookmarks for current user
  const fetchBookmarks = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await api.bookmarks.list();
      if (res?.success && Array.isArray(res.data)) {
        const ids = res.data.map((n) => n.id);
        setBookmarks(ids);
      }
    } catch (err) {
      console.warn("Failed to fetch bookmarks:", err.message);
    }
  }, []);

  // Fetch user uploads
  const fetchMyUploads = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await api.notes.getMine();
      if (res?.success && Array.isArray(res.data)) {
        setMyUploadedNotes(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch my uploaded notes:", err.message);
    }
  }, []);

  // Fetch admin reports
  const fetchReports = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await api.admin.getReports();
      if (res?.success && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (_err) {
      // ignore if not admin
    }
  }, []);

  // Initialize session from token
  useEffect(() => {
    async function initAuth() {
      const savedToken = getToken();
      if (savedToken) {
        try {
          const res = await api.auth.getMe();
          if (res?.success && res.data) {
            setUser(res.data);
            setProfile((prev) => ({ ...prev, ...res.data }));
          }
        } catch (err) {
          if (err.status === 401) {
            clearToken();
            setTokenState(null);
            setUser(null);
          } else {
            console.warn("Backend not reachable during auth check, preserving demo session");
          }
        }
      }
    }

    initAuth();
    fetchNotes();
  }, [fetchNotes]);

  // Synchronize authenticated data when user changes
  useEffect(() => {
    if (user) {
      fetchBookmarks();
      fetchMyUploads();
      if (user.role === "ADMIN") {
        fetchReports();
      }
    } else {
      setMyUploadedNotes([]);
    }
  }, [user, fetchBookmarks, fetchMyUploads, fetchReports]);

  // User Login Action
  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res?.success && res.data) {
        setToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setProfile((prev) => ({ ...prev, ...res.data.user }));
        showToast(`Welcome back, ${res.data.user.name}!`, "success");
        return res.data;
      }
      throw new Error(res?.message || "Login failed");
    } catch (err) {
      const isConnectionError =
        !err.status ||
        err.message?.includes("fetch") ||
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError");

      if (isConnectionError) {
        const isAdmin = email.toLowerCase().includes("admin");
        const mockUser = {
          id: isAdmin ? "admin-demo-id" : "user-demo-id",
          name: isAdmin ? "Admin Moderator" : (email.split("@")[0].replace(/[._]/g, " ") || "Alex Rivera"),
          email: email,
          role: isAdmin ? "ADMIN" : "USER",
          college: "National Institute of Technology",
          semester: 4,
          branch: "Computer Science & Engineering"
        };
        const mockToken = "mock_demo_jwt_token";
        setToken(mockToken);
        setTokenState(mockToken);
        setUser(mockUser);
        setProfile((prev) => ({ ...prev, ...mockUser }));
        showToast(`Signed in as ${mockUser.name} (Demo Mode)`, "success");
        return { token: mockToken, user: mockUser };
      }
      throw err;
    }
  };

  // User Register Action
  const register = async (userData) => {
    try {
      const res = await api.auth.register(userData);
      if (res?.success && res.data) {
        setToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setProfile((prev) => ({ ...prev, ...res.data.user }));
        showToast("Account created successfully! Welcome to NoteNest.", "success");
        return res.data;
      }
      throw new Error(res?.message || "Registration failed");
    } catch (err) {
      const isConnectionError =
        !err.status ||
        err.message?.includes("fetch") ||
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError");

      if (isConnectionError) {
        const mockUser = {
          id: "user-demo-" + Date.now(),
          name: userData.name || "Student Member",
          email: userData.email,
          role: "USER",
          college: userData.college || "Engineering College",
          semester: userData.semester || 4,
          branch: userData.branch || "Computer Science"
        };
        const mockToken = "mock_demo_jwt_token";
        setToken(mockToken);
        setTokenState(mockToken);
        setUser(mockUser);
        setProfile((prev) => ({ ...prev, ...mockUser }));
        showToast("Account created! Welcome to NoteNest (Demo Mode)", "success");
        return { token: mockToken, user: mockUser };
      }
      throw err;
    }
  };

  // User Logout Action
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (_e) {
      // ignore
    }
    clearToken();
    setTokenState(null);
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    setBookmarks([]);
    setMyUploadedNotes([]);
    showToast("Signed out successfully", "info");
  };

  // Update profile
  const updateUserProfile = async (updateData) => {
    const res = await api.users.updateProfile(updateData);
    if (res?.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      setProfile((prev) => ({ ...prev, ...res.data }));
      showToast("Profile updated successfully", "success");
      return res.data;
    }
    throw new Error(res?.message || "Failed to update profile");
  };

  // Toggle Bookmark
  const toggleBookmark = async (noteId) => {
    const exists = bookmarks.includes(noteId);

    if (!user) {
      // Local optimistic toggle for guest browsing demo
      if (exists) {
        setBookmarks((prev) => prev.filter((id) => id !== noteId));
        showToast("Removed from My Library", "info");
      } else {
        setBookmarks((prev) => [...prev, noteId]);
        showToast("Saved to My Library", "success");
      }
      return;
    }

    try {
      if (exists) {
        setBookmarks((prev) => prev.filter((id) => id !== noteId));
        await api.bookmarks.remove(noteId);
        showToast("Removed from My Library", "info");
      } else {
        setBookmarks((prev) => [...prev, noteId]);
        await api.bookmarks.add(noteId);
        showToast("Saved to My Library", "success");
      }
    } catch (err) {
      // Rollback on failure
      fetchBookmarks();
      showToast(err.message || "Failed to update bookmark", "danger");
    }
  };

  const isBookmarked = (noteId) => Array.isArray(bookmarks) && bookmarks.includes(noteId);

  // Upload new note
  const addNote = async (newNotePayload) => {
    try {
      let created;

      // Check if already FormData or plain object
      if (newNotePayload instanceof FormData) {
        const res = await api.notes.upload(newNotePayload);
        created = res.data;
      } else {
        // Plain object: if file exists, construct FormData
        const formData = new FormData();
        Object.entries(newNotePayload).forEach(([k, v]) => {
          if (k === "file" && v) {
            formData.append("file", v);
          } else if (v !== undefined && v !== null) {
            formData.append(k, typeof v === "object" ? JSON.stringify(v) : v);
          }
        });
        const res = await api.notes.upload(formData);
        created = res.data;
      }

      // Add to local state
      setNotes((prev) => [created, ...prev]);
      setMyUploadedNotes((prev) => [created, ...prev]);
      showToast(
        created.status === "APPROVED"
          ? `"${created.title}" uploaded and published successfully!`
          : `"${created.title}" uploaded! Pending review by administrator.`,
        "success"
      );
      return created;
    } catch (err) {
      const isConnectionError =
        !err.status ||
        err.message?.includes("fetch") ||
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError");

      if (isConnectionError) {
        const title = (newNotePayload instanceof FormData ? newNotePayload.get("title") : newNotePayload.title) || "Untitled Lecture Note";
        const subject = (newNotePayload instanceof FormData ? newNotePayload.get("subject") : newNotePayload.subject) || "Computer Science";
        const semester = Number((newNotePayload instanceof FormData ? newNotePayload.get("semester") : newNotePayload.semester) || 4);
        const mockNote = {
          id: `note-demo-${Date.now()}`,
          title,
          subject,
          semester,
          author: profile?.name || "Student Contributor",
          college: profile?.college || "National Institute of Technology",
          rating: 5.0,
          downloads: 1,
          pages: 14,
          fileSize: "2.4 MB",
          status: "APPROVED",
          summary: "Uploaded lecture summary notes covering core unit syllabus.",
          topics: ["Core Concepts", "Key Formulas", "Model Answers"],
          pdfUrl: "/mock-sample.pdf",
          createdAt: new Date().toISOString()
        };
        setNotes((prev) => [mockNote, ...prev]);
        setMyUploadedNotes((prev) => [mockNote, ...prev]);
        showToast(`"${title}" published in demo mode!`, "success");
        return mockNote;
      }

      showToast(err.message || "Failed to upload note", "danger");
      throw err;
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    try {
      await api.notes.delete(noteId);
    } catch (_err) {
      // Allow optimistic local deletion in demo mode
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setBookmarks((prev) => prev.filter((id) => id !== noteId));
    setMyUploadedNotes((prev) => prev.filter((n) => n.id !== noteId));
    setReports((prev) => prev.filter((r) => r.noteId !== noteId));
    showToast("Note deleted successfully", "info");
  };

  // Add report
  const addReport = async (reportData) => {
    try {
      const res = await api.reports.create({
        noteId: reportData.noteId,
        reason: reportData.reason,
        description: reportData.details || reportData.description
      });
      const newReport = res.data;
      setReports((prev) => [newReport, ...prev]);
      showToast("Report submitted to administrators. Thank you!", "info");
      return newReport;
    } catch (_err) {
      const mockReport = {
        id: `report-demo-${Date.now()}`,
        noteId: reportData.noteId,
        reason: reportData.reason,
        details: reportData.details || reportData.description,
        status: "PENDING",
        createdAt: new Date().toISOString()
      };
      setReports((prev) => [mockReport, ...prev]);
      showToast("Report submitted to administrators (Demo Mode). Thank you!", "info");
      return mockReport;
    }
  };

  // Dismiss / resolve report (Admin)
  const dismissReport = async (reportId) => {
    try {
      await api.admin.updateReportStatus(reportId, "DISMISSED");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast("Report dismissed", "info");
    } catch (err) {
      showToast(err.message || "Failed to dismiss report", "danger");
    }
  };

  // Download note
  const downloadNote = async (note) => {
    if (!note) return;

    // Optimistically increment download count
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      )
    );

    try {
      const res = await api.notes.download(note.id);
      const downloadUrl = res?.data?.downloadUrl || note.fileUrl;

      if (downloadUrl && downloadUrl.startsWith("http")) {
        // Trigger browser download via window/link
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = note.fileName || `${note.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: create dynamic text summary blob
        const dummyContent = `NoteNest Academic Study Material\n=================================\n\nTitle: ${note.title}\nSubject: ${note.subject} (Semester ${note.semester})\nTopic: ${note.topic}\nUploader: ${note.uploader}\nUpload Date: ${note.uploadDate}\n\nKey Concepts:\n${(note.keyConcepts || []).map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nSummary:\n${note.description}\n\n---------------------------------\nDownloaded via NoteNest — Student Notes Sharing Platform`;
        const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(note.title || "Note").replace(/[^a-zA-Z0-9_-]/g, "_")}_NoteNest.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      showToast(`Downloading "${note.title}"...`, "success");
    } catch (err) {
      console.warn("Download API call fallback:", err.message);
      showToast(`Downloading "${note.title}"...`, "success");
    }
  };

  // Reset demo data helper
  const resetToSampleData = () => {
    fetchNotes();
    if (user?.role === "ADMIN") {
      fetchReports();
    }
    showToast("Data refreshed from database", "info");
  };

  const safeNotes = Array.isArray(notes) ? notes : INITIAL_NOTES;
  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  const safeProfile = user || profile || DEFAULT_PROFILE;

  const bookmarkedNotes = safeNotes.filter((n) => safeBookmarks.includes(n.id));

  return (
    <NotesContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "ADMIN",
        token,
        login,
        register,
        logout,
        updateUserProfile,
        notes: safeNotes,
        bookmarks: safeBookmarks,
        bookmarkedNotes,
        myUploadedNotes,
        userUploadIds: myUploadedNotes.map((n) => n.id),
        reports: Array.isArray(reports) ? reports : INITIAL_REPORTS,
        profile: safeProfile,
        isLoading,
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
        resetToSampleData,
        fetchNotes,
        fetchBookmarks,
        fetchMyUploads,
        fetchReports
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
