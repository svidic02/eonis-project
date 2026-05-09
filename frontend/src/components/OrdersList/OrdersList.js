import React from "react";
import Title from "../Title/Title";
import classes from "./ordersList.module.css";

export default function OrderList({ orders }) {
  return (
    <div className={classes.list}>
      <Title title="Orders" />
      <p className={classes.item}>{orders.length}</p>
      {orders.map((order) => (
        <div key={order._id} className={classes.item}>
          <p>Name: {order.name}</p>
          <p>Address: {order.address}</p>
          <p>Total Price: {order.totalPrice}$</p>
          <p>State: {statusToTxt(order.status)}</p>
        </div>
      ))}
    </div>
  );
}

function statusToTxt(status) {
  switch (status) {
    case "NEW":
      return "New Order";
    case "PAYED":
      return "Order has been paid";
    case "SHIPPED":
      return "Order has been shipped";
    case "CANCELED":
      return "Order has been canceled";
    case "REFUNDED":
      return "Order has been refunded";
    default:
      return "Unknown Status";
  }
}
