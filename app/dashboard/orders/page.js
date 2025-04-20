"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../TableSkeleton";
import { format } from "date-fns";
import { AdminContext } from "@/Context/AdminProvider";
import { useContext } from "react";
import toast from "react-hot-toast";

const Orders = () => {
  const { totalOrders, setTotalOrders } = useContext(AdminContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (totalOrders !== undefined) {
      setIsLoading(false);
    }
  }, [totalOrders]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = totalOrders?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil((totalOrders?.length || 0) / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/order/${orderId}`, {
        status: newStatus,
      });

      if (response.data.status === 200) {
        // Update the orders list
        const updatedOrders = totalOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setTotalOrders(updatedOrders);
        toast.success("Order status updated successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="w-full p-2 m-2 bg-white rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 p-1 m-2">
          Orders
          <span className="text-sm text-gray-500 font-normal">
            ({totalOrders?.length || 0})
          </span>
        </h1>
      </div>
      <div className="w-full p-2 m-2 bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-800 rounded-lg text-white">
          <div className="font-bold">Order ID</div>
          <div className="font-bold">Date</div>
          <div className="font-bold">Total</div>
          <div className="font-bold">Status</div>
          <div className="font-bold">Actions</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <div
              key={item._id}
              className={`w-full border grid md:grid-cols-5 text-sm gap-4 py-4 px-1 md:p-4 hover:bg-gray-200 transition-all duration-200 ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="text-gray-600 mx-2">{item._id}</div>
              <div className="text-gray-600 mx-2">
                {format(new Date(item.createdAt), "MMM dd, yyyy")}
              </div>
              <div className="text-gray-600 mx-2">{item.total} dt</div>
              <div className="text-gray-600 mx-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-gray-600 mx-2">
                <button
                  onClick={() => window.location.href = `/dashboard/orders/${item._id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
              </div>
              <div className="text-gray-600 mx-2">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <TableSkeleton />
        )}

        <div className="flex justify-center mt-4">
          {pageNumbers.length > 1 &&
            pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-10 w-10 mr-1 flex justify-center items-center border rounded-full ${
                  currentPage === number ? "text-white bg-blue-500" : ""
                }`}
              >
                {number}
              </button>
            ))}
        </div>
      </div>
    </>
  );
};

export default Orders; 