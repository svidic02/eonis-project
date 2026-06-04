import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderById, updateOrderStatus } from "../../../services/orderService";
import { useAuth } from "../../../hooks/useAuth";
import OrderItemsList from "../../../components/OrderItemsList/OrderItemsList";
import Price from "../../../components/Price/Price";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { agoLabel } from "../../../utils/dateWindow";
import classes from "./orderInfoPage.module.css";

const STATUSES = ["NEW", "COD_PENDING", "PAYED", "SHIPPED", "CANCELED", "REFUNDED"];

export default function OrderInfoPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const titlePrefix = user?.isAdmin ? "Footprint Admin" : "Footprint";
  useDocumentTitle(order ? `${titlePrefix} · Order #${String(order._id).slice(-6)}` : `${titlePrefix} · Order`);

  useEffect(() => {
    getOrderById(id, token)
      .then((o) => {
        setOrder(o);
        setDraftStatus(o.status);
      })
      .catch((err) => {
        setErrorStatus(err?.response?.status);
        setError(err?.response?.data || "Could not load order");
      });
  }, [id, token]);

  if (error) {
    const notFound = errorStatus === 404;
    const backTo = user?.isAdmin ? { to: "/orders", label: "Back to orders" } : { to: "/profile", label: "Back to your account" };
    return (
      <div className={classes.page}>
        <div className={classes.heading}>
          <h1>Order</h1>
          <Link to={backTo.to} className={classes.cancelLink}>← {backTo.label}</Link>
        </div>
        <div className={classes.card}>{notFound ? "Order not found." : error}</div>
      </div>
    );
  }

  if (!order) return null;

  const saveStatus = async () => {
    if (draftStatus === order.status) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order._id, draftStatus);
      setOrder(updated);
      toast.success(`Status updated to ${draftStatus}.`);
    } catch (err) {
      toast.error(err?.response?.data || "Could not update status");
      setDraftStatus(order.status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>Order #{String(order._id).slice(-6)}</h1>
        <button
          type="button"
          className={classes.cancelLink}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className={classes.card}>
        <div className={classes.metaGrid}>
          <div>
            <div className={classes.metaLabel}>Customer</div>
            <div className={classes.metaValue}>{order.name}</div>
          </div>
          <div>
            <div className={classes.metaLabel}>Address</div>
            <div className={classes.metaValue}>{order.address || "—"}</div>
          </div>
          <div>
            <div className={classes.metaLabel}>Status</div>
            <div className={classes.metaValue}>
              {user?.isAdmin ? (
                <div className={classes.statusEdit}>
                  <span className={`${classes.badge} ${classes["status_" + order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    disabled={saving}
                    className={classes.statusSelect}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={classes.saveStatusBtn}
                    onClick={saveStatus}
                    disabled={saving || draftStatus === order.status}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <span className={`${classes.badge} ${classes["status_" + order.status]}`}>
                  {order.status}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className={classes.metaLabel}>Placed</div>
            <div className={classes.metaValue}>
              {new Date(order.createdAt).toLocaleString()}
              <span className={classes.relTime}>{agoLabel(order.createdAt)}</span>
            </div>
          </div>
          {order.updatedAt && new Date(order.updatedAt).getTime() !== new Date(order.createdAt).getTime() && (
            <div>
              <div className={classes.metaLabel}>Last updated</div>
              <div className={classes.metaValue}>
                {new Date(order.updatedAt).toLocaleString()}
                <span className={classes.relTime}>{agoLabel(order.updatedAt)}</span>
              </div>
            </div>
          )}
          {order.paymentMethod && (
            <div>
              <div className={classes.metaLabel}>Payment method</div>
              <div className={classes.metaValue}>{order.paymentMethod}</div>
            </div>
          )}
          {order.phone && (
            <div>
              <div className={classes.metaLabel}>Phone</div>
              <div className={classes.metaValue}>{order.phone}</div>
            </div>
          )}
          {order.paymentId && (
            <div>
              <div className={classes.metaLabel}>Payment ID</div>
              <div className={classes.metaValue}>{order.paymentId}</div>
            </div>
          )}
        </div>

        <OrderItemsList order={order} />

        <dl className={classes.summary}>
          <dt>Subtotal</dt>
          <dd><Price price={order.subtotal ?? order.totalPrice} /></dd>

          <dt>Shipping</dt>
          <dd>
            {order.shipping > 0
              ? <Price price={order.shipping} />
              : <span className={classes.free}>Free</span>}
          </dd>

          {order.discount > 0 && (
            <>
              <dt className={classes.promoLabel}>
                Promo {order.promoCode || ""}
              </dt>
              <dd className={classes.discount}>−<Price price={order.discount} /></dd>
            </>
          )}

          <dt className={classes.totalLabel}>Total</dt>
          <dd className={classes.total}><Price price={order.totalPrice} /></dd>
        </dl>

        {!user && token && (
          <GuestReceipt orderId={order._id} token={token} />
        )}
      </div>
    </div>
  );
}

function GuestReceipt({ orderId, token }) {
  const orderUrl = `${window.location.origin}/orders/${orderId}?t=${encodeURIComponent(token)}`;
  const mailto =
    `mailto:?subject=${encodeURIComponent("Your Footprint order")}` +
    `&body=${encodeURIComponent(`Your order link:\n${orderUrl}`)}`;
  return (
    <div className={classes.guestReceipt}>
      <div className={classes.guestReceiptTitle}>Save this link — it's your receipt</div>
      <p className={classes.guestReceiptHint}>
        You're not signed in, so this URL is the only way back to your order. Bookmark it
        or email it to yourself.
      </p>
      <a href={mailto} className={classes.guestReceiptLink}>Email me this link</a>
      <code className={classes.guestReceiptUrl}>{orderUrl}</code>
    </div>
  );
}
