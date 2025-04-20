import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
  await connectDB();
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({
        status: 400,
        error: "Status is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({
        status: 404,
        error: "Order not found",
      });
    }

    return NextResponse.json({
      status: 200,
      data: order,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Failed to update order",
    });
  }
}; 