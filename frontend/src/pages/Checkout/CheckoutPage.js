import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createOrder } from "../../services/orderService";
import { FREE_SHIPPING_OVER } from "../../constants/shipping";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import classes from "./checkoutPage.module.css";
import Input from "../../components/Input/Input";
import Price from "../../components/Price/Price";

export default function CheckoutPage() {
  useDocumentTitle("Footprint · Checkout");
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm();

  const submit = async (data) => {
    try {
      const created = await createOrder({
        ...cart,
        name: data.name,
        email: data.email,
        address: data.address,
        phone: data.phone,
        promoCode: cart.promo?.code ?? null,
        paymentMethod,
      });
      clearCart();
      toast.success("Order placed.");
      navigate(`/orders/${created._id}`);
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" && msg ? msg : "Could not place order");
    }
  };

  const freeShippingReached = cart.subtotal >= FREE_SHIPPING_OVER;

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
            <Input
              label="Phone (for delivery)"
              type="tel"
              placeholder="+381 …"
              {...register("phone", {
                required: paymentMethod === "COD",
                minLength: { value: 6, message: "Phone is too short" },
              })}
              error={errors.phone}
            />
          </div>

          <h2 className={`${classes.cardTitle} ${classes.paymentTitle}`}>Payment method</h2>
          <div className={classes.paymentOptions}>
            <label className={`${classes.paymentOption} ${paymentMethod === "COD" ? classes.paymentSelected : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span className={classes.paymentBody}>
                <span className={classes.paymentLabel}>Cash on delivery</span>
                <span className={classes.paymentHint}>Pay the courier when your order arrives.</span>
              </span>
            </label>
            <label className={`${classes.paymentOption} ${classes.paymentDisabled}`}>
              <input type="radio" name="paymentMethod" value="PAYPAL" disabled />
              <span className={classes.paymentBody}>
                <span className={classes.paymentLabel}>PayPal</span>
                <span className={classes.paymentHint}>Coming soon — RSD not supported.</span>
              </span>
            </label>
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
                    {item.quantity} × <Price price={item.product.price} />
                  </div>
                </div>
                <div className={classes.linePrice}>
                  <Price price={item.price} />
                </div>
              </li>
            ))}
          </ul>

          <dl className={classes.summary}>
            <dt>Subtotal</dt>
            <dd><Price price={cart.subtotal} /></dd>

            <dt>Shipping</dt>
            <dd>
              {cart.shipping === 0 ? (
                <span className={classes.free}>Free</span>
              ) : (
                <Price price={cart.shipping} />
              )}
            </dd>
            {!freeShippingReached && (
              <dd className={classes.shippingHint}>
                Free shipping over <Price price={FREE_SHIPPING_OVER} />
              </dd>
            )}

            {cart.promo && (
              <>
                <dt className={classes.promoLabel}>Promo {cart.promo.code}</dt>
                <dd className={classes.discount}>−<Price price={cart.discount} /></dd>
              </>
            )}

            <dt className={classes.totalLabel}>Total</dt>
            <dd className={classes.total}><Price price={cart.total} /></dd>
          </dl>

          <button type="submit" className={classes.submitBtn} disabled={isSubmitting || cart.items.length === 0}>
            Place order
          </button>
        </aside>
      </form>
    </div>
  );
}
