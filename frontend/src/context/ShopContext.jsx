import React, { createContext, useState } from "react";
import all_product from "../components/Assets/all_product";

export const ShopContext = createContext(null);

// Initialize default cart state
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < all_product.length; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // Adding items to the cart
  const addToCart = (ItemId) => {
    setCartItems((prev) => ({
      ...prev,
      [ItemId]: prev[ItemId] + 1,
    }));
  };

  // Removing items from the cart
  const removeFromCart = (ItemId) => {
    setCartItems((prev) => ({
      ...prev,
      [ItemId]: prev[ItemId] - 1,
    }));
  };

  // Calculate the total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find((product) => product.id === Number(item));
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // Calculate the total number of items in the cart
  const getTotalCartItems = () => {
    let totalItem = 0;
    for(const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
