"use client";

import axios from "axios";
import { createContext, useEffect, useMemo, useState } from "react";
import { Context } from "./Context";
import { useContext } from "react";

export const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const { user } = useContext(Context);
  const [totalUser, setTotalUser] = useState([]);
  const [totalProduct, setTotalProduct] = useState([]);
  const [totalOrders, setTotalOrders] = useState([]);
  const [totalVendors, setTotalVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = user?.data || null;
  const isAdminView = Boolean(currentUser?.isAdmin || currentUser?.role === "admin");
  const isVendorView = currentUser?.role === "vendor";
  const scopedVendor = currentUser?.vendorId || null;

  useEffect(() => {
    const fetchData = async () => {
      if (user === undefined) {
        return;
      }

      if (!isAdminView && !isVendorView) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const requests = [
          axios.get("/api/allproducts").catch(() => ({ data: { data: [] } })),
          axios.get("/api/orders").catch(() => ({ data: { data: [] } })),
          axios.get("/api/vendors").catch(() => ({ data: { data: [] } })),
        ];

        if (isAdminView) {
          requests.unshift(
            axios.get("/api/alluser").catch(() => ({ data: { data: [] } }))
          );
        }

        const responses = await Promise.all(requests);

        const [
          usersResponse,
          productsResponse,
          ordersResponse,
          vendorsResponse,
        ] = isAdminView
          ? responses
          : [{ data: { data: [] } }, ...responses];

        setTotalUser(usersResponse.data.data || []);
        setTotalProduct(productsResponse.data.data || []);
        setTotalOrders(ordersResponse.data.data || []);
        setTotalVendors(vendorsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAdminView, isVendorView]);

  const vendorAccounts = useMemo(() => {
    if (!Array.isArray(totalUser)) return [];
    return totalUser.filter((item) => item.role === "vendor");
  }, [totalUser]);

  return (
    <AdminContext.Provider 
      value={{ 
        totalUser, 
        totalProduct, 
        totalOrders,
        totalVendors,
        setTotalUser,
        setTotalProduct,
        setTotalOrders,
        setTotalVendors,
        isLoading,
        error,
        currentUser,
        isAdminView,
        isVendorView,
        scopedVendor,
        vendorAccounts,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
