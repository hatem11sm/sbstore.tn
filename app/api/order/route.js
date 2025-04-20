import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  await connectDB();
  try {
    const body = await req.json();
    const {
      userId,
      items,
      totalPrice,
      customer,
      shippingAddress,
      status,
    } = body;

    if (!userId || !items || !totalPrice || !customer || !shippingAddress) {
      return NextResponse.json({
        status: 400,
        error: "Missing required fields",
      });
    }

    // Transform the data to match the Order schema
    const orderData = {
      userId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        price: item.price,
        name: item.name
      })),
      total: totalPrice,
      customer: {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        address: shippingAddress,
        description: customer.description || ""
      },
      shippingAddress,
      status: status || "pending"
    };

    const order = new Order(orderData);
    await order.save();

    return NextResponse.json({
      status: 200,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Failed to create order",
    });
  }
}; 