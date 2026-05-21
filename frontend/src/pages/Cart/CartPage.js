import React, { useState } from "react";
import classes from "./cartPage.module.css";
import { useCart } from "../../hooks/useCart";
import Title from "../../components/Title/Title";
import { Link, useNavigate } from "react-router-dom";
import Price from "../../components/Price/Price";
import NotFound from "../../components/NotFound/NotFound";
import ConfirmationDialog from "../../components/ConfirmationDialog/ConfirmationDialog";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { FREE_SHIPPING_OVER } from "../../constants/shipping";

export default function CartPage() {
  useDocumentTitle("Footprint · Cart");
  const { cart, removeFromCart, changeQuantity, clearCart, lineKey, getLineStock, applyPromo, clearPromo } = useCart();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [promoErr, setPromoErr] = useState("");
  const [applying, setApplying] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const PROMO_RE = /^[A-Z0-9_]{1,30}$/i;
  const codeFormatValid = code === "" || PROMO_RE.test(code.trim());
  const canApply = code.trim() !== "" && PROMO_RE.test(code.trim());

  const onApply = async (e) => {
    e.preventDefault();
    setPromoErr("");
    setApplying(true);
    try {
      await applyPromo(code);
      setCode("");
    } catch (err) {
      setPromoErr(err?.response?.data || err?.message || "Invalid code");
    } finally {
      setApplying(false);
    }
  };

  const freeShippingReached = cart.subtotal >= FREE_SHIPPING_OVER;

  return (
    <div className={classes.page}>
      <Title title="Cart Page" margin="0 0 1rem 0" />
      {cart.items.length === 0 ? (
        <NotFound message="Cart is empty" />
      ) : (
        <div className={classes.container}>
          <ul className={classes.list}>
            {cart.items.map((item) => {
              const key = lineKey(item);
              const stock = getLineStock(item);
              const max = Math.max(1, stock);
              return (
                <li key={key}>
                  <div>
                    <img src={`${item.product.imageUrl}`} alt={item.product.name} />
                  </div>
                  <div>
                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                    <div className={classes.variant}>
                      {item.selectedColor} · Size {item.selectedSize}
                    </div>
                  </div>
                  <div>
                    <select
                      value={item.quantity}
                      onChange={(e) => changeQuantity(key, Number(e.target.value))}
                    >
                      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Price price={item.price} />
                  </div>
                  <div>
                    <button
                      className={classes.remove_button}
                      onClick={() => removeFromCart(key)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={classes.checkout}>
            <form className={classes.promo} onSubmit={onApply}>
              <label htmlFor="promo-code">Promo code</label>
              <div className={classes.promoRow}>
                <input
                  id="promo-code"
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setPromoErr(""); }}
                  placeholder="e.g. WELCOME10"
                  disabled={applying}
                />
                <button type="submit" disabled={applying || !canApply}>Apply</button>
              </div>
              {!codeFormatValid && (
                <div className={classes.promoErr}>Letters, numbers, and underscores only.</div>
              )}
              {promoErr && <div className={classes.promoErr}>{promoErr}</div>}
            </form>

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
                  <dt className={classes.promoLabel}>
                    Promo {cart.promo.code}
                    <button
                      type="button"
                      className={classes.promoClear}
                      aria-label="Remove promo"
                      onClick={clearPromo}
                    >×</button>
                  </dt>
                  <dd className={classes.discount}>
                    −<Price price={cart.discount} />
                  </dd>
                </>
              )}

              <dt className={classes.totalLabel}>Total</dt>
              <dd className={classes.total}><Price price={cart.total} /></dd>
            </dl>

            <button
              className={classes.clearCart}
              onClick={() => setShowClearDialog(true)}
            >
              Clear cart
            </button>
            <Link to="/" className={classes.continueShopping}>← Continue shopping</Link>
            <Link to="/checkout">Proceed to checkout</Link>
          </div>
        </div>
      )}
      {showClearDialog && (
        <ConfirmationDialog
          msg="Clear your cart? This will remove all items and any applied promo."
          info={{ name: `${cart.totalCount} item${cart.totalCount === 1 ? "" : "s"}` }}
          confirmLabel="Clear cart"
          onConfirm={() => {
            clearCart();
            setShowClearDialog(false);
            navigate("/");
          }}
          onCancel={() => setShowClearDialog(false)}
        />
      )}
    </div>
  );
}
