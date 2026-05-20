import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById } from "../../../services/orderService";
import OrderItemsList from "../../../components/OrderItemsList/OrderItemsList";
import classes from "./orderInfoPage.module.css";

export default function OrderInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err?.response?.data || "Could not load order"));
  }, [id]);

  if (error) {
    return (
      <div className={classes.page}>
        <div className={classes.heading}>
          <h1>Order</h1>
          <Link to="/profile" className={classes.cancelLink}>← Back</Link>
        </div>
        <div className={classes.card}>{error}</div>
      </div>
    );
  }

  if (!order) return null;

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
              <span className={`${classes.badge} ${classes["status_" + order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>
          <div>
            <div className={classes.metaLabel}>Placed</div>
            <div className={classes.metaValue}>
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          {order.paymentId && (
            <div>
              <div className={classes.metaLabel}>Payment ID</div>
              <div className={classes.metaValue}>{order.paymentId}</div>
            </div>
          )}
        </div>

        <OrderItemsList order={order} />
      </div>
    </div>
  );
}
