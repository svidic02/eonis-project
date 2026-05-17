import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createOrder } from "../../services/orderService";
import classes from "./checkoutPage.module.css";
import Input from "../../components/Input/Input";
import Price from "../../components/Price/Price";

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order] = useState({ ...cart });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const submit = async (data) => {
    await createOrder({
      ...order,
      name: data.name,
      email: data.email,
      address: data.address,
    });
    navigate("/payment");
  };

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>Checkout</h1>
        <Link to="/cart" className={classes.backLink}>← Back to cart</Link>
      </div>

      <form onSubmit={handleSubmit(submit)} className={classes.layout}>
        <div className={classes.formCard}>
          <h2 className={classes.cardTitle}>Shipping details</h2>
          <div className={classes.fields}>
            <Input
              defaultValue={user?.name}
              label="Name"
              {...register("name", { required: true })}
              error={errors.name}
            />
            <Input
              defaultValue={user?.email}
              label="Email"
              type="email"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                  message: "Email is not valid",
                },
              })}
              error={errors.email}
            />
            <Input
              defaultValue={user?.address}
              label="Address"
              {...register("address", { required: true })}
              error={errors.address}
            />
          </div>
        </div>

        <aside className={classes.summaryCard}>
          <h2 className={classes.cardTitle}>Order summary</h2>
          <ul className={classes.lines}>
            {cart.items?.map((item) => (
              <li
                key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                className={classes.line}
              >
                {item.product.imageUrl && (
                  <img
                    className={classes.thumb}
                    src={item.product.imageUrl}
                    alt={item.product.name}
                  />
                )}
                <div className={classes.lineBody}>
                  <div className={classes.lineName}>{item.product.name}</div>
                  <div className={classes.lineMeta}>
                    {item.selectedColor} · Size {item.selectedSize}
                  </div>
                  <div className={classes.lineMeta}>
                    {item.quantity} × <Price price={item.price} />
                  </div>
                </div>
                <div className={classes.linePrice}>
                  <Price price={item.price * item.quantity} />
                </div>
              </li>
            ))}
          </ul>

          <div className={classes.summaryRow}>
            <span>Items</span>
            <span>{cart.totalCount}</span>
          </div>
          <div className={`${classes.summaryRow} ${classes.totalRow}`}>
            <span>Total</span>
            <span><Price price={cart.totalPrice} /></span>
          </div>

          <button type="submit" className={classes.submitBtn}>
            Continue to payment
          </button>
        </aside>
      </form>
    </div>
  );
}
