import React from "react";
import { FolderSearch, PlusCircle, BookmarkX } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = "No notes found",
  message = "Try modifying your search keywords or clearing active filters to see available study materials.",
  actionLabel,
  onAction,
  actionIcon: ActionIcon
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          icon={ActionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
