import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Price from "../../components/Price/Price";
import Tags from "../../components/Tags/Tags";
import VariantSelector from "../../components/VariantSelector/VariantSelector";
import { getById } from "../../services/productService";
import { getAllColorsAdmin } from "../../services/colorService";
import classes from "./productPage.module.css";
import { useCart } from "../../hooks/useCart";
import NotFound from "../../components/NotFound/NotFound";

export default function ProductPage() {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [colorMap, setColorMap] = useState({});
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getById(id).then(setProduct);
    getAllColorsAdmin()
      .then((cs) => setColorMap(Object.fromEntries(cs.map((c) => [c.name, c.hex]))))
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(
      product,
      selectedVariant.color,
      selectedVariant.size,
      selectedVariant.sku
    );
    navigate("/cart");
  };

  if (!product) {
    return (
      <NotFound message="Product not found!" linkText="Back to Home page" />
    );
  }

  return (
    <div className={classes.container}>
      <img
        className={classes.image}
        src={`${product.imageUrl}`}
        alt={product.name}
      />
      <div className={classes.details}>
        <div className={classes.header}>
          <span className={classes.name}>{product.name}</span>
        </div>
        {product.brand && (
          <div className={classes.brand}>{product.brand}</div>
        )}
        {product.description && (
          <p className={classes.description}>{product.description}</p>
        )}

        <div className={classes.tags}>
          {product.tags && (
            <Tags
              tags={product.tags.map((tag) => ({ name: tag }))}
              forProductPage={true}
            />
          )}
        </div>

        <VariantSelector
          variants={product.variants ?? []}
          colorMap={colorMap}
          onChange={setSelectedVariant}
        />

        <div className={classes.price}>
          <Price price={product.price} />
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          title={
            selectedVariant ? "Add to cart" : "Select color and size first"
          }
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}
