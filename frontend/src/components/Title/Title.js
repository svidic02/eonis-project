import React from "react";

export default function Title({ title, fontSize, margin, color, fontWeight }) {
  return (
    <h1 style={{ fontSize, fontWeight, margin, color: color }}>{title}</h1>
  );
}
