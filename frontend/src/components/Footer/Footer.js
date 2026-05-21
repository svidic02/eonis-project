import React from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Footer() {
  const { user } = useAuth();
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
      {user?.isAdmin ? (
        <p>Footprint Admin · signed in as {user.name}</p>
      ) : (
        <p>&copy; 2026 Footprint. All rights reserved.</p>
      )}
    </footer>
  );
}
