import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass, FileQuestion } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <EmptyState
        icon={FileQuestion}
        title="Page Not Found (404)"
        message="The page you are looking for doesn't exist or may have been moved. Explore the notes repository instead!"
        actionLabel="Go to Explore Notes"
        onAction={() => navigate("/notes")}
        actionIcon={Compass}
      />
    </div>
  );
}
