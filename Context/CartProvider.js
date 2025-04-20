"use client";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { Context } from "./Context";
import toast from "react-hot-toast";

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

const CartProvider = ({ children }) => {
  const { user } = useContext(Context);
  const [cartdetails, setCartDetails] = useState({
    quantity: 1,
    size: "Medium",
  });
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!user?.data?._id) return;
        const response = await axios.post("/api/cart-item", {
          userId: user.data._id,
        });
        setCartItems(response.data.cartItem || []);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

    fetchCartItems();
  }, [user]);

  // add item to cart
  const addItemToCart = async (e) => {
    try {
      const res = await axios.post("/api/cart", {
        userId: user?.data?._id,
        items: [
          {
            productId: e._id,
            image: e.mainImage,
            price: e.price,
            name: e.name,
            quantity: cartdetails.quantity,
            size: cartdetails.size,
          },
        ],
      });

      toast.success(res?.data?.message);
      setCartDetails({
        quantity: 1,
        size: "Medium",
      });
      // Refresh cart items
      const response = await axios.post("/api/cart-item", {
        userId: user?.data?._id,
      });
      setCartItems(response.data.cartItem || []);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
    }
  };

  // clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartdetails,
        setCartDetails,
        addItemToCart,
        cartItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
