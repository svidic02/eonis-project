import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Price from "../../components/Price/Price";
import Tags from "../../components/Tags/Tags";
import VariantSelector from "../../components/VariantSelector/VariantSelector";
import { getById } from "../../services/productService";
import { getAllColorsAdmin } from "../../services/colorService";
import classes from "./productPage.module.css";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import NotFound from "../../components/NotFound/NotFound";

export default function ProductPage() {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [colorMap, setColorMap] = useState({});
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  useDocumentTitle(product ? `Footprint · ${product.name}` : "Footprint");

  useEffect(() => {
    getById(id).then(setProduct);
    getAllColorsAdmin()
      .then((cs) => setColorMap(Object.fromEntries(cs.map((c) => [c.name, c.hex]))))
      .catch(() => {});
  }, [id]);

  const inCart = selectedVariant
    ? cart.items.find((it) => it.sku === selectedVariant.sku)?.quantity ?? 0
    : 0;
  const remaining = selectedVariant ? selectedVariant.stock - inCart : 0;
  const maxedOut = selectedVariant && remaining <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || maxedOut || isAdmin) return;
    addToCart(
      product,
      selectedVariant.color,
      selectedVariant.size,
      selectedVariant.sku
    );
    toast.success(`${product.name} (${selectedVariant.color} · ${selectedVariant.size}) added to cart.`);
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

        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
          <div className={classes.stockHint}>
            Only {selectedVariant.stock} left in stock
            {inCart > 0 && ` · ${inCart} already in your cart`}
          </div>
        )}

        <div className={classes.price}>
          <Price price={product.price} />
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || maxedOut || isAdmin}
          title={
            isAdmin
              ? "Admins can't shop — sign in as a customer to buy"
              : !selectedVariant
              ? "Select color and size first"
              : maxedOut
              ? "You already have the maximum available in your cart"
              : "Add to cart"
          }
        >
          {isAdmin ? "Admins can't add to cart" : maxedOut ? "Max in cart" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}
