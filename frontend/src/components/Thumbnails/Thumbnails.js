import React from "react";
import classes from "./thumbnails.module.css";
import { Link } from "react-router-dom";
import Price from "../Price/Price";
import { genderLabel } from "../../constants/productEnums";
import PropTypes from "prop-types";

const LOW_STOCK = 5;

export default function Thumbnails({ products }) {
  return (
    <ul className={classes.list}>
      {products.map((product) => {
        const totalStock = (product.variants ?? []).reduce(
          (s, v) => s + (v.stock ?? 0),
          0,
        );
        const out = totalStock === 0;
        const low = !out && totalStock < LOW_STOCK;
        return (
          <li key={product.id}>
            <Link to={`/product/${product.id}`}>
              <img
                className={classes.image}
                src={`${product.imageUrl}`}
                alt={product.name}
                onError={() => console.log("Image failed to load")}
              />
              <div className={classes.content}>
                {product.brand && (
                  <div className={classes.brand}>{product.brand}</div>
                )}
                <div className={classes.name}>{product.name}</div>
                <div className={classes.meta}>
                  {product.category && <span>{product.category}</span>}
                  {product.gender && (
                    <>
                      <span className={classes.dot}>·</span>
                      <span>{genderLabel(product.gender)}</span>
                    </>
                  )}
                </div>
                <div className={classes.priceRow}>
                  <span className={classes.price}>
                    <Price price={product.price} />
                  </span>
                  {out && <span className={classes.badgeOut}>Out of stock</span>}
                  {low && <span className={classes.badgeLow}>Low stock</span>}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

Thumbnails.propTypes = {
  products: PropTypes.array.isRequired,
};
