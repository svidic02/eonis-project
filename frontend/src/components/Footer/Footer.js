import React from "react";
import { Link } from "react-router-dom";
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
        <p>
          &copy; 2026 Footprint. All rights reserved. ·{" "}
          <Link to="/contact" style={{ color: "var(--accent-hover)", fontWeight: 600 }}>
            Contact us
          </Link>
        </p>
      )}
    </footer>
  );
}
