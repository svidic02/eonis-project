import React, { useMemo, useState } from "react";
import classes from "./userList.module.css";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { deleteUser } from "../../services/userService";
import { toast } from "react-toastify";

export default function UserList({ users }) {
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    const arr = [...users];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "role":
          av = a.isAdmin ? 1 : 0;
          bv = b.isAdmin ? 1 : 0;
          break;
        case "joined":
          av = new Date(a.createdAt).getTime() || 0;
          bv = new Date(b.createdAt).getTime() || 0;
          break;
        default:
          av = a[sortKey];
          bv = b[sortKey];
      }
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }, [users, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  const arrow = (key) =>
    sortKey === key ? <span className={classes.arrow}>{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDialog(true);
  };
  const dialogConfirmed = async () => {
    try {
      await deleteUser(userToDelete._id);
      setDialog(false);
      toast.success("User " + userToDelete.name + " deleted.");
      window.location.reload();
    } catch {
      toast.error("Could not delete " + userToDelete.name + ".");
    }
  };
  const dialogCanceled = () => setDialog(false);
  const handleEdit = (user) => navigate(`/user/${user._id}`);
  const handleAdd = () => navigate(`/user/add`);

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <h1 className={classes.title}>Users</h1>
        <div className={classes.headerRight}>
          <span className={classes.numberOf}>{users.length} total</span>
          <button className={classes.addBtn} onClick={handleAdd}>
            + Add user
          </button>
        </div>
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")} className={classes.sortable}>
                Name {arrow("name")}
              </th>
              <th onClick={() => toggleSort("email")} className={classes.sortable}>
                Email {arrow("email")}
              </th>
              <th>Address</th>
              <th onClick={() => toggleSort("role")} className={classes.sortable}>
                Role {arrow("role")}
              </th>
              <th onClick={() => toggleSort("joined")} className={classes.sortable}>
                Joined {arrow("joined")}
              </th>
              <th className={classes.actionsCol}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className={classes.empty}>
                  No users yet.
                </td>
              </tr>
            )}
            {sorted.map((user) => (
              <tr key={user._id}>
                <td className={classes.nameCell}>{user.name}</td>
                <td className={classes.muted}>{user.email}</td>
                <td className={classes.muted}>{user.address || "—"}</td>
                <td>
                  <span className={user.isAdmin ? classes.badgeAdmin : classes.badgeUser}>
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </td>
                <td className={classes.muted}>{extractDate(user.createdAt)}</td>
                <td className={classes.actionsCol}>
                  <button className={classes.editBtn} onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button className={classes.deleteBtn} onClick={() => handleDelete(user)}>
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
          msg="Are you sure you want to delete user?"
          info={userToDelete}
          onConfirm={dialogConfirmed}
          onCancel={dialogCanceled}
        />
      )}
    </div>
  );
}

function extractDate(timestamp) {
  if (!timestamp) return "—";
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
