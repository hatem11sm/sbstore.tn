import connectDB from "@/db/Database";
import Category from "@/models/Category";
import ClothingProduct from "@/models/Product";
import slugify from "@/utils/slugify";
import { normalizeCollectionGroup, buildCategoryKey } from "@/utils/categoryPaths";
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
  const {
    name,
    price,
    description,
    category,
    categorySlug,
    categoryCollectionGroup,
    subcategory = "",
    mainImage,
  } = await req.json();

  if (
    !name ||
    !price ||
    !description ||
    (!category && !categorySlug) ||
    !mainImage
  ) {
    return NextResponse.json(
      { status: 400, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const resolvedSlug = (categorySlug || slugify(category || "")).toLowerCase();
  const normalizedGroup = categoryCollectionGroup
    ? normalizeCollectionGroup(categoryCollectionGroup)
    : null;

  const categoryQuery = { slug: resolvedSlug };
  if (normalizedGroup) {
    categoryQuery.collectionGroup = normalizedGroup;
  }

  let matchedCategory = await Category.findOne(categoryQuery);

  if (!matchedCategory && !normalizedGroup) {
    const candidates = await Category.find({ slug: resolvedSlug });
    if (candidates.length === 1) {
      matchedCategory = candidates[0];
    } else if (candidates.length > 1) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Multiple collections use this category. Please specify the collection group.",
        },
        { status: 400 }
      );
    }
  }

  if (!matchedCategory) {
    return NextResponse.json(
      {
        status: 400,
        message: "Selected category does not exist",
      },
      { status: 400 }
    );
  }

  const normalizedSubcategory = subcategory?.trim() || "";

  if (
    normalizedSubcategory &&
    matchedCategory.subcategories.length > 0 &&
    !matchedCategory.subcategories.includes(normalizedSubcategory)
  ) {
    return NextResponse.json(
      {
        status: 400,
        message: "Subcategory is not valid for the chosen category",
      },
      { status: 400 }
    );
  }

  const product = await ClothingProduct.findByIdAndUpdate(
    id,
    {
      name: String(name).trim(),
      price: Number(price),
      description: String(description).trim(),
      category: matchedCategory.name,
      categorySlug: matchedCategory.slug,
      categoryId: matchedCategory._id,
      categoryCollectionGroup: matchedCategory.collectionGroup,
      subcategory: normalizedSubcategory,
      mainImage: String(mainImage).trim(),
    },
    { new: true, runValidators: true }
  );
  if (!product)
    return NextResponse.json({ status: 404, message: "Product not found" });
  return NextResponse.json({
    status: 200,
    message: "Product updated successfully",
    data: {
      ...product.toObject(),
      categoryKey: buildCategoryKey(matchedCategory),
    },
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
