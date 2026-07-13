import connectDB from "@/db/Database";
import ClothingProduct from "@/models/Product";
import "@/models/Vendor";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  await connectDB();
  const products = await ClothingProduct.find({}).populate(
    "vendorId",
    "name slug city status"
  );
  if (!products)
    return NextResponse.json({ status: 400, message: "No products found" });
  return NextResponse.json({
    status: 200,
    message: "Products fetched successfully",
    data: products,
  });
};
