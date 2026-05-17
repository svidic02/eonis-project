import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const CART_KEY = "cart";
const EMPTY_CART = {
  items: [],
  totalCount: 0,
  totalPrice: 0,
};

const lineKey = (item) =>
  `${item.product.id}::${item.selectedColor}::${item.selectedSize}`;

export default function CartProvider({ children }) {
  const initCart = getCartFromLocalStorage();
  const [cartItems, setCartItems] = useState(initCart.items);
  const [totalPrice, setTotalPrice] = useState(initCart.totalPrice);
  const [totalCount, setTotalCount] = useState(initCart.totalCount);

  useEffect(() => {
    const totalPrice = sum(cartItems.map((item) => item.price));
    const totalCount = sum(cartItems.map((item) => item.quantity));
    setTotalPrice(totalPrice);
    setTotalCount(totalCount);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify({
        items: cartItems,
        totalPrice,
        totalCount,
      })
    );
  }, [cartItems]);

  function getCartFromLocalStorage() {
    const storedCart = localStorage.getItem(CART_KEY);
    if (!storedCart) return EMPTY_CART;
    const parsed = JSON.parse(storedCart);
    // Drop legacy lines without variant info (Phase 1 cart shape).
    const items = (parsed.items ?? []).filter(
      (i) => i.product && i.selectedColor && i.selectedSize != null
    );
    return { ...parsed, items };
  }

  const sum = (items) => {
    return items.reduce((prevValue, curValue) => prevValue + curValue, 0);
  };

  const removeFromCart = (key) => {
    setCartItems(cartItems.filter((item) => lineKey(item) !== key));
  };

  const changeQuantity = (key, newQuantity) => {
    setCartItems(
      cartItems.map((item) =>
        lineKey(item) === key
          ? { ...item, quantity: newQuantity, price: item.product.price * newQuantity }
          : item
      )
    );
  };

  const addToCart = (product, selectedColor, selectedSize, sku) => {
    const newItem = { product, selectedColor, selectedSize, sku, quantity: 1, price: product.price };
    const key = lineKey(newItem);
    const existing = cartItems.find((item) => lineKey(item) === key);
    if (existing) {
      changeQuantity(key, existing.quantity + 1);
    } else {
      setCartItems([...cartItems, newItem]);
    }
  };

  const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    const { items, totalPrice, totalCount } = EMPTY_CART;
    setCartItems(items);
    setTotalCount(totalCount);
    setTotalPrice(totalPrice);
  };

  return (
    <CartContext.Provider
      value={{
        cart: { items: cartItems, totalCount, totalPrice },
        removeFromCart,
        changeQuantity,
        addToCart,
        clearCart,
        lineKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
