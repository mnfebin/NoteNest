const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "notenest_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Universal request wrapper for NoteNest backend API.
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set JSON Content-Type
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Parse JSON response safely
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: response.ok, message: text };
    }

    if (!response.ok) {
      const message =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
        `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// Grouped API services
export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
      }),
    login: (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }),
    logout: () =>
      request("/auth/logout", {
        method: "POST"
      }),
    getMe: () => request("/auth/me")
  },

  // Notes
  notes: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all" && val !== "All Subjects") {
          query.set(key, val);
        }
      });
      const queryString = query.toString();
      return request(`/notes${queryString ? `?${queryString}` : ""}`);
    },
    get: (id) => request(`/notes/${id}`),
    upload: (formData) =>
      request("/notes", {
        method: "POST",
        body: formData // Browser sets multipart boundary automatically
      }),
    update: (id, updateData) =>
      request(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData)
      }),
    delete: (id) =>
      request(`/notes/${id}`, {
        method: "DELETE"
      }),
    getMine: () => request("/notes/mine"),
    download: (id) => request(`/notes/${id}/download`)
  },

  // Bookmarks
  bookmarks: {
    list: () => request("/bookmarks"),
    add: (noteId) =>
      request(`/bookmarks/${noteId}`, {
        method: "POST"
      }),
    remove: (noteId) =>
      request(`/bookmarks/${noteId}`, {
        method: "DELETE"
      })
  },

  // Reports
  reports: {
    create: (reportData) =>
      request("/reports", {
        method: "POST",
        body: JSON.stringify(reportData)
      }),
    mine: () => request("/reports/mine")
  },

  // User Profile
  users: {
    getProfile: () => request("/users/me"),
    updateProfile: (profileData) =>
      request("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profileData)
      })
  },

  // Admin Portal
  admin: {
    getDashboard: () => request("/admin/dashboard"),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ""}`);
    },
    getNotes: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/notes${query ? `?${query}` : ""}`);
    },
    updateNoteStatus: (id, status) =>
      request(`/admin/notes/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }),
    deleteNote: (id) =>
      request(`/admin/notes/${id}`, {
        method: "DELETE"
      }),
    getReports: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/reports${query ? `?${query}` : ""}`);
    },
    updateReportStatus: (id, status) =>
      request(`/admin/reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
  }
};

export default api;
