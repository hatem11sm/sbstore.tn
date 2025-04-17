import connectDB from "@/db/Database";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  await connectDB();

  try {
    // Verify user authentication
    const authToken = cookies().get("authToken")?.value || "";
    if (!authToken) {
      return NextResponse.json({
        status: 401,
        error: "Authentication required",
      });
    }

    const userData = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = userData.id;

    // Parse request body
    const { fullName, phoneNumber, address, description } = await req.json();

    // Validate required fields
    if (!fullName || !phoneNumber || !address) {
      return NextResponse.json({
        status: 400,
        error: "Missing required fields",
      });
    }

    // Get user cart
    const userCart = await Cart.findOne({ userId });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return NextResponse.json({
        status: 400,
        error: "Cart is empty",
      });
    }

    // Calculate total
    const total = userCart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create new order
    const newOrder = new Order({
      userId,
      items: userCart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        price: item.price,
        name: item.name,
      })),
      total,
      customer: {
        fullName,
        phoneNumber,
        address,
        description: description || "",
      },
      shippingAddress: address,
    });

    // Save the order
    await newOrder.save();

    // Clear the cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return NextResponse.json({
      status: 200,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({
      status: 500,
      error: "Server error occurred",
    });
  }
};
