import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "1.5rem",
        textAlign: "center",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        fontSize: "0.9rem",
      }}
    >
      <p>&copy; 2026 Footprint. All rights reserved.</p>
    </footer>
  );
}
