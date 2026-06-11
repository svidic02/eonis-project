import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { getAllOrders } from "../../../services/orderService";
import { getAll as getAllProducts } from "../../../services/productService";
import { withinWindow, withinPreviousWindow, WINDOW_LABELS } from "../../../utils/dateWindow";
import {
  flattenOrderItems, topProducts, topSizes, topBrands,
  revenueByCategory, revenueTrend, promoUsage, stockHealth,
} from "../../../utils/analytics";
import Price from "../../../components/Price/Price";
import classes from "./analytics.module.css";

const WINDOW_KEYS = ["today", "week", "month", "all"];
const WINDOW_STORAGE_KEY = "admin.analytics.window";
const GENDERS = [
  { key: "all", label: "All" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
];
const CATEGORY_COLORS = ["#1f8a70", "#c66a1a", "#3a78d4", "#a14fb0", "#d4a23a"];

const fmtRSD = (v) =>
  new Intl.NumberFormat("sr-RS", { style: "currency", currency: "RSD", maximumFractionDigits: 0 }).format(v ?? 0);

export default function AnalyticsPage() {
  useDocumentTitle("Footprint Admin · Analytics");
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [windowKey, setWindowKey] = useState(() => {
    const stored = localStorage.getItem(WINDOW_STORAGE_KEY);
    return WINDOW_KEYS.includes(stored) ? stored : "month";
  });
  const [productGender, setProductGender] = useState("all");
  const [sizeGender, setSizeGender] = useState("all");
  const [productRank, setProductRank] = useState("units");
  const [categoryBasis, setCategoryBasis] = useState("revenue");

  const RANKS = [
    { key: "units", label: "Units" },
    { key: "revenue", label: "Revenue" },
  ];
  const BASES = [
    { key: "revenue", label: "Revenue" },
    { key: "units", label: "Units" },
    { key: "orders", label: "Orders" },
  ];

  useEffect(() => {
    Promise.all([getAllOrders(), getAllProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(WINDOW_STORAGE_KEY, windowKey);
  }, [windowKey]);

  const windowedOrders = useMemo(
    () =>
      (orders ?? []).filter(
        (o) => withinWindow(o.createdAt, windowKey) && o.status !== "CANCELED" && o.status !== "REFUNDED"
      ),
    [orders, windowKey]
  );

  const prevWindowedOrders = useMemo(
    () =>
      (orders ?? []).filter(
        (o) =>
          withinPreviousWindow(o.createdAt, windowKey) &&
          o.status !== "CANCELED" &&
          o.status !== "REFUNDED"
      ),
    [orders, windowKey]
  );

  const stats = useMemo(() => computeStats(windowedOrders), [windowedOrders]);
  const prevStats = useMemo(() => computeStats(prevWindowedOrders), [prevWindowedOrders]);
  const showDelta = windowKey !== "all";

  const trendData = useMemo(() => revenueTrend(orders ?? [], windowKey), [orders, windowKey]);

  const topProductsData = useMemo(() => {
    const rows = flattenOrderItems(orders, { window: windowKey, gender: productGender });
    return [...topProducts(rows, 8)].sort((a, b) => b[productRank] - a[productRank]);
  }, [orders, windowKey, productGender, productRank]);

  const topBrandsData = useMemo(() => {
    const rows = flattenOrderItems(orders, { window: windowKey, gender: productGender });
    return [...topBrands(rows, 8)].sort((a, b) => b[productRank] - a[productRank]);
  }, [orders, windowKey, productGender, productRank]);

  const promoUsageData = useMemo(
    () => promoUsage(orders ?? [], { window: windowKey }),
    [orders, windowKey]
  );

  const topSizesData = useMemo(() => {
    const rows = flattenOrderItems(orders, { window: windowKey, gender: sizeGender });
    return topSizes(rows, 10);
  }, [orders, windowKey, sizeGender]);

  const categoryData = useMemo(() => {
    const rows = flattenOrderItems(orders, { window: windowKey });
    return revenueByCategory(rows).filter((r) => r[categoryBasis] > 0);
  }, [orders, windowKey, categoryBasis]);

  const stockHealthData = useMemo(() => stockHealth(products ?? []), [products]);

  const loading = orders === null || products === null;

  return (
    <div className={classes.page}>
      <div className={classes.header}>
        <h1 className={classes.title}>Analytics</h1>
        <div className={classes.windowRow} role="tablist" aria-label="Time window">
          {WINDOW_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={windowKey === k}
              className={`${classes.pill} ${windowKey === k ? classes.pillActive : ""}`}
              onClick={() => setWindowKey(k)}
            >
              {WINDOW_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className={classes.statRow}>
        <div className={classes.statTile}>
          <span className={classes.statLabel}>Orders</span>
          <span className={classes.statValue}>{loading ? "—" : stats.ordersCount}</span>
          {!loading && showDelta && <DeltaChip curr={stats.ordersCount} prev={prevStats.ordersCount} />}
        </div>
        <div className={classes.statTile}>
          <span className={classes.statLabel}>Units sold</span>
          <span className={classes.statValue}>{loading ? "—" : stats.units}</span>
          {!loading && showDelta && <DeltaChip curr={stats.units} prev={prevStats.units} />}
        </div>
        <div className={classes.statTile}>
          <span className={classes.statLabel}>Revenue</span>
          <span className={classes.statValue}>
            {loading ? "—" : <Price price={stats.revenue} />}
          </span>
          {!loading && showDelta && <DeltaChip curr={stats.revenue} prev={prevStats.revenue} />}
        </div>
        <div className={classes.statTile}>
          <span className={classes.statLabel}>Avg order value</span>
          <span className={classes.statValue}>
            {loading ? "—" : <Price price={Math.round(stats.aov)} />}
          </span>
          {!loading && showDelta && <DeltaChip curr={stats.aov} prev={prevStats.aov} />}
        </div>
        <button
          type="button"
          className={`${classes.statTile} ${classes.statTileButton}`}
          onClick={() => navigate("/products")}
        >
          <span className={classes.statLabel}>Stock health</span>
          {loading ? (
            <span className={classes.statValue}>—</span>
          ) : (
            <span className={classes.stockBlock}>
              <span className={classes.stockMain}>{stockHealthData.totalUnits} units</span>
              <span className={classes.stockMeta}>
                <span className={classes.stockLow}>{stockHealthData.lowPct}% low</span>
                <span className={classes.stockOut}>{stockHealthData.outPct}% out</span>
              </span>
            </span>
          )}
        </button>
      </div>

      <section className={classes.panel}>
        <h2 className={classes.panelTitle}>Revenue trend</h2>
        {loading ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : trendData.length === 0 || trendData.every((d) => d.revenue === 0) ? (
          <div className={classes.placeholder}>No data in this window.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bucket" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => fmtRSD(v)} width={90} />
              <Tooltip formatter={(v) => fmtRSD(v)} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1f8a70" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <div className={classes.row2}>
        <section className={`${classes.panel} ${classes.panelGrow}`}>
          <div className={classes.panelHead}>
            <h2 className={classes.panelTitle}>Top products</h2>
            <div className={classes.miniPills}>
              {RANKS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`${classes.miniPill} ${productRank === r.key ? classes.miniPillActive : ""}`}
                  onClick={() => setProductRank(r.key)}
                >
                  {r.label}
                </button>
              ))}
              <span className={classes.miniPillSpacer} />
              {GENDERS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  className={`${classes.miniPill} ${productGender === g.key ? classes.miniPillActive : ""}`}
                  onClick={() => setProductGender(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className={classes.placeholder}>Loading…</div>
          ) : topProductsData.length === 0 ? (
            <div className={classes.placeholder}>No data in this window.</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, topProductsData.length * 36)}>
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  allowDecimals={false}
                  tickFormatter={(v) => (productRank === "revenue" ? fmtRSD(v) : v)}
                />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={130} />
                <Tooltip
                  formatter={(v) => (productRank === "revenue" ? fmtRSD(v) : `${v} units`)}
                />
                <Bar
                  dataKey={productRank}
                  fill="#1f8a70"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(d) => d?.productId && navigate(`/products/${d.productId}`)}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className={`${classes.panel} ${classes.panelSide}`}>
          <div className={classes.panelHead}>
            <h2 className={classes.panelTitle}>Top sizes</h2>
            <div className={classes.miniPills}>
              {GENDERS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  className={`${classes.miniPill} ${sizeGender === g.key ? classes.miniPillActive : ""}`}
                  onClick={() => setSizeGender(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className={classes.placeholder}>Loading…</div>
          ) : topSizesData.length === 0 ? (
            <div className={classes.placeholder}>No data in this window.</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, topSizesData.length * 30)}>
              <BarChart
                data={[...topSizesData]
                  .sort((a, b) => Number(a.size) - Number(b.size))
                  .map((d) => ({ ...d, size: String(d.size) }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="category" dataKey="size" stroke="var(--text-muted)" fontSize={12} interval={0} />
                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip formatter={(v) => `${v} units`} />
                <Bar dataKey="units" fill="#3a78d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className={classes.panel}>
        <div className={classes.panelHead}>
          <h2 className={classes.panelTitle}>
            {categoryBasis === "revenue" ? "Revenue by category" : categoryBasis === "units" ? "Units by category" : "Orders by category"}
          </h2>
          <div className={classes.miniPills}>
            {BASES.map((b) => (
              <button
                key={b.key}
                type="button"
                className={`${classes.miniPill} ${categoryBasis === b.key ? classes.miniPillActive : ""}`}
                onClick={() => setCategoryBasis(b.key)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : categoryData.length === 0 ? (
          <div className={classes.placeholder}>No data in this window.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey={categoryBasis}
                nameKey="category"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) =>
                  categoryBasis === "revenue"
                    ? fmtRSD(v)
                    : categoryBasis === "units"
                    ? `${v} units`
                    : `${v} orders`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>
      <section className={classes.panel}>
        <div className={classes.panelHead}>
          <h2 className={classes.panelTitle}>Top brands</h2>
          <span className={classes.panelHint}>Filter shared with Top products</span>
        </div>
        {loading ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : topBrandsData.length === 0 ? (
          <div className={classes.placeholder}>No data in this window.</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, topBrandsData.length * 36)}>
            <BarChart
              data={topBrandsData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                stroke="var(--text-muted)"
                fontSize={12}
                allowDecimals={false}
                tickFormatter={(v) => (productRank === "revenue" ? fmtRSD(v) : v)}
              />
              <YAxis type="category" dataKey="brand" stroke="var(--text-muted)" fontSize={12} width={130} />
              <Tooltip formatter={(v) => (productRank === "revenue" ? fmtRSD(v) : `${v} units`)} />
              <Bar dataKey={productRank} fill="#a14fb0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className={classes.panel}>
        <h2 className={classes.panelTitle}>Promo usage</h2>
        {loading ? (
          <div className={classes.placeholder}>Loading…</div>
        ) : promoUsageData.length === 0 ? (
          <div className={classes.placeholder}>No promos redeemed in this window.</div>
        ) : (
          <table className={classes.promoTable}>
            <thead>
              <tr>
                <th>Code</th>
                <th className={classes.numCol}>Redemptions</th>
                <th className={classes.numCol}>Total discount</th>
                <th className={classes.numCol}>AOV w/ promo</th>
              </tr>
            </thead>
            <tbody>
              {promoUsageData.map((p) => (
                <tr key={p.code}>
                  <td className={classes.promoCode}>{p.code}</td>
                  <td className={classes.numCol}>{p.redemptions}</td>
                  <td className={classes.numCol}><Price price={p.discount} /></td>
                  <td className={classes.numCol}><Price price={p.aov} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function computeStats(orders) {
  let ordersCount = orders.length;
  let units = 0;
  let revenue = 0;
  for (const o of orders) {
    revenue += o.totalPrice ?? 0;
    for (const it of o.items ?? []) units += it.quantity ?? 0;
  }
  const aov = ordersCount ? revenue / ordersCount : 0;
  return { ordersCount, units, revenue, aov };
}

function DeltaChip({ curr, prev }) {
  if (prev === 0 && curr === 0) {
    return <span className={`${classes.deltaChip} ${classes.deltaNeutral}`}>—</span>;
  }
  if (prev === 0) {
    return <span className={`${classes.deltaChip} ${classes.deltaUp}`}>new</span>;
  }
  const pct = ((curr - prev) / prev) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) {
    return <span className={`${classes.deltaChip} ${classes.deltaNeutral}`}>≈ vs prior</span>;
  }
  const up = rounded > 0;
  return (
    <span className={`${classes.deltaChip} ${up ? classes.deltaUp : classes.deltaDown}`}>
      {up ? "▲" : "▼"} {Math.abs(rounded)}% vs prior
    </span>
  );
}
