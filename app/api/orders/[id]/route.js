import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  await connectDB();

  try {
    // Verify admin authentication
    const authToken = cookies().get("authToken")?.value || "";
    if (!authToken) {
      return NextResponse.json({
        status: 401,
        error: "Authentication required",
      });
    }

    const userData = jwt.verify(authToken, process.env.JWT_SECRET);
    
    // Get order with user details
    const order = await Order.findById(params.id)
      .populate("userId", "name email");

    if (!order) {
      return NextResponse.json({
        status: 404,
        error: "Order not found",
      });
    }

    return NextResponse.json({
      status: 200,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({
      status: 500,
      error: "Server error occurred",
    });
  }
}; 