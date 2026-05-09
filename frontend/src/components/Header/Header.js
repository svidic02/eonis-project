import React from "react";
import classes from "./header.module.css";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
// import Theme from "../../Theme/Theme";

export default function Header({ toggle }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.titleWrapper}>
          <Link to="/" className={classes.title}>
            PurePlate
          </Link>
        </div>
        <div className={classes.themeWrapper}>{toggle}</div>
        <div className={classes.imgWrapper}>
          <img
            className={classes.logoImg}
            src="basics/logo.png"
            alt="logo"
            onError={() => console.log("Image failed to load")}
          />
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
                    <Link to={"/meals"}>Meals</Link>
                  </li>
                  <li>
                    <Link to={"/tags"}>Tags</Link>
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
