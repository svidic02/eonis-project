import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { SHIPPING_FEE, FREE_SHIPPING_OVER } from "../constants/shipping";
import { validatePromo } from "../services/promoService";
import { getById } from "../services/productService";

const CartContext = createContext(null);
const CART_KEY = "cart";
const EMPTY_CART = {
  items: [],
  promo: null,
};

const lineKey = (item) =>
  `${item.product.id}::${item.selectedColor}::${item.selectedSize}`;

const findVariant = (item) => {
  const variants = item.product?.variants ?? [];
  return (
    variants.find((v) => v.sku === item.sku) ||
    variants.find(
      (v) => v.color === item.selectedColor && Number(v.size) === Number(item.selectedSize)
    ) ||
    null
  );
};

const getLineStock = (item) => findVariant(item)?.stock ?? 0;

const computeDiscount = (promo, subtotal) => {
  if (!promo) return 0;
  if (subtotal < (promo.minSubtotal ?? 0)) return 0;
  const raw = promo.type === "PERCENT" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(raw, subtotal);
};

const computeShipping = (subtotal) =>
  subtotal <= 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

export default function CartProvider({ children }) {
  const initCart = getCartFromLocalStorage();
  const [cartItems, setCartItems] = useState(initCart.items);
  const [promo, setPromo] = useState(initCart.promo);
  const refreshedRef = useRef(false);
  const lastPromoCheckRef = useRef({ code: null, dropped: false });

  const subtotal = sum(cartItems.map((item) => item.price));
  const totalCount = sum(cartItems.map((item) => item.quantity));
  const discount = computeDiscount(promo, subtotal);
  const shipping = computeShipping(subtotal);
  const total = Math.max(0, subtotal + shipping - discount);

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({ items: cartItems, promo })
    );
  }, [cartItems, promo]);

  // Auto-drop a promo whose minSubtotal is no longer satisfied. Toasts once per drop.
  useEffect(() => {
    if (!promo) {
      lastPromoCheckRef.current = { code: null, dropped: false };
      return;
    }
    if (subtotal < (promo.minSubtotal ?? 0)) {
      const code = promo.code;
      setPromo(null);
      if (lastPromoCheckRef.current.code !== code || !lastPromoCheckRef.current.dropped) {
        toast.info(`Promo ${code} removed — needs a subtotal of at least ${promo.minSubtotal} RSD.`);
        lastPromoCheckRef.current = { code, dropped: true };
      }
    }
  }, [subtotal, promo]);

  // Once on mount, refresh each line against current server state:
  // - drop lines whose product or variant no longer exists
  // - replace product snapshot (catches price changes)
  // - clamp quantity down to current variant stock
  // Also revalidate any stored promo against the new subtotal.
  useEffect(() => {
    if (refreshedRef.current) return;
    refreshedRef.current = true;
    if (cartItems.length === 0) {
      // Promo on empty cart can't apply — drop silently.
      if (promo) setPromo(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const refreshed = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const fresh = await getById(item.product.id);
            if (!fresh) return { item, change: "removed" };
            const variant =
              (fresh.variants ?? []).find((v) => v.sku === item.sku) ||
              (fresh.variants ?? []).find(
                (v) =>
                  v.color === item.selectedColor &&
                  Number(v.size) === Number(item.selectedSize)
              );
            if (!variant || (variant.stock ?? 0) <= 0) return { item, change: "removed" };
            const newQty = Math.min(item.quantity, variant.stock);
            const priceChanged = fresh.price !== item.product.price;
            const qtyClamped = newQty !== item.quantity;
            return {
              item: {
                ...item,
                product: fresh,
                sku: variant.sku,
                quantity: newQty,
                price: fresh.price * newQty,
              },
              change: priceChanged ? "priced" : qtyClamped ? "clamped" : "ok",
            };
          } catch {
            return { item, change: "ok" }; // network glitch — keep as-is
          }
        })
      );
      if (cancelled) return;

      const kept = refreshed.filter((r) => r.change !== "removed").map((r) => r.item);
      const removed = refreshed.filter((r) => r.change === "removed").length;
      const repriced = refreshed.filter((r) => r.change === "priced").length;
      const clamped = refreshed.filter((r) => r.change === "clamped").length;

      if (removed || repriced || clamped) {
        setCartItems(kept);
        const parts = [];
        if (removed) parts.push(`${removed} item${removed === 1 ? "" : "s"} no longer available`);
        if (repriced) parts.push("prices updated");
        if (clamped) parts.push("quantities adjusted");
        toast.info(`Cart refreshed: ${parts.join(", ")}.`);
      }

      if (promo) {
        const newSubtotal = sum(kept.map((it) => it.price));
        validatePromo({ code: promo.code, subtotal: newSubtotal })
          .then((p) => setPromo(p))
          .catch(() => setPromo(null));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCartFromLocalStorage() {
    const storedCart = localStorage.getItem(CART_KEY);
    if (!storedCart) return EMPTY_CART;
    const parsed = JSON.parse(storedCart);
    const items = (parsed.items ?? []).filter(
      (i) => i.product && i.selectedColor && i.selectedSize != null
    );
    return { items, promo: parsed.promo ?? null };
  }

  function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  }

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => lineKey(item) !== key));
  };

  const changeQuantity = (key, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (lineKey(item) !== key) return item;
        const stock = getLineStock(item);
        const clamped = Math.max(1, Math.min(newQuantity, stock || 1));
        return { ...item, quantity: clamped, price: item.product.price * clamped };
      })
    );
  };

  const addToCart = (product, selectedColor, selectedSize, sku) => {
    const newItem = { product, selectedColor, selectedSize, sku, quantity: 1, price: product.price };
    const stock = getLineStock(newItem);
    if (stock <= 0) return;
    const key = lineKey(newItem);
    setCartItems((prev) => {
      const existing = prev.find((item) => lineKey(item) === key);
      if (existing) {
        if (existing.quantity >= stock) return prev;
        const next = existing.quantity + 1;
        return prev.map((item) =>
          lineKey(item) === key
            ? { ...item, quantity: next, price: product.price * next }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    setCartItems([]);
    setPromo(null);
  };

  const applyPromo = async (code) => {
    const trimmed = (code || "").trim().toUpperCase();
    if (!trimmed) throw new Error("Enter a code");
    if (cartItems.length === 0) throw new Error("Add items to your cart first");
    const result = await validatePromo({ code: trimmed, subtotal });
    setPromo(result);
    return result;
  };

  const clearPromo = () => setPromo(null);

  return (
    <CartContext.Provider
      value={{
        cart: {
          items: cartItems,
          totalCount,
          subtotal,
          shipping,
          discount,
          total,
          totalPrice: total,
          promo,
        },
        removeFromCart,
        changeQuantity,
        addToCart,
        clearCart,
        lineKey,
        getLineStock,
        applyPromo,
        clearPromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
