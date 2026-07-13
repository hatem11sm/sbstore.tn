import connectDB from "@/db/Database";
import ClothingProduct from "@/models/Product";
import "@/models/Vendor";
import { NextResponse } from "next/server";
import {
  isAdminUser,
  isVendorUser,
  requireAuthUser,
  userOwnsVendor,
} from "@/utils/serverAuth";

export const dynamic = "force-dynamic";

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

    const query = {};

    if (isVendorUser(user)) {
      if (!user?.vendorId?._id) {
        return NextResponse.json(
          { status: 403, message: "Aucune boutique liée à ce compte vendeur" },
          { status: 403 }
        );
      }
      query.vendorId = user.vendorId._id;
    } else if (!isAdminUser(user)) {
      return NextResponse.json(
        { status: 403, message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const products = await ClothingProduct.find(query).populate(
      "vendorId",
      "name slug city status"
    );
    return NextResponse.json({
      status: 200,
      message: "success",
      data: products,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
};
