import React, { useEffect, useId, useRef } from "react";
import classes from "./confirmationDialog.module.css";

export default function ConfirmationDialog({
  msg,
  info,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) {
  const titleId = useId();
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  const [title, description] = splitMsg(msg);

  const rows = [
    ["Name", info.name],
    ["Email", info.email],
    ["Address", info.address],
    ["Type", info.isAdmin ? "Admin" : null],
    ["Price", info.price],
  ].filter(([, v]) => v !== undefined && v !== null && v !== "");

  return (
    <div className={classes.modal} onClick={onCancel}>
      <div
        ref={dialogRef}
        className={classes.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={classes.header}>
          <span className={classes.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <h3 id={titleId} className={classes.title}>{title}</h3>
        </div>
        {description && <p className={classes.description}>{description}</p>}
        {rows.length > 0 && (
          <dl className={classes.info}>
            {rows.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}
        <div className={classes.actions}>
          <button
            ref={cancelRef}
            className={`${classes.btn} ${classes.cancel}`}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`${classes.btn} ${classes.confirm}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function splitMsg(msg) {
  if (!msg) return ["", ""];
  const idx = msg.indexOf("? ");
  if (idx === -1) return [msg, ""];
  return [msg.slice(0, idx + 1), msg.slice(idx + 2)];
}
