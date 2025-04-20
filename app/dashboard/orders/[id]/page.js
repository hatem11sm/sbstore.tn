"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { format } from "date-fns";

const OrderDetails = ({ params }) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${params.id}`);
        setOrder(data.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2f4550]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Order Information</h2>
            <p><span className="font-medium">Order ID:</span> {order._id}</p>
            <p><span className="font-medium">Date:</span> {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</p>
            <p><span className="font-medium">Status:</span> <span className="capitalize">{order.status}</span></p>
            <p><span className="font-medium">Total:</span> {order.total} Dt</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
            <p><span className="font-medium">Name:</span> {order.customer.fullName}</p>
            <p><span className="font-medium">Phone:</span> {order.customer.phoneNumber}</p>
            <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
            {order.customer.description && (
              <p><span className="font-medium">Notes:</span> {order.customer.description}</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center border-b pb-4">
                <div className="w-24 h-24 relative mr-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">Size: {item.size}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: {item.price} Dt</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Total: {item.price * item.quantity} Dt</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Order Total</span>
            <span className="text-xl font-bold">{order.total} Dt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 