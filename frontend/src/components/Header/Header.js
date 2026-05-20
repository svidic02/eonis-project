import React from "react";
import classes from "./header.module.css";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.titleWrapper}>
          <Link to="/" className={classes.title}>
            Footprint<span className={classes.brandDot}>.</span>
          </Link>
        </div>
        <div className={classes.optionsWrapper}>
          <nav>
            <ul>
              {user && user.isAdmin ? (
                <>
                  <li>
                    <Link to={"/users"}>Users</Link>
                  </li>
                  <li>
                    <Link to={"/products"}>Products</Link>
                  </li>
                  <li>
                    <Link to={"/tags"}>Tags</Link>
                  </li>
                  <li>
                    <Link to={"/colors"}>Colors</Link>
                  </li>
                  <li>
                    <Link to={"/brands"}>Brands</Link>
                  </li>
                  <li>
                    <Link to={"/orders"}>Orders</Link>
                  </li>
                  <li className={classes.menu_container}>
                    <Link to="/profile">{user.name}</Link>
                    {/* <div className={classes.menu}>
                      <Link to="/profile">Profile</Link>
                      <Link to="/orders">Orders</Link>
                    </div> */}
                  </li>
                  <li>
                    <a onClick={logout}>Logout</a>
                  </li>
                </>
              ) : user ? (
                <>
                  <li className={classes.menu_container}>
                    <Link to="/profile">{user.name}</Link>
                    <div className={classes.menu}>
                      {/* <Link to="/profile">Profile</Link> */}
                      <a onClick={logout}>Logout</a>
                    </div>
                  </li>
                  <li>
                    <Link to="/cart">
                      Cart
                      {cart.totalCount > 0 && (
                        <span className={classes.cart_count}>{cart.totalCount}</span>
                      )}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
