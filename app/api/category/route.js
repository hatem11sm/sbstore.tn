import connectDB from "@/db/Database";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(
      {
        status: "success",
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
};

export const POST = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      description = "",
      image = "",
      subcategories = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          status: "error",
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    const sanitizedSubcategories = Array.isArray(subcategories)
      ? [
          ...new Set(
            subcategories
              .map((item) => (typeof item === "string" ? item.trim() : ""))
              .filter(Boolean)
          ),
        ]
      : [];

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: image?.trim() || "",
      subcategories: sanitizedSubcategories,
    });

    return NextResponse.json(
      {
        status: "success",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          status: "error",
          message: "Category with this name already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
};
