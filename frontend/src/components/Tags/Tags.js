import React from "react";
import classes from "./tags.module.css";
import { NavLink } from "react-router-dom";

export default function Tags({ tags, forProductPage }) {
  const containerClass = forProductPage
    ? `${classes.container} ${classes.horizontal}`
    : classes.container;
  return (
    <div className={containerClass}>
      {tags.map((tag) => (
        <NavLink
          key={tag.name}
          to={`/tag/${tag.name}`}
          className={({ isActive }) => (isActive ? classes.active : undefined)}
          end
        >
          <span>{tag.name}</span>
          {!forProductPage && tag.count != null && (
            <span className={classes.count}>{tag.count}</span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
