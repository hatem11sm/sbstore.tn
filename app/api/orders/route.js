import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  await connectDB();
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      status: 200,
      message: "success",
      data: orders,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
};

export const PUT = async (req) => {
  await connectDB();
  try {
    const { orderId, status } = await req.json();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({
        status: 404,
        message: "Order not found",
      });
    }

    return NextResponse.json({
      status: 200,
      message: "success",
      data: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}; 