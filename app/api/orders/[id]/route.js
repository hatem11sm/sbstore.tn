import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import {
  isAdminUser,
  isVendorUser,
  requireAuthUser,
  userOwnsVendor,
} from "@/utils/serverAuth";

export const GET = async (req, { params }) => {
  await connectDB();

  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, error: error.message },
        { status: error.status }
      );
    }

    const order = await Order.findById(params.id).populate("userId", "name email");

    if (!order) {
      return NextResponse.json({
        status: 404,
        error: "Order not found",
      });
    }

    if (
      isVendorUser(user) &&
      !(order.vendorBreakdown || []).some((entry) =>
        userOwnsVendor(user, entry.vendorId)
      )
    ) {
      return NextResponse.json(
        { status: 403, error: "Cette commande n’appartient pas à votre boutique" },
        { status: 403 }
      );
    }

    if (!isVendorUser(user) && !isAdminUser(user)) {
      return NextResponse.json(
        { status: 403, error: "Accès non autorisé" },
        { status: 403 }
      );
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
