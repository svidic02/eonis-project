import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import classes from "./profilePage.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FIELDS = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address", type: "text" },
];

export default function ProfilePage() {
  const { user, edit } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate("/");
    else setProfile(user);
  }, [user, navigate]);

  if (!profile) return null;

  const startEdit = (key) => {
    setEditingField(key);
    setDraft(profile[key] ?? "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraft("");
  };

  const saveEdit = async () => {
    if (draft === (profile[editingField] ?? "")) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        address: profile.address,
        [editingField]: draft,
      };
      await edit(payload);
      setProfile((p) => ({ ...p, [editingField]: draft }));
      toast.success("Profile updated.");
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>Account</h1>
        <p>Manage your profile information.</p>
      </div>

      <div className={classes.layout}>
        <aside className={classes.summary}>
          <div className={classes.avatarWrapper}>
            <img src="basics/user.png" alt={profile.name} />
          </div>
          <div className={classes.summaryName}>{profile.name}</div>
          <span
            className={profile.isAdmin ? classes.badgeAdmin : classes.badgeUser}
          >
            {profile.isAdmin ? "Admin" : "User"}
          </span>
          <div className={classes.summaryMeta}>{profile.email}</div>
          {profile.createdAt && (
            <div className={classes.summaryMetaSmall}>
              Member since {extractDate(profile.createdAt)}
            </div>
          )}
        </aside>

        <section className={classes.details}>
          <h2 className={classes.detailsTitle}>Account details</h2>

          {FIELDS.map((field) => {
            const isEditing = editingField === field.key;
            return (
              <div key={field.key} className={classes.row}>
                <div className={classes.rowLabel}>{field.label}</div>
                {isEditing ? (
                  <div className={classes.editWrap}>
                    <input
                      type={field.type}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className={classes.input}
                      autoFocus
                    />
                    <div className={classes.editActions}>
                      <button
                        className={classes.saveBtn}
                        onClick={saveEdit}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        className={classes.cancelBtn}
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={classes.readWrap}>
                    <span className={classes.rowValue}>
                      {profile[field.key] || (
                        <span className={classes.placeholder}>—</span>
                      )}
                    </span>
                    <button
                      className={classes.editBtn}
                      onClick={() => startEdit(field.key)}
                      disabled={!!editingField}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className={classes.row}>
            <div className={classes.rowLabel}>Password</div>
            <div className={classes.readWrap}>
              <span className={classes.rowValue}>••••••••</span>
              <button
                className={classes.editBtn}
                disabled
                title="Coming soon"
              >
                Change
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function extractDate(timestamp) {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
