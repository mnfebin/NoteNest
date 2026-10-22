import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  UploadCloud,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  GraduationCap,
  Users
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { SUBJECT_METADATA } from "../data/notes";
import NoteCard from "../components/NoteCard";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";

export default function Home() {
  const navigate = useNavigate();
  const { notes } = useNotes();
  const [heroSearch, setHeroSearch] = useState("");

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/notes?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate("/notes");
    }
  };

  const safeNotes = Array.isArray(notes) ? notes : [];

  // Recent notes (sorted by date desc)
  const recentNotes = [...safeNotes]
    .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
    .slice(0, 6);

  // Popular notes (sorted by downloads desc)
  const popularNotes = [...safeNotes]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3);

  // Semesters for quick access
  const semesterPills = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)",
          paddingTop: "2.5rem",
          paddingBottom: "4.5rem",
          borderBottom: "1px solid var(--border-light)"
        }}
      >
        <div className="container" style={{ textAlign: "center", maxWidth: "860px" }}>
          {/* Tagline Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#FFFFFF",
              border: "1px solid var(--primary-border)",
              color: "var(--primary)",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: "600",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "1.5rem"
            }}
          >
            <Sparkles size={16} />
            <span>The Student-First Notes Ecosystem</span>
          </div>

          {/* Main Heading */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
              lineHeight: "1.15",
              marginBottom: "1.25rem"
            }}
          >
            Your notes. Your community. <br />
            <span style={{ color: "var(--primary)" }}>Your success.</span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              maxWidth: "680px",
              margin: "0 auto 2.25rem"
            }}
          >
            NoteNest helps engineering students find, share, and organize verified lecture notes, solved question banks, and exam revision guides — all in one clean place.
          </p>

          {/* Prominent Search Bar */}
          <form onSubmit={handleHeroSearch} style={{ maxWidth: "620px", margin: "0 auto 1.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <SearchBar
                  value={heroSearch}
                  onChange={setHeroSearch}
                  placeholder="Search by topic, subject (e.g. DBMS, Trees, OSI Model)..."
                  size="lg"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" icon={Search}>
                Search
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1.5rem"
            }}
          >
            <Button
              variant="primary"
              size="lg"
              icon={Compass}
              onClick={() => navigate("/notes")}
            >
              Explore All Notes
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={UploadCloud}
              onClick={() => navigate("/upload")}
            >
              Upload Notes
            </Button>
          </div>

          {/* Key Value Props */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
              marginTop: "3rem",
              fontSize: "0.875rem",
              color: "var(--text-muted)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>100% Free for Students</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Organized by Semester</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Peer-Reviewed Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Semester Selection Quick Bar */}
      <section style={{ padding: "3.5rem 0", background: "#FFFFFF", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="badge badge-purple" style={{ marginBottom: "0.5rem" }}>
              <Layers size={13} /> Quick Filter
            </span>
            <h2 className="section-title">Jump to Your Semester</h2>
            <p className="section-subtitle">
              Browse study materials tailored to each stage of your engineering syllabus
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem"
            }}
          >
            {semesterPills.map((sem) => {
              const count = notes.filter((n) => n.semester === sem).length;
              return (
                <Link
                  key={sem}
                  to={`/notes?semester=${sem}`}
                  className="card card-hoverable"
                  style={{
                    padding: "1.25rem 1rem",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: sem % 2 === 0 ? "var(--primary-light)" : "var(--accent-purple-light)",
                      color: sem % 2 === 0 ? "var(--primary)" : "var(--accent-purple)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.95rem"
                    }}
                  >
                    S{sem}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
                    Semester {sem}
                  </span>
                  <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    {count} {count === 1 ? "note" : "notes"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subject Categories Section */}
      <section style={{ padding: "4rem 0", background: "var(--bg-app)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "0.5rem" }}>
                <BookOpen size={13} /> Syllabus Categories
              </span>
              <h2 className="section-title">Core Engineering Subjects</h2>
              <p className="section-subtitle">
                Comprehensive study notes for high-weightage CSE university modules
              </p>
            </div>
            <Link to="/notes" className="btn btn-outline btn-sm">
              View All Subjects <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem"
            }}
          >
            {Object.entries(SUBJECT_METADATA).map(([subjectName, meta]) => {
              const subjectNotes = notes.filter((n) => n.subject === subjectName);
              return (
                <Link
                  key={subjectName}
                  to={`/notes?subject=${encodeURIComponent(subjectName)}`}
                  className="card card-hoverable"
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: meta.bg,
                          color: meta.color,
                          borderColor: meta.border,
                          borderWidth: "1px",
                          borderStyle: "solid"
                        }}
                      >
                        {meta.code}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {subjectNotes.length} resources
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                      {subjectName}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {meta.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: meta.color,
                      marginTop: "1.25rem"
                    }}
                  >
                    <span>Browse materials</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Notes Section */}
      <section style={{ padding: "4rem 0", background: "#FFFFFF", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: "0.5rem" }}>
                <TrendingUp size={13} /> High Demand
              </span>
              <h2 className="section-title">Most Downloaded Notes</h2>
              <p className="section-subtitle">
                Top student picks with the highest revision ratings and community downloads
              </p>
            </div>
            <Link to="/notes?sort=popular" className="btn btn-outline btn-sm">
              Explore Popular <ArrowRight size={14} />
            </Link>
          </div>

          <div className="notes-grid">
            {popularNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Uploaded Notes Section */}
      <section style={{ padding: "4rem 0", background: "var(--bg-app)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "0.5rem" }}>
                <Clock size={13} /> Fresh Contributions
              </span>
              <h2 className="section-title">Recently Uploaded Notes</h2>
              <p className="section-subtitle">
                Latest study materials shared by fellow classmates this semester
              </p>
            </div>
            <Link to="/notes?sort=newest" className="btn btn-outline btn-sm">
              View All ({notes.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="notes-grid">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Upload CTA Banner */}
      <section style={{ padding: "4.5rem 0", background: "#FFFFFF" }}>
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)",
              border: "1px solid var(--primary-border)",
              borderRadius: "var(--radius-xl)",
              padding: "3.5rem 2rem",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
              }}
            >
              <UploadCloud size={28} />
            </div>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.75rem" }}>
              Got Clean Notes from Your Lectures?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "560px", margin: "0 auto 1.75rem", lineHeight: "1.6" }}>
              Share your handwritten summaries or typed revision notes. Help your batchmates prepare for exams and earn recognition across your department.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Button
                variant="primary"
                size="lg"
                icon={UploadCloud}
                onClick={() => navigate("/upload")}
              >
                Upload Your Notes
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={GraduationCap}
                onClick={() => navigate("/profile")}
              >
                View Your Profile
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
