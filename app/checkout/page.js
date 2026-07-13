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
  const [promoCode, setPromoCode] = useState("");
  const [promoFeedback, setPromoFeedback] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

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
        setError("Connectez-vous pour continuer");
        return;
      }

      if (cartItems.length === 0) {
        setError("Votre panier est vide");
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
            name: item.name,
            vendorId: item.vendorId || null,
            vendorName: item.vendorName || item.vendorId?.name || "SB Store",
            vendorSlug: item.vendorSlug || item.vendorId?.slug || "sb-store",
          }))
        ),
        customer: {
          fullName: formData.get("fullName"),
          email: user.data.email,
          phoneNumber: formData.get("phoneNumber"),
          description: formData.get("description")
        },
        shippingAddress: formData.get("shippingAddress"),
        status: "pending",
        paymentMethod,
        promoCode: appliedPromo?.code || "",
      };

      const response = await axios.post("/api/order", orderData);
      
      if (response.data.status === 200) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          const createdOrder = response.data.data;
          router.push(
            `/order-confirmation?orderId=${createdOrder._id}&orderNumber=${createdOrder.orderNumber}&paymentMethod=${createdOrder.paymentMethod}`
          );
        }, 2000);
      } else {
        setError(response.data.error || "Impossible de valider la commande");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Une erreur est survenue pendant la validation de la commande"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.data) {
    return null;
  }

  const shippingCost = 7;
  const totalWithShipping = Math.max(0, totalPrice + shippingCost - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoFeedback("Saisissez un code promo");
      setAppliedPromo(null);
      setPromoDiscount(0);
      return;
    }

    try {
      setIsApplyingPromo(true);
      setPromoFeedback("");
      const response = await axios.post("/api/promos/validate", {
        code: promoCode,
        subtotal: totalPrice,
      });

      setAppliedPromo(response.data.data.promo);
      setPromoDiscount(response.data.data.discountAmount);
      setPromoFeedback(response.data.message || "Code promo appliqué");
    } catch (promoError) {
      setAppliedPromo(null);
      setPromoDiscount(0);
      setPromoFeedback(
        promoError.response?.data?.message || "Code promo invalide"
      );
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#16181b] sm:text-4xl">
            Finaliser votre commande
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Vérifiez votre panier, ajoutez vos informations de livraison et
            notre équipe vous contactera pour confirmer la disponibilité.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Email de confirmation :{" "}
            <span className="font-medium text-[#16181b]">{user.data.email}</span>
          </p>
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm shadow-black/5 p-6">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-gray-900">
                Résumé de commande
              </h2>
              
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
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                            {item.vendorName || item.vendorId?.name || "SB Store"}
                          </p>
                          <p className="text-sm text-gray-500">Taille : {item.size}</p>
                          <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">{item.price} Dt</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    {(cartItems.flatMap((cart) => cart.items).length > 0) && (
                      <div className="rounded-xl border border-black/10 bg-[#f7f4ef] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-900">
                          Répartition par boutique
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                          {Object.values(
                            cartItems
                              .flatMap((cart) => cart.items)
                              .reduce((accumulator, item) => {
                                const key = item.vendorSlug || "sb-store";
                                if (!accumulator[key]) {
                                  accumulator[key] = {
                                    vendorName:
                                      item.vendorName ||
                                      item.vendorId?.name ||
                                      "SB Store",
                                    total: 0,
                                  };
                                }
                                accumulator[key].total +=
                                  Number(item.price || 0) *
                                  Number(item.quantity || 0);
                                return accumulator;
                              }, {})
                          ).map((vendor) => (
                            <div
                              key={vendor.vendorName}
                              className="flex items-center justify-between"
                            >
                              <span>{vendor.vendorName}</span>
                              <span>{vendor.total.toFixed(2)} Dt</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span>{totalPrice} Dt</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Livraison</span>
                      <span>{shippingCost} Dt</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Remise</span>
                      <span>-{promoDiscount.toFixed(2)} Dt</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <span>Total</span>
                      <span>{totalWithShipping} Dt</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Votre panier est vide</p>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-white shadow-sm shadow-black/5 p-6">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-gray-900">
                Informations de livraison
              </h2>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  Commande validée avec succès. Redirection...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-black/10 bg-[#f7f4ef] p-4">
                  <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700">
                    Code promo
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      type="text"
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#2f4550] focus:border-[#2f4550] sm:text-sm"
                      placeholder="BIENVENUE10"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                      {isApplyingPromo ? "..." : "Appliquer"}
                    </button>
                  </div>
                  {promoFeedback && (
                    <p className={`mt-2 text-sm ${appliedPromo ? "text-emerald-600" : "text-rose-600"}`}>
                      {promoFeedback}
                    </p>
                  )}
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Mode de paiement
                  </p>
                  <div className="mt-3 space-y-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === "cash_on_delivery"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Paiement à la livraison
                        </p>
                        <p className="text-sm text-gray-500">
                          Le client paie au moment de la réception.
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Paiement en ligne
                        </p>
                        <p className="text-sm text-gray-500">
                          La structure est prête. Il faudra connecter Stripe, Konnect ou une passerelle locale pour encaisser réellement.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Nom complet
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
                    Numéro de téléphone
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
                    Adresse de livraison
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
                    Notes supplémentaires (optionnel)
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
                    {isLoading
                      ? "Validation..."
                      : paymentMethod === "online"
                      ? "Créer la commande et préparer le paiement"
                      : "Confirmer la commande"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
