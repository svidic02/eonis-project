import React, { useMemo, useState } from "react";
import classes from "./tagsList.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { deleteTag } from "../../services/tagService";

export default function TagsList({ tags }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [tagToDelete, setTagToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...tags];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }, [tags, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const arrow = (key) =>
    sortKey === key ? <span className={classes.arrow}>{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  const handleAdd = () => navigate("/tag/add");
  const handleEdit = (tag) => navigate(`/tags/${tag._id}`);
  const handleDelete = (tag) => { setTagToDelete(tag); setDialog(true); };
  const dialogConfirmed = async () => {
    try {
      await deleteTag(tagToDelete._id);
      setDialog(false);
      toast.success(`Tag "${tagToDelete.name}" deleted.`);
      window.location.reload();
    } catch {
      toast.error("Could not delete tag.");
    }
  };
  const dialogCanceled = () => setDialog(false);

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <h1 className={classes.title}>Tags</h1>
        <div className={classes.headerRight}>
          <span className={classes.numberOf}>{tags.length} total</span>
          <button className={classes.addBtn} onClick={handleAdd}>+ Add tag</button>
        </div>
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")} className={classes.sortable}>Name {arrow("name")}</th>
              <th onClick={() => toggleSort("count")} className={`${classes.sortable} ${classes.numCol}`}>Count {arrow("count")}</th>
              <th className={classes.actionsCol}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={3} className={classes.empty}>No tags yet.</td></tr>
            )}
            {sorted.map((tag) => (
              <tr key={tag._id ?? tag.name}>
                <td className={classes.nameCell}>{tag.name}</td>
                <td className={classes.numCol}>{tag.count ?? 0}</td>
                <td className={classes.actionsCol}>
                  <button
                    className={classes.editBtn}
                    onClick={() => handleEdit(tag)}
                    disabled={!tag._id}
                    title={!tag._id ? "Tag has no id" : undefined}
                  >
                    Edit
                  </button>
                  <button
                    className={classes.deleteBtn}
                    onClick={() => handleDelete(tag)}
                    disabled={!tag._id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <ConfirmationDialog
          msg={`Delete tag "${tagToDelete?.name}"? It will be removed from all products.`}
          info={tagToDelete}
          onConfirm={dialogConfirmed}
          onCancel={dialogCanceled}
        />
      )}
    </div>
  );
}
