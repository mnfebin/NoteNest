import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search notes by title, subject, or topic...",
  className = "",
  size = "md",
  autoFocus = false
}) {
  const isLarge = size === "lg";

  return (
    <div
      className={`search-bar-wrapper ${className}`}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center"
      }}
    >
      <Search
        size={isLarge ? 20 : 17}
        style={{
          position: "absolute",
          left: isLarge ? "1.25rem" : "0.95rem",
          color: "var(--text-muted)",
          pointerEvents: "none"
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
        style={{
          width: "100%",
          paddingLeft: isLarge ? "3.2rem" : "2.6rem",
          paddingRight: value ? (isLarge ? "3rem" : "2.5rem") : "1rem",
          paddingTop: isLarge ? "1rem" : "0.7rem",
          paddingBottom: isLarge ? "1rem" : "0.7rem",
          fontSize: isLarge ? "1.05rem" : "0.925rem",
          borderRadius: isLarge ? "var(--radius-lg)" : "var(--radius-md)",
          border: "1.5px solid var(--border-light)",
          backgroundColor: "#FFFFFF",
          color: "var(--text-main)",
          boxShadow: isLarge ? "var(--shadow-md)" : "var(--shadow-sm)",
          outline: "none",
          transition: "all 0.18s ease"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--primary)";
          e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border-light)";
          e.target.style.boxShadow = isLarge ? "var(--shadow-md)" : "var(--shadow-sm)";
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange("");
          }}
          aria-label="Clear search input"
          style={{
            position: "absolute",
            right: isLarge ? "1.25rem" : "0.85rem",
            color: "var(--text-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.25rem",
            borderRadius: "50%"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-light)"}
        >
          <X size={isLarge ? 18 : 16} />
        </button>
      )}
    </div>
  );
}
