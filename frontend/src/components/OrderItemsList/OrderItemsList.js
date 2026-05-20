import React from "react";
import { Link } from "react-router-dom";
import Price from "../Price/Price";
import classes from "./orderItemsList.module.css";

export default function OrderItemsList({ order }) {
  return (
    <>
      <table className={classes.table}>
        <tbody>
          <tr>
            <td colSpan="6">
              <h3>Order items:</h3>
            </td>
          </tr>
          {order.items &&
            order.items.map((item, idx) => (
              <tr key={`${item.product.id}-${item.sku ?? idx}`}>
                <td>
                  <Link to={`/product/${item.product.id}`}>
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className={classes.img}
                    />
                  </Link>
                </td>
                <td>{item.product.name}</td>
                <td>
                  {item.selectedColor} · Size {item.selectedSize}
                </td>
                <td>
                  <Price price={item.product.price} />
                </td>
                <td>{item.quantity}</td>
                <td>
                  <Price price={item.price} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className={classes.bottom_wrapper}>
        <p className={classes.total_price}>
          Total : <Price price={order.totalPrice} />
        </p >
      </div>
    </>
  );
}
