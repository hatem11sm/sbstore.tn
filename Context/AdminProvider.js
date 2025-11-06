"use client";

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Context } from "./Context";
import { useContext } from "react";

export const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const { user } = useContext(Context);
  const [totalUser, setTotalUser] = useState([]);
  const [totalProduct, setTotalProduct] = useState([]);
  const [totalOrders, setTotalOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user === undefined) {
        return;
      }

      if (!user?.data?.isAdmin) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [usersResponse, productsResponse, ordersResponse] = await Promise.all([
          axios.get("/api/alluser").catch(err => ({ data: { data: [] } })),
          axios.get("/api/allproducts").catch(err => ({ data: { data: [] } })),
          axios.get("/api/orders").catch(err => ({ data: { data: [] } }))
        ]);

        setTotalUser(usersResponse.data.data || []);
        setTotalProduct(productsResponse.data.data || []);
        setTotalOrders(ordersResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <AdminContext.Provider 
      value={{ 
        totalUser, 
        totalProduct, 
        totalOrders,
        setTotalUser,
        setTotalProduct,
        setTotalOrders,
        isLoading,
        error
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
