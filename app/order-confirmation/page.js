"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const OrderConfirmation = () => {
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId") || params.get("id");
    const number = params.get("orderNumber");
    const method = params.get("paymentMethod") || "cash_on_delivery";
    setOrderId(id);
    setOrderNumber(number);
    setPaymentMethod(method);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2f4550]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm shadow-black/5">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-gray-900">
              Commande validée avec succès
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Merci pour votre commande. L’equipe SB Store va verifier les
              détails et vous contacter pour confirmer la livraison.
            </p>

            <div className="mt-5 px-4">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-[#2f4550]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-gray-700">
                      Numéro de commande :{" "}
                      <span className="font-medium text-black">
                        {orderNumber || orderId || "en cours"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 px-4">
              <div className="rounded-md bg-[#f7f4ef] p-4 text-sm text-gray-700">
                Mode de paiement :{" "}
                <span className="font-medium text-black">
                  {paymentMethod === "online"
                    ? "Paiement en ligne"
                    : "Paiement à la livraison"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/"
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2f4550] hover:bg-[#243741]"
              >
                Retour à l’accueil
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Continuer vos achats
              </Link>
            </div>

            <div className="mt-10">
              <h4 className="text-sm font-medium text-gray-900">
                Prochaines étapes
              </h4>
              <ul className="mt-2 divide-y divide-gray-200 text-sm text-gray-500 text-left">
                <li className="py-3 flex items-start">
                  <svg
                    className="h-5 w-5 text-[#2f4550] mr-2 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                  Nous vérifions la disponibilité des articles commandés.
                </li>
                <li className="py-3 flex items-start">
                  <svg
                    className="h-5 w-5 text-[#2f4550] mr-2 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                  {paymentMethod === "online"
                    ? "Un email de confirmation vous sera envoyé et le paiement pourra être confirmé dès que la passerelle sera branchée."
                    : "Notre équipe vous contacte pour confirmer l’adresse, la livraison et le paiement à la réception."}
                </li>
                <li className="py-3 flex items-start">
                  <svg
                    className="h-5 w-5 text-[#2f4550] mr-2 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                  La commande est préparée après confirmation finale.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
