import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Top-level Error Boundary to catch any render-time exception
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("NoteNest ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn(e);
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            backgroundColor: "#F8FAFC",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center"
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              background: "#FFFFFF",
              padding: "2.5rem 2rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #E2E8F0"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                fontSize: "24px",
                fontWeight: "bold"
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.5rem" }}>
              Something interrupted NoteNest
            </h2>
            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              A temporary runtime issue occurred. Click the button below to reset the local demo cache and reload the application.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: "#F1F5F9",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "#DC2626",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "1.5rem"
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                fontWeight: "600",
                fontSize: "0.95rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}
            >
              Reset Demo Storage & Reload NoteNest
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
