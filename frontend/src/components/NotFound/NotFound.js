import React from "react";
import classes from "./notFound.module.css";
import { Link } from "react-router-dom";

export default function NotFound({ message, hint, linkRoute, linkText }) {
  return (
    <div className={classes.container}>
      <svg
        className={classes.icon}
        viewBox="0 0 24 24"
        width="44"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <div className={classes.message}>{message}</div>
      {hint && <div className={classes.hint}>{hint}</div>}
      <Link to={linkRoute}>{linkText}</Link>
    </div>
  );
}

NotFound.defaultProps = {
  message: "No products match these filters.",
  hint: "Try removing a tag, switching gender, or clearing the search to see everything we have.",
  linkRoute: "/",
  linkText: "Reset filters",
};
