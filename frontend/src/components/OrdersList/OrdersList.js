import React, { useMemo, useState } from "react";
import classes from "./ordersList.module.css";

export default function OrderList({ orders }) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    const arr = [...orders];
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
  }, [orders, sortKey, sortDir]);

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
        <span className={classes.numberOf}>{orders.length} total</span>
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th onClick={() => toggleSort("name")} className={classes.sortable}>Customer {arrow("name")}</th>
              <th>Address</th>
              <th onClick={() => toggleSort("total")} className={`${classes.sortable} ${classes.numCol}`}>Total {arrow("total")}</th>
              <th onClick={() => toggleSort("status")} className={classes.sortable}>Status {arrow("status")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={5} className={classes.empty}>No orders yet.</td></tr>
            )}
            {sorted.map((order) => (
              <tr key={order._id}>
                <td className={classes.id}>#{String(order._id).slice(-6)}</td>
                <td className={classes.nameCell}>{order.name}</td>
                <td className={classes.muted}>{order.address || "—"}</td>
                <td className={classes.numCol}>${order.totalPrice}</td>
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
    case "PAYED": return classes.statusPaid;
    case "SHIPPED": return classes.statusShipped;
    case "CANCELED":
    case "REFUNDED": return classes.statusCanceled;
    default: return classes.statusUnknown;
  }
}
