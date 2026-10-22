import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useNotes } from "../context/NotesContext";

export default function Toast() {
  const { toast, hideToast } = useNotes();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10B981" />,
    error: <AlertCircle size={18} color="#EF4444" />,
    info: <Info size={18} color="#60A5FA" />
  };

  return (
    <div className={`toast-notification ${toast.type}`}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={hideToast}
        style={{
          marginLeft: "0.5rem",
          color: "rgba(255,255,255,0.7)",
          display: "flex",
          alignItems: "center"
        }}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
