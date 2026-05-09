import React, { useState, useEffect } from "react";
import classes from "./paymentPage.module.css";
import { getNewOrderForCurrentUser } from "../../services/orderService";
import Title from "../../components/Title/Title";
import OrderItemsList from "../../components/OrderItemsList/OrderItemsList";
import { useLoading } from "../../hooks/useLoading";

export default function PaymentPage() {
  const [order, setOrder] = useState();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    getNewOrderForCurrentUser().then((data) => setOrder(data));
  }, []);

  if (!order) return;

  return (
    <>
      <div className={classes.container}>
        <div className={classes.content}>
          <Title title="Order Form" fontSize="1.6rem" />
          <div className={classes.summary}>
            <div>
              <h3>Name:</h3>
              <span>{order.name}</span>
            </div>
            <div>
              <h3>Address:</h3>
              <span>{order.address}</span>
            </div>
          </div>
          {order != undefined ? <OrderItemsList order={order} /> : showLoading()}
        </div>

        {/* <div className={classes.buttons_container}>
          <div className={classes.buttons}>
            <PayPalButtons order={order} />
          </div>
        </div> */}
      </div>
    </>
  );
}
