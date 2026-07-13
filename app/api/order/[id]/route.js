import connectDB from "@/db/Database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import {
  isAdminUser,
  isVendorUser,
  requireAuthUser,
  userOwnsVendor,
} from "@/utils/serverAuth";

export const PUT = async (req, { params }) => {
  await connectDB();
  try {
    const { user, error } = await requireAuthUser();

    if (error) {
      return NextResponse.json(
        { status: error.status, error: error.message },
        { status: error.status }
      );
    }

    const { id } = params;
    const { status, paymentStatus } = await req.json();

    if (!status && !paymentStatus) {
      return NextResponse.json({
        status: 400,
        error: "Status or payment status is required",
      });
    }

    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return NextResponse.json({
        status: 404,
        error: "Order not found",
      });
    }

    if (
      isVendorUser(user) &&
      !(existingOrder.vendorBreakdown || []).some((entry) =>
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

    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus && isAdminUser(user)) updates.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(id, updates, { new: true });

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
