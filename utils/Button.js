"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Button = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = () => {
    setIsLoading(true);
    router.push("/checkout");
  };

  return (
    <button
      disabled={isLoading}
      onClick={handleCheckout}
      className={`flex w-full items-center justify-center rounded-md border border-transparent bg-[#2f4550] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#243741] ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Préparation..." : "Valider la commande"}
    </button>
  );
};

export default Button;
