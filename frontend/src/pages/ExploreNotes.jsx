import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass, RotateCcw, Sparkles, Tag } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

const POPULAR_TOPICS = [
  "All Topics",
  "ER Model",
  "Memory Management",
  "AVL Trees",
  "OSI Model",
  "React Hooks",
  "CPU Scheduling",
  "Normalization",
  "Dynamic Programming"
];

export default function ExploreNotes() {
  const { notes } = useNotes();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameter initial states
  const initialQuery = searchParams.get("q") || "";
  const initialSubject = searchParams.get("subject") || "All Subjects";
  const initialSemester = searchParams.get("semester") || "all";
  const initialSort = searchParams.get("sort") || "newest";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [sortBy, setSortBy] = useState(initialSort);

  // Sync state when URL searchParams change
  useEffect(() => {
    const q = searchParams.get("q");
    const sub = searchParams.get("subject");
    const sem = searchParams.get("semester");
    const s = searchParams.get("sort");

    if (q !== null) setSearchQuery(q);
    if (sub !== null) setSelectedSubject(sub);
    if (sem !== null) setSelectedSemester(sem);
    if (s !== null) setSortBy(s);
  }, [searchParams]);

  // Update URL params smoothly
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== "All Subjects" && val !== "all" && val !== "newest") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    updateUrlParams({ q: query });
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    updateUrlParams({ subject });
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    updateUrlParams({ semester });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateUrlParams({ sort });
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    if (topic === "All Topics") {
      setSearchQuery("");
      updateUrlParams({ q: "" });
    } else {
      setSearchQuery(topic);
      updateUrlParams({ q: topic });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSubject("All Subjects");
    setSelectedSemester("all");
    setSelectedTopic("All Topics");
    setSortBy("newest");
    setSearchParams({});
  };

  const filteredNotes = useMemo(() => {
    return (Array.isArray(notes) ? notes : [])
      .filter((note) => {
        // 1. Text Search matching title, subject, topic, tags, or description
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.subject.toLowerCase().includes(query) ||
          note.topic.toLowerCase().includes(query) ||
          note.description.toLowerCase().includes(query) ||
          (note.tags && note.tags.some((t) => t.toLowerCase().includes(query)));

        // 2. Subject filter
        const matchesSubject =
          selectedSubject === "All Subjects" || note.subject === selectedSubject;

        // 3. Semester filter
        const matchesSemester =
          selectedSemester === "all" || String(note.semester) === String(selectedSemester);

        // 4. Topic filter
        const matchesTopic =
          selectedTopic === "All Topics" ||
          note.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
          (note.tags && note.tags.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase())));

        return matchesQuery && matchesSubject && matchesSemester && matchesTopic;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return b.downloads - a.downloads;
        } else if (sortBy === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else {
          // newest
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        }
      });
  }, [notes, searchQuery, selectedSubject, selectedSemester, selectedTopic, sortBy]);

  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Page Header */}
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-blue">
            <Compass size={14} /> Academic Repository
          </span>
        </div>
        <h1 className="section-title">Explore Study Materials</h1>
        <p className="section-subtitle">
          Search and filter verified lecture notes, cheatsheets, and question papers across all semesters.
        </p>
      </div>

      {/* Main Search Bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by topic, unit name, algorithm, or course code..."
          size="lg"
        />
      </div>

      {/* Quick Topic Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          marginBottom: "1.25rem"
        }}
      >
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", whiteSpace: "nowrap" }}>
          <Tag size={13} /> Trending:
        </span>
        {POPULAR_TOPICS.map((topic) => {
          const isActive = selectedTopic === topic || (topic !== "All Topics" && searchQuery === topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => handleTopicClick(topic)}
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                whiteSpace: "nowrap",
                border: "1px solid",
                borderColor: isActive ? "var(--primary)" : "var(--border-light)",
                backgroundColor: isActive ? "var(--primary-light)" : "#FFFFFF",
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        selectedSemester={selectedSemester}
        onSemesterChange={handleSemesterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        totalResults={filteredNotes.length}
      />

      {/* Notes Grid or Empty State */}
      {filteredNotes.length > 0 ? (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No study notes match your criteria"
          message="We couldn't find any uploaded notes matching your current keyword, subject, or semester filter. Try clearing your filters or uploading the notes yourself!"
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
          actionIcon={RotateCcw}
        />
      )}
    </div>
  );
}
