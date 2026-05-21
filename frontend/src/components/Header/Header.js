import React from "react";
import classes from "./header.module.css";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const Icon = {
  Users: () => (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Catalog: () => (
    <svg {...iconProps}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Orders: () => (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  Cart: () => (
    <svg {...iconProps}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Logout: () => (
    <svg {...iconProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Chevron: () => (
    <svg {...iconProps} width={14} height={14}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className={`${classes.header} ${user?.isAdmin ? classes.adminHeader : ""}`}>
      <div className={classes.container}>
        <div className={classes.titleWrapper}>
          <Link to="/" className={classes.title}>
            Footprint<span className={classes.brandDot}>.</span>
            {user?.isAdmin && <span className={classes.adminBadge}>Admin</span>}
          </Link>
        </div>
        <div className={classes.optionsWrapper}>
          <nav>
            <ul>
              {user && user.isAdmin ? (
                <>
                  <li>
                    <Link to="/users" className={classes.navLink}>
                      <Icon.Users /> Users
                    </Link>
                  </li>
                  <li className={classes.menu_container}>
                    <span className={`${classes.navLink} ${classes.dropdownTrigger}`}>
                      <Icon.Catalog /> Catalog <Icon.Chevron />
                    </span>
                    <div className={classes.menu}>
                      <Link to="/products">Products</Link>
                      <Link to="/tags">Tags</Link>
                      <Link to="/colors">Colors</Link>
                      <Link to="/brands">Brands</Link>
                      <Link to="/promos">Promos</Link>
                    </div>
                  </li>
                  <li>
                    <Link to="/orders" className={classes.navLink}>
                      <Icon.Orders /> Orders
                    </Link>
                  </li>
                  <li className={classes.menu_container}>
                    <Link to="/profile" className={classes.navLink}>{user.name}</Link>
                    <div className={classes.menu}>
                      <a onClick={logout}>
                        <Icon.Logout /> Logout
                      </a>
                    </div>
                  </li>
                </>
              ) : user ? (
                <>
                  <li className={classes.menu_container}>
                    <Link to="/profile" className={classes.navLink}>{user.name}</Link>
                    <div className={classes.menu}>
                      <a onClick={logout}>
                        <Icon.Logout /> Logout
                      </a>
                    </div>
                  </li>
                  <li>
                    <Link to="/cart" className={classes.navLink}>
                      <Icon.Cart /> Cart
                      {cart.totalCount > 0 && (
                        <span className={classes.cart_count}>{cart.totalCount}</span>
                      )}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={classes.navLink}>Login</Link>
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
