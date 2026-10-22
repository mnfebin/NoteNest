import React from "react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = "#2563EB",
  bgColor = "#EFF6FF",
  borderColor = "#BFDBFE"
}) {
  return (
    <div className="stat-card">
      <div>
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {subtext && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            {subtext}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: bgColor,
            color: color,
            border: `1px solid ${borderColor}`
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
