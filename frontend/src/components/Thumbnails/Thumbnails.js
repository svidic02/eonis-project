import React from "react";
import classes from "./thumbnails.module.css";
import { Link } from "react-router-dom";
import Price from "../Price/Price";
import PropTypes from 'prop-types';

export default function Thumbnails({ products }) {

  return (
    <ul className={classes.list}>
      {products.map((product) => (
        <li key={product.id}>
          <Link to={`/product/${product.id}`}>
            <img
              className={classes.image}
              src={`${product.imageUrl}`}
              alt={product.name}
              onError={() => console.log("Image failed to load")}
            />
            <div className={classes.content}>
              <div className={classes.name}>{product.name}</div>
              <div className={classes.price}>
                <Price price={product.price} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

Thumbnails.propTypes = {
  products: PropTypes.array.isRequired,
};
