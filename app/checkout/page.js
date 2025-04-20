"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "@/Context/Context";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/Context/CartProvider";

const Checkout = () => {
  const router = useRouter();
  const { user } = useContext(Context);
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    description: "",
  });

  // Calculate total price
  const totalPrice = cartItems?.reduce(
    (total, cart) =>
      total +
      cart?.items?.reduce(
        (total, item) => total + item?.price * item?.quantity,
        0
      ),
    0
  );

  useEffect(() => {
    if (!user?.data) {
      router.push("/loginpage");
    }
  }, [user, router]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!user?.data) {
        setError("Please login to continue");
        return;
      }

      if (cartItems.length === 0) {
        setError("Your cart is empty");
        return;
      }

      const formData = new FormData(e.target);
      const orderData = {
        userId: user.data._id,
        items: cartItems.flatMap(cart => 
          cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            image: item.image,
            price: item.price,
            name: item.name
          }))
        ),
        totalPrice: totalPrice,
        customer: {
          fullName: formData.get("fullName"),
          phoneNumber: formData.get("phoneNumber"),
          description: formData.get("description")
        },
        shippingAddress: formData.get("shippingAddress"),
        status: "pending"
      };

      const response = await axios.post("/api/order", orderData);
      
      if (response.data.status === 200) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${response.data.data._id}`);
        }, 2000);
      } else {
        setError(response.data.error || "Failed to place order");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while placing your order");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.data) {
    return null;
  }

  const shippingCost = 7;
  const totalWithShipping = totalPrice + shippingCost;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              
              {cartItems.length > 0 ? (
                <div className="space-y-6">
                  {cartItems.flatMap(cart => 
                    cart.items.map((item, index) => (
                      <div key={`${cart._id}-${index}`} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-20 h-20">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">{item.price} Dt</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{totalPrice} Dt</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>{shippingCost} Dt</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <span>Total</span>
                      <span>{totalWithShipping} Dt</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Your cart is empty</p>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  Order placed successfully! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                    Shipping Address
                  </label>
                  <textarea
                    name="shippingAddress"
                    id="shippingAddress"
                    rows={3}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550] sm:text-sm"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || cartItems.length === 0}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2f4550] hover:bg-[#243741] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2f4550] ${
                      isLoading || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
