import React, { useState } from "react";
import classes from "./imagesEditor.module.css";
import Button from "../Button/Button";

export default function ImagesEditor({ images, onChange }) {
  const update = (idx, value) => {
    onChange(images.map((u, i) => (i === idx ? value : u)));
  };
  const addRow = () => onChange([...images, ""]);
  const removeRow = (idx) => onChange(images.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className={classes.wrapper}>
      {images.length === 0 && (
        <div className={classes.empty}>No images yet.</div>
      )}
      {images.map((url, idx) => (
        <ImageRow
          key={idx}
          url={url}
          isPrimary={idx === 0}
          isFirst={idx === 0}
          isLast={idx === images.length - 1}
          onChange={(v) => update(idx, v)}
          onRemove={() => removeRow(idx)}
          onMoveUp={() => move(idx, -1)}
          onMoveDown={() => move(idx, +1)}
        />
      ))}
      <Button text="Add image" onClick={addRow} />
    </div>
  );
}

function ImageRow({ url, isPrimary, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [broken, setBroken] = useState(false);
  const trimmed = (url || "").trim();
  return (
    <div className={classes.row}>
      <div className={classes.thumb}>
        {trimmed && !broken ? (
          <img
            src={trimmed}
            alt=""
            onLoad={() => setBroken(false)}
            onError={() => setBroken(true)}
          />
        ) : (
          <div className={classes.thumbFallback}>{trimmed ? "✕" : "—"}</div>
        )}
      </div>
      <div className={classes.inputWrap}>
        <input
          type="url"
          value={url}
          placeholder="https://…"
          className={classes.input}
          onChange={(e) => {
            setBroken(false);
            onChange(e.target.value);
          }}
        />
        {isPrimary && <span className={classes.primaryBadge}>Primary</span>}
      </div>
      <div className={classes.actions}>
        <button
          type="button"
          className={classes.iconBtn}
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className={classes.iconBtn}
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          className={classes.remove}
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
