"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
};

const STORAGE_KEY = "sbstore-compare-items";

const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCompareItems(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Failed to restore compare items", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems, isHydrated]);

  const toggleCompareItem = (product) => {
    if (!product?._id) return;

    setCompareItems((current) => {
      const exists = current.some((item) => item._id === product._id);
      if (exists) {
        return current.filter((item) => item._id !== product._id);
      }

      const normalized = {
        _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        vendorName: product.vendorName || product.vendorId?.name || "S&B Store",
        vendorSlug: product.vendorSlug || product.vendorId?.slug || "sb-store",
        description: product.description,
        mainImage: product.mainImage,
        size: product.size || [],
      };

      return [...current.slice(-3), normalized];
    });
  };

  const clearCompare = () => setCompareItems([]);

  const isInCompare = (productId) =>
    compareItems.some((item) => String(item._id) === String(productId));

  const value = useMemo(
    () => ({
      compareItems,
      compareCount: compareItems.length,
      toggleCompareItem,
      clearCompare,
      isInCompare,
    }),
    [compareItems]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export default CompareProvider;
