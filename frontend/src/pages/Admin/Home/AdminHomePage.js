import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { getAllOrders } from "../../../services/orderService";
import { getAllUsers } from "../../../services/userService";
import { getAll as getAllProducts } from "../../../services/productService";
import { withinWindow, WINDOW_LABELS, daysAgo } from "../../../utils/dateWindow";
import Price from "../../../components/Price/Price";
import classes from "./adminHome.module.css";

const LOW_STOCK = 5;
const STALE_DAYS = 7;
const WINDOW_KEYS = ["today", "week", "month", "all"];
const WINDOW_STORAGE_KEY = "admin.dashboard.window";

export default function AdminHomePage() {
  useDocumentTitle("Footprint Admin · Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [users, setUsers] = useState(null);
  const [products, setProducts] = useState(null);
  const [windowKey, setWindowKey] = useState(() => {
    const stored = localStorage.getItem(WINDOW_STORAGE_KEY);
    return WINDOW_KEYS.includes(stored) ? stored : "all";
  });

  useEffect(() => {
    Promise.all([getAllOrders(), getAllUsers(), getAllProducts()])
      .then(([o, u, p]) => {
        setOrders(o);
        setUsers(u);
        setProducts(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(WINDOW_STORAGE_KEY, windowKey);
  }, [windowKey]);

  const ordersInWindow = useMemo(
    () => (orders ?? []).filter((o) => withinWindow(o.createdAt, windowKey)),
    [orders, windowKey]
  );

  const orderCount = orders ? ordersInWindow.length : null;

  const pendingCount = useMemo(
    () =>
      ordersInWindow.filter((o) => o.status === "NEW" || o.status === "COD_PENDING").length,
    [ordersInWindow]
  );

  const revenueInWindow = useMemo(
    () =>
      ordersInWindow
        .filter((o) => o.status !== "CANCELED" && o.status !== "REFUNDED")
        .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0),
    [ordersInWindow]
  );

  const staleOrders = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter(
        (o) =>
          (o.status === "NEW" || o.status === "COD_PENDING") &&
          daysAgo(o.createdAt) >= STALE_DAYS
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [orders]);
  const staleTop = staleOrders.slice(0, 5);

  const lowStockTop = useMemo(() => {
    if (!products) return [];
    return products
      .map((p) => {
        const lows = (p.variants ?? []).filter((v) => (v.stock ?? 0) > 0 && (v.stock ?? 0) < LOW_STOCK);
        if (lows.length === 0) return null;
        const minStock = Math.min(...lows.map((v) => v.stock));
        return { product: p, lowCount: lows.length, minStock };
      })
      .filter(Boolean)
      .sort((a, b) => a.minStock - b.minStock)
      .slice(0, 5);
  }, [products]);

  const placeholder = "—";
  const revenueLabel =
    windowKey === "today" ? "Today's revenue" : `Revenue (${WINDOW_LABELS[windowKey].toLowerCase()})`;
  const orderTileLabel =
    windowKey === "all" ? "Orders" : `Orders (${WINDOW_LABELS[windowKey].toLowerCase()})`;
  const ordersHref = windowKey === "all" ? "/orders" : `/orders?from=${windowKey}`;
  const revenueHref = windowKey === "all" ? "/orders?from=today" : `/orders?from=${windowKey}`;

  return (
    <div className={classes.page}>
      <h1 className={classes.greeting}>Welcome back, {user?.name?.split(" ")[0] ?? user?.name}.</h1>

      <div className={classes.windowRow} role="tablist" aria-label="Time window">
        {WINDOW_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={windowKey === k}
            className={`${classes.windowPill} ${windowKey === k ? classes.windowPillActive : ""}`}
            onClick={() => setWindowKey(k)}
          >
            {WINDOW_LABELS[k]}
          </button>
        ))}
      </div>

      <div className={classes.statRow}>
        <button type="button" className={classes.statTile} onClick={() => navigate(ordersHref)}>
          <span className={classes.statLabel}>{orderTileLabel}</span>
          <span className={classes.statValue}>{orderCount != null ? orderCount : placeholder}</span>
        </button>
        <button type="button" className={classes.statTile} onClick={() => navigate("/users")}>
          <span className={classes.statLabel}>Users</span>
          <span className={classes.statValue}>{users ? users.length : placeholder}</span>
        </button>
        <button type="button" className={classes.statTile} onClick={() => navigate("/products")}>
          <span className={classes.statLabel}>Products</span>
          <span className={classes.statValue}>{products ? products.length : placeholder}</span>
        </button>
        <button type="button" className={classes.statTile} onClick={() => navigate(revenueHref)}>
          <span className={classes.statLabel}>{revenueLabel}</span>
          <span className={classes.statValue}>
            {orders ? <Price price={revenueInWindow} /> : placeholder}
          </span>
        </button>
      </div>

      <button
        type="button"
        className={`${classes.attentionCard} ${pendingCount > 0 ? classes.attentionCardActive : ""}`}
        onClick={() => navigate("/orders?status=COD_PENDING")}
      >
        <div>
          <div className={classes.attentionLabel}>Orders that need attention</div>
          <div className={classes.attentionHint}>
            New + COD pending — flip these forward as they're packed and shipped.
          </div>
        </div>
        <div className={classes.attentionCount}>{orders ? pendingCount : placeholder}</div>
      </button>

      <section className={classes.panel}>
        <h2 className={classes.panelTitle}>
          Stale orders
          {staleOrders.length > 0 && (
            <span className={classes.panelCount}>{staleOrders.length}</span>
          )}
        </h2>
        {!orders ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : staleTop.length === 0 ? (
          <div className={classes.placeholder}>No stale orders. All caught up.</div>
        ) : (
          <ul className={classes.staleList}>
            {staleTop.map((o) => (
              <li
                key={o._id}
                className={classes.staleRow}
                onClick={() => navigate(`/orders/${o._id}`)}
              >
                <span className={classes.staleId}>#{String(o._id).slice(-6)}</span>
                <span className={classes.staleName}>{o.name}</span>
                <span className={classes.staleAge}>
                  {daysAgo(o.createdAt)} days ago
                </span>
                <span className={`${classes.staleStatus} ${classes["status_" + o.status]}`}>
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={classes.panel}>
        <h2 className={classes.panelTitle}>Low stock</h2>
        {!products ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : lowStockTop.length === 0 ? (
          <div className={classes.placeholder}>No low-stock variants. Everything healthy.</div>
        ) : (
          <ul className={classes.lowList}>
            {lowStockTop.map(({ product, lowCount, minStock }) => (
              <li
                key={product._id}
                className={classes.lowRow}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className={classes.lowThumb} />
                )}
                <div className={classes.lowBody}>
                  <div className={classes.lowName}>{product.name}</div>
                  <div className={classes.lowMeta}>
                    {product.brand} · {lowCount} variant{lowCount === 1 ? "" : "s"} low · min {minStock} in stock
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={classes.panel}>
        <h2 className={classes.panelTitle}>Shortcuts</h2>
        <div className={classes.shortcutGrid}>
          <button type="button" className={classes.shortcut} onClick={() => navigate("/orders")}>
            <span className={classes.shortcutLabel}>Orders</span>
            <span className={classes.shortcutHint}>View and manage all orders</span>
          </button>
          <button type="button" className={classes.shortcut} onClick={() => navigate("/products")}>
            <span className={classes.shortcutLabel}>Products</span>
            <span className={classes.shortcutHint}>Catalog, variants, stock</span>
          </button>
          <button type="button" className={classes.shortcut} onClick={() => navigate("/users")}>
            <span className={classes.shortcutLabel}>Users</span>
            <span className={classes.shortcutHint}>Customer accounts</span>
          </button>
          <button type="button" className={classes.shortcut} onClick={() => navigate("/admin/analytics")}>
            <span className={classes.shortcutLabel}>Analytics</span>
            <span className={classes.shortcutHint}>Top sellers, revenue, trends</span>
          </button>
          <button type="button" className={classes.shortcut} onClick={() => navigate("/promos")}>
            <span className={classes.shortcutLabel}>Promos</span>
            <span className={classes.shortcutHint}>Discount codes</span>
          </button>
        </div>
      </section>
    </div>
  );
}
