import connectDB from "@/db/Database";
import ClothingProduct from "@/models/Product";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  await connectDB();
  const { id } = params;
  const product = await ClothingProduct.findById(id);
  if (!product)
    return NextResponse.json({ status: 404, message: "Product not found" });
  return NextResponse.json({
    status: 200,
    message: "Product found",
    data: product,
  });
};

export const PUT = async (req, { params }) => {
  await connectDB();
  const { id } = params;
  const { name, price, description, category, subcategory, mainImage } = await req.json();
  const product = await ClothingProduct.findByIdAndUpdate(
    id,
    {
      name,
      price,
      description,
      category,
      subcategory,
      mainImage,
    },
    { new: true }
  );
  if (!product)
    return NextResponse.json({ status: 404, message: "Product not found" });
  return NextResponse.json({
    status: 200,
    message: "Product updated successfully",
    data: product,
  });
};

export const DELETE = async (req, { params }) => {
  await connectDB();
  const { id } = params;
  const product = await ClothingProduct.findByIdAndDelete(id);
  if (!product)
    return NextResponse.json({ status: 404, message: "Product not found" });
  return NextResponse.json({
    status: 200,
    message: "Product deleted successfully",
  });
}; 