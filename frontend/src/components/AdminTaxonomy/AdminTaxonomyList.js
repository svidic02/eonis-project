import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import classes from "./adminTaxonomy.module.css";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import SearchInput from "../SearchInput/SearchInput";

export default function AdminTaxonomyList({
  items,
  title,
  addLabel,
  addPath,
  editPath,
  columns,
  deleteFn,
  onDeleted,
  confirmMessage,
  itemLabel = (item) => item?.name,
  searchKeys = ["name"],
  searchPlaceholder = "Search…",
}) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState(columns[0]?.key);
  const [sortDir, setSortDir] = useState("asc");
  const [toDelete, setToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      searchKeys.some((k) => String(item[k] ?? "").toLowerCase().includes(q))
    );
  }, [items, query, searchKeys]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
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
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const arrow = (key) =>
    sortKey === key ? <span className={classes.arrow}>{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  const handleDelete = (item) => { setToDelete(item); setDialog(true); };
  const dialogConfirmed = async () => {
    try {
      await deleteFn(toDelete._id);
      setDialog(false);
      toast.success(`"${itemLabel(toDelete)}" deleted.`);
      onDeleted?.(toDelete._id);
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Could not delete.");
      setDialog(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <h1 className={classes.title}>{title}</h1>
        <div className={classes.headerRight}>
          <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
          <span className={classes.numberOf}>
            {query ? `${filtered.length} of ${items.length}` : `${items.length} total`}
          </span>
          <button className={classes.addBtn} onClick={() => navigate(addPath)}>{addLabel}</button>
        </div>
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  className={col.sortable ? classes.sortable : undefined}
                  style={{
                    width: col.width,
                    textAlign: col.align ?? "left",
                  }}
                >
                  {col.label}{col.sortable && arrow(col.key)}
                </th>
              ))}
              <th className={classes.actionsCol}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className={classes.empty}>
                  Nothing here yet.
                </td>
              </tr>
            )}
            {sorted.map((item) => (
              <tr key={item._id ?? item.name}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align ?? "left",
                    }}
                    className={col.cellClassName ? classes[col.cellClassName] : undefined}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                <td className={classes.actionsCol}>
                  <button
                    className={classes.editBtn}
                    onClick={() => navigate(editPath(item._id))}
                    disabled={!item._id}
                  >
                    Edit
                  </button>
                  <button
                    className={classes.deleteBtn}
                    onClick={() => handleDelete(item)}
                    disabled={!item._id}
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
          msg={confirmMessage(toDelete)}
          info={toDelete}
          onConfirm={dialogConfirmed}
          onCancel={() => setDialog(false)}
        />
      )}
    </div>
  );
}

export { classes as taxonomyClasses };
