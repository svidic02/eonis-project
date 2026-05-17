import React from "react";
import classes from "./cartPage.module.css";
import { useCart } from "../../hooks/useCart";
import Title from "../../components/Title/Title";
import { Link, useNavigate } from "react-router-dom";
import Price from "../../components/Price/Price";
import NotFound from "../../components/NotFound/NotFound";

export default function CartPage() {
  const { cart, removeFromCart, changeQuantity, clearCart, lineKey } = useCart();
  const navigate = useNavigate();
  return (
    <>
      <Title title="Cart Page" margin="1.5rem 0 0 2.5rem" />
      {cart.items.length === 0 ? (
        <NotFound message="Cart is empty" />
      ) : (
        <div className={classes.container}>
          <ul className={classes.list}>
            {cart.items.map((item) => {
              const key = lineKey(item);
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
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                      <option>9</option>
                      <option>10</option>
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
            <div>
              <div className={classes.items_count}>{cart.totalCount}</div>
              <div className={classes.total_price}>
                <Price price={cart.totalPrice} />
              </div>
            </div>
            <button
              className={classes.clearCart}
              onClick={() => {
                clearCart();
                navigate("/");
              }}
            >
              Clear cart
            </button>
            <Link to="/checkout">Procced to checkout</Link>
          </div>
        </div>
      )}
    </>
  );
}
