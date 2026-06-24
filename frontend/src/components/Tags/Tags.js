import React from "react";
import classes from "./tags.module.css";
import { CATEGORIES } from "../../constants/productEnums";

const CATEGORY_NAMES = new Set(CATEGORIES.map((c) => c.value));

export default function Tags({
  tags,
  forProductPage,
  selected = null,
  onSelect,
}) {
  const containerClass = forProductPage
    ? `${classes.container} ${classes.horizontal}`
    : classes.container;

  if (forProductPage) {
    return (
      <div className={containerClass}>
        {tags.map((tag) => (
          <a key={tag.name} href={`/?tag=${encodeURIComponent(tag.name)}`}>
            <span>{tag.name}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {tags
        .filter((t) => t.name !== "All" && !CATEGORY_NAMES.has(t.name))
        .map((tag) => {
          const active = selected === tag.name;
          return (
            <button
              key={tag.name}
              type="button"
              className={active ? classes.active : undefined}
              onClick={() => onSelect?.(active ? null : tag.name)}
            >
              <span>{tag.name}</span>
              {tag.count != null && (
                <span className={classes.count}>{tag.count}</span>
              )}
            </button>
          );
        })}
    </div>
  );
}
