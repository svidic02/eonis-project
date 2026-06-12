import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import classes from "./profilePage.module.css";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getMyOrders } from "../../services/orderService";
import Price from "../../components/Price/Price";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const FIELDS = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address", type: "text" },
];

export default function ProfilePage() {
  useDocumentTitle("Footprint · Account");
  const { user, edit } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) navigate("/");
    else {
      setProfile(user);
      if (!user.isAdmin) {
        getMyOrders().then(setOrders).catch(() => {});
      }
    }
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
            <div className={classes.avatarInitials}>{getInitials(profile.name)}</div>
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

      <section className={classes.ordersSection}>
        {profile.isAdmin ? null : (
          <>
            <h2 className={classes.detailsTitle}>Your orders</h2>
            {orders.length === 0 ? (
              <div className={classes.emptyOrders}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
                <div className={classes.emptyOrdersTitle}>No orders yet</div>
                <div className={classes.emptyOrdersHint}>Your orders will show up here once you place one.</div>
                <button
                  type="button"
                  className={classes.emptyOrdersCta}
                  onClick={() => navigate("/")}
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <ul className={classes.orderList}>
                {orders.map((o) => (
                  <li
                    key={o._id}
                    className={classes.orderRow}
                    onClick={() => navigate(`/orders/${o._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={classes.orderMeta}>
                      <span className={classes.orderDate}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`${classes.orderStatus} ${classes["status_" + o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className={classes.orderItems}>
                      {o.items.map((it, i) => (
                        <span key={i}>
                          {it.product?.name} ({it.selectedColor} · {it.selectedSize}) × {it.quantity}
                          {i < o.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    <div className={classes.orderTotal}><Price price={o.totalPrice} /></div>
                  </li>
                ))}
          </ul>
        )}
          </>
        )}
      </section>

      {!profile.isAdmin && (
        <p className={classes.helpHint}>
          Need help with an order or have a question? <Link to="/contact">Contact us</Link>.
        </p>
      )}
    </div>
  );
}

function extractDate(timestamp) {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}
