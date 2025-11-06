import connectDB from "@/db/Database";
import Category from "@/models/Category";
import ClothingProduct from "@/models/Product";
import slugify from "@/utils/slugify";
import { NextResponse } from "next/server";

const toErrorResponse = (message, status = 500) =>
  NextResponse.json(
    {
      status: "error",
      message,
    },
    { status }
  );

export const GET = async (req, { params }) => {
  try {
    await connectDB();
    const slug = params.slug?.toLowerCase();

    const category = await Category.findOne({ slug });
    const regexSafeSlug = slug?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") || "";
    const productsQuery = {
      $or: [
        { categorySlug: slug },
        { category: { $regex: `^${regexSafeSlug}$`, $options: "i" } },
      ],
    };

    let products = await ClothingProduct.find(productsQuery);

    if (!category) {
      if (!products.length) {
        return toErrorResponse("Category not found", 404);
      }

      const derivedCategory = {
        name:
          products[0]?.category ||
          slug.replace(/-/g, " ").replace(/\b\w/g, (char) =>
            char.toUpperCase()
          ),
        slug,
        description: "",
        image: "",
        subcategories: [
          ...new Set(
            products.map((product) => product.subcategory).filter(Boolean)
          ),
        ],
      };

      return NextResponse.json(
        {
          status: "success",
          data: {
            category: derivedCategory,
            products,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          category,
          products,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return toErrorResponse(error.message);
  }
};

export const PUT = async (req, { params }) => {
  try {
    await connectDB();
    const slug = params.slug?.toLowerCase();
    const category = await Category.findOne({ slug });

    if (!category) {
      return toErrorResponse("Category not found", 404);
    }

    const body = await req.json();
    const updates = {};
    let nextSlug = slug;

    if (body.name && body.name.trim() && body.name.trim() !== category.name) {
      updates.name = body.name.trim();
      nextSlug = slugify(updates.name);
      updates.slug = nextSlug;
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || "";
    }

    if (body.image !== undefined) {
      updates.image = body.image?.trim() || "";
    }

    if (Array.isArray(body.subcategories)) {
      updates.subcategories = [
        ...new Set(
          body.subcategories
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        ),
      ];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          status: "success",
          data: category,
        },
        { status: 200 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      category._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return toErrorResponse("Category not updated", 500);
    }

    if (updates.name || updates.slug) {
      await ClothingProduct.updateMany(
        {
          $or: [{ categorySlug: slug }, { category: category.name }],
        },
        {
          category: updatedCategory.name,
          categorySlug: updatedCategory.slug,
        }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return toErrorResponse("Category with this name already exists", 409);
    }
    return toErrorResponse(error.message);
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await connectDB();
    const slug = params.slug?.toLowerCase();
    const category = await Category.findOne({ slug });

    if (!category) {
      return toErrorResponse("Category not found", 404);
    }

    const productCount = await ClothingProduct.countDocuments({
      $or: [{ categorySlug: slug }, { category: category.name }],
    });

    if (productCount > 0) {
      return toErrorResponse(
        "Cannot delete category while products are assigned to it",
        400
      );
    }

    await Category.findByIdAndDelete(category._id);

    return NextResponse.json(
      {
        status: "success",
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return toErrorResponse(error.message);
  }
};
