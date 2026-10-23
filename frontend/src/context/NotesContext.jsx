import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_NOTES, INITIAL_REPORTS } from "../data/notes";
import { api, getToken, setToken, clearToken } from "../services/api";
import { downloadNotePdf, openNotePdf } from "../utils/pdfGenerator";

const NotesContext = createContext(null);

const DEFAULT_PROFILE = {
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
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("notenest_guest_bookmarks");
      return saved ? JSON.parse(saved) : ["note-1", "note-3"];
    } catch {
      return ["note-1", "note-3"];
    }
  });
  const [bookmarkedNotesData, setBookmarkedNotesData] = useState([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState(null);
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
    setIsBookmarksLoading(true);
    setBookmarksError(null);
    try {
      const res = await api.bookmarks.list();
      if (res?.success && Array.isArray(res.data)) {
        setBookmarkedNotesData(res.data);
        const ids = res.data.map((n) => n.id);
        setBookmarks(ids);
      }
    } catch (err) {
      console.warn("Failed to fetch bookmarks:", err.message);
      setBookmarksError(err.message || "Failed to load bookmarks");
    } finally {
      setIsBookmarksLoading(false);
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
      let updated;
      if (exists) {
        updated = bookmarks.filter((id) => id !== noteId);
        showToast("Removed from My Library", "info");
      } else {
        updated = [...bookmarks, noteId];
        showToast("Saved to My Library (Guest mode)", "success");
      }
      setBookmarks(updated);
      try {
        localStorage.setItem("notenest_guest_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore localStorage error
      }
      return;
    }

    try {
      if (exists) {
        setBookmarks((prev) => prev.filter((id) => id !== noteId));
        setBookmarkedNotesData((prev) => prev.filter((n) => n.id !== noteId));
        await api.bookmarks.remove(noteId);
        showToast("Removed from My Library", "info");
      } else {
        setBookmarks((prev) => [...prev, noteId]);
        const targetNote = notes.find((n) => n.id === noteId);
        if (targetNote) {
          setBookmarkedNotesData((prev) => [targetNote, ...prev]);
        }
        await api.bookmarks.add(noteId);
        showToast("Saved to My Library", "success");
      }
    } catch (err) {
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
        description: reportData.description || reportData.details || ""
      });
      const newReport = res.data;
      setReports((prev) => [newReport, ...prev]);
      showToast("Report submitted to administrators. Thank you!", "info");
      return newReport;
    } catch (err) {
      const isConnectionError =
        !err.status ||
        err.message?.includes("fetch") ||
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError");

      if (isConnectionError) {
        const mockReport = {
          id: `report-demo-${Date.now()}`,
          noteId: reportData.noteId,
          noteTitle: reportData.noteTitle || "Reported Note",
          reason: reportData.reason,
          details: reportData.description || reportData.details || "",
          status: "OPEN",
          reporter: user?.email || "student@college.edu",
          createdAt: new Date().toISOString()
        };
        setReports((prev) => [mockReport, ...prev]);
        showToast("Report submitted to administrators (Demo Mode). Thank you!", "info");
        return mockReport;
      }
      showToast(err.message || "Failed to submit report", "danger");
      throw err;
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

  // Download note as genuine PDF
  const downloadNote = async (note) => {
    if (!note) return;

    // Optimistically increment download count
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      )
    );

    try {
      // Try backend download endpoint if connected
      const res = await api.notes.download(note.id).catch(() => null);
      const downloadUrl = res?.data?.downloadUrl || note.fileUrl;

      if (downloadUrl && downloadUrl.startsWith("http") && !downloadUrl.includes("placeholder")) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = note.fileName || `${(note.title || "Note").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate real client-side PDF document
        downloadNotePdf(note);
      }

      showToast(`Downloaded "${note.title}.pdf"`, "success");
    } catch (_err) {
      // Fallback: guaranteed valid PDF download
      downloadNotePdf(note);
      showToast(`Downloaded "${note.title}.pdf"`, "success");
    }
  };

  // Open note PDF in browser for live reading
  const openPdf = (note) => {
    if (!note) return;
    openNotePdf(note);
    showToast(`Opening "${note.title}" PDF in viewer...`, "info");
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

  // Combine full bookmarked objects from backend with any notes in local memory
  const noteMap = new Map();
  bookmarkedNotesData.forEach((n) => {
    if (n && n.id && safeBookmarks.includes(n.id)) {
      noteMap.set(n.id, n);
    }
  });
  safeNotes.forEach((n) => {
    if (n && n.id && safeBookmarks.includes(n.id) && !noteMap.has(n.id)) {
      noteMap.set(n.id, n);
    }
  });
  const bookmarkedNotes = Array.from(noteMap.values());

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
        isBookmarksLoading,
        bookmarksError,
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
        openPdf,
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
