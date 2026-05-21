import React, { useMemo, useState } from "react";
import classes from "./ordersList.module.css";
import { useNavigate } from "react-router-dom";
import Price from "../Price/Price";
import SearchInput from "../SearchInput/SearchInput";

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "COD_PENDING", label: "COD pending" },
  { key: "PAYED", label: "Paid" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "CANCELED", label: "Canceled" },
];

export default function OrderList({ orders }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (!q) return true;
      return [o.name, o.address, String(o._id), o.paymentMethod]
        .some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [orders, query, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "total":
          av = a.totalPrice ?? 0;
          bv = b.totalPrice ?? 0;
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
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const arrow = (key) =>
    sortKey === key ? <span className={classes.arrow}>{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <h1 className={classes.title}>Orders</h1>
        <div className={classes.headerRight}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search orders…" />
          <span className={classes.numberOf}>
            {query || statusFilter !== "ALL"
              ? `${filtered.length} of ${orders.length}`
              : `${orders.length} total`}
          </span>
        </div>
      </div>

      <div className={classes.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${classes.filterPill} ${statusFilter === f.key ? classes.filterPillActive : ""}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th onClick={() => toggleSort("name")} className={classes.sortable}>Customer {arrow("name")}</th>
              <th>Address</th>
              <th onClick={() => toggleSort("paymentMethod")} className={classes.sortable}>Payment {arrow("paymentMethod")}</th>
              <th onClick={() => toggleSort("total")} className={`${classes.sortable} ${classes.numCol}`}>Total {arrow("total")}</th>
              <th onClick={() => toggleSort("status")} className={classes.sortable}>Status {arrow("status")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={6} className={classes.empty}>No orders yet.</td></tr>
            )}
            {sorted.map((order) => (
              <tr
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                style={{ cursor: "pointer" }}
              >
                <td className={classes.id}>#{String(order._id).slice(-6)}</td>
                <td className={classes.nameCell}>{order.name}</td>
                <td className={classes.muted}>{order.address || "—"}</td>
                <td className={classes.muted}>{order.paymentMethod || "—"}</td>
                <td className={classes.numCol}><Price price={order.totalPrice} /></td>
                <td>
                  <span className={`${classes.badge} ${statusClass(order.status, classes)}`}>
                    {statusToTxt(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusToTxt(status) {
  switch (status) {
    case "NEW": return "New";
    case "COD_PENDING": return "COD pending";
    case "PAYED": return "Paid";
    case "SHIPPED": return "Shipped";
    case "CANCELED": return "Canceled";
    case "REFUNDED": return "Refunded";
    default: return "Unknown";
  }
}

function statusClass(status, classes) {
  switch (status) {
    case "NEW": return classes.statusNew;
    case "COD_PENDING": return classes.statusCodPending;
    case "PAYED": return classes.statusPaid;
    case "SHIPPED": return classes.statusShipped;
    case "CANCELED":
    case "REFUNDED": return classes.statusCanceled;
    default: return classes.statusUnknown;
  }
}
