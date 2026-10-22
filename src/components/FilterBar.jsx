import React from "react";
import { Filter, RotateCcw, ArrowUpDown, BookOpen, Layers } from "lucide-react";
import { SUBJECTS, SEMESTERS } from "../data/notes";
import Button from "./Button";

export default function FilterBar({
  selectedSubject,
  onSubjectChange,
  selectedSemester,
  onSemesterChange,
  sortBy,
  onSortChange,
  onResetFilters,
  totalResults
}) {
  const hasActiveFilters =
    selectedSubject !== "All Subjects" ||
    selectedSemester !== "all" ||
    sortBy !== "newest";

  return (
    <div className="filter-container">
      <div className="filter-grid">
        {/* Subject Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-subject">
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <BookOpen size={14} color="var(--primary)" /> Subject
            </span>
          </label>
          <select
            id="filter-subject"
            className="form-select"
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-semester">
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Layers size={14} color="var(--accent-purple)" /> Semester
            </span>
          </label>
          <select
            id="filter-semester"
            className="form-select"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
          >
            {SEMESTERS.map((sem) => (
              <option key={sem.value} value={sem.value}>
                {sem.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-sort">
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <ArrowUpDown size={14} color="var(--accent-teal)" /> Sort By
            </span>
          </label>
          <select
            id="filter-sort"
            className="form-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Downloaded</option>
            <option value="alphabetical">Title (A to Z)</option>
          </select>
        </div>

        {/* Results Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.7rem 0.5rem",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            fontWeight: 600
          }}
        >
          <span>{totalResults} {totalResults === 1 ? "note found" : "notes found"}</span>
        </div>

        {/* Reset Filter Action */}
        <div>
          <Button
            variant="outline"
            size="md"
            icon={RotateCcw}
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            title="Reset filters to default"
            style={{ width: "100%" }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
