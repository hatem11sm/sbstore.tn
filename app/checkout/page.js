"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "@/Context/Context";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useContext(Context);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    description: "",
  });

  // Calculate total price
  const totalPrice = cartItems?.reduce(
    (total, item) =>
      total +
      item?.items?.reduce(
        (total, item) => total + item?.price * item?.quantity,
        0
      ),
    0
  );

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!user?.data?._id) {
          return;
        }

        setIsLoading(true);
        const res = await axios.post("/api/cart-item", {
          userId: user?.data?._id,
        });

        setCartItems(res?.data?.cartItem || []);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        setError("Failed to load cart items. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.data) {
      setError("Please login to continue");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios.post("/api/checkout", formData);

      if (response.data.status === 200) {
        setSuccess("Order placed successfully!");
        // Redirect to success page or order confirmation
        setTimeout(() => {
          router.push(`/order-confirmation?id=${response.data.orderId}`);
        }, 1500);
      } else {
        setError(response.data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error.response?.data?.error || "An error occurred during checkout"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/loginpage");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2f4550]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl text-center mb-10">
            Checkout
          </h1>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Cart items */}
            <div>
              <div className="border-t border-b border-gray-200 py-6 px-4 sm:px-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>

                <ul className="mt-6 divide-y divide-gray-200">
                  {cartItems.length > 0 ? (
                    cartItems.map((cart) => (
                      <React.Fragment key={cart._id}>
                        {cart.items.map((item) => (
                          <li key={item._id} className="flex py-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={100}
                                height={100}
                                className="h-full w-full object-contain object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  <p className="ml-4">{item.price} Dt</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  Size: {item.size}
                                </p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <p className="text-gray-500">
                                  Qty {item.quantity}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-gray-500">Your cart is empty</p>
                      <Link
                        href="/products"
                        className="mt-2 inline-block text-[#2f4550] font-medium hover:text-[#243741]"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  )}
                </ul>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{totalPrice}.00 Dt</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Shipping</p>
                    <p>7.00 Dt</p>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <p>Total</p>
                    <p>{totalPrice + 7}.00 Dt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout form */}
            <div className="mt-10 lg:mt-0">
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550]"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550]"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Shipping Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550]"
                      required
                    ></textarea>
                  </div>

                  {/* Description (Optional) */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550]"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className={`w-full bg-[#2f4550] border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-[#243741] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2f4550] ${
                      isSubmitting || cartItems.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-center text-sm text-gray-500">
                    By placing this order, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-[#2f4550] font-medium hover:text-[#243741]"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#2f4550] font-medium hover:text-[#243741]"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
