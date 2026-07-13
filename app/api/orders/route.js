import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import {
  isAdminUser,
  isVendorUser,
  requireAuthUser,
  userOwnsVendor,
} from "@/utils/serverAuth";

export const GET = async (req) => {
  await connectDB();
  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    let orders = await Order.find({}).sort({ createdAt: -1 });

    if (isVendorUser(user)) {
      const vendorId = user?.vendorId?._id;
      if (!vendorId) {
        return NextResponse.json(
          { status: 403, message: "Aucune boutique liée à ce compte vendeur" },
          { status: 403 }
        );
      }
      orders = orders.filter((order) =>
        (order.vendorBreakdown || []).some((entry) =>
          userOwnsVendor(user, entry.vendorId)
        )
      );
    } else if (!isAdminUser(user)) {
      return NextResponse.json(
        { status: 403, message: "Accès non autorisé" },
        { status: 403 }
      );
    }

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
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, message: error.message },
        { status: error.status }
      );
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        { status: 403, message: "Accès réservé à l’administrateur" },
        { status: 403 }
      );
    }

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
