import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { NotesProvider } from "./context/NotesContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

// Pages
import Home from "./pages/Home";
import ExploreNotes from "./pages/ExploreNotes";
import NoteDetails from "./pages/NoteDetails";
import UploadNotes from "./pages/UploadNotes";
import MyLibrary from "./pages/MyLibrary";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <NotesProvider>
        <ScrollToTop />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<ExploreNotes />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
            <Route path="/upload" element={<UploadNotes />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toast />
      </NotesProvider>
    </BrowserRouter>
  );
}
