import connectDB from "@/db/Database";
import Category from "@/models/Category";
import ClothingProduct from "@/models/Product";
import Vendor from "@/models/Vendor";
import slugify from "@/utils/slugify";
import { normalizeCollectionGroup, buildCategoryKey } from "@/utils/categoryPaths";
import { NextResponse } from "next/server";
import {
  isAdminUser,
  isVendorUser,
  requireAuthUser,
  userOwnsVendor,
} from "@/utils/serverAuth";

export const GET = async (req, { params }) => {
  await connectDB();
  const { id } = params;
  const product = await ClothingProduct.findById(id).populate(
    "vendorId",
    "name slug city status"
  );
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
  const { user, error: authError } = await requireAuthUser();

  if (authError) {
    return NextResponse.json(
      { status: authError.status, message: authError.message },
      { status: authError.status }
    );
  }

  if (!isAdminUser(user) && !isVendorUser(user)) {
    return NextResponse.json(
      { status: 403, message: "Accès non autorisé" },
      { status: 403 }
    );
  }

  const {
    name,
    price,
    hidePrice = false,
    description,
    category,
    categorySlug,
    categoryCollectionGroup,
    subcategory = "",
    vendorId = "",
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
  let matchedVendor = null;
  const existingProduct = await ClothingProduct.findById(id);

  if (!existingProduct) {
    return NextResponse.json({ status: 404, message: "Product not found" });
  }

  if (
    isVendorUser(user) &&
    !userOwnsVendor(user, existingProduct.vendorId)
  ) {
    return NextResponse.json(
      {
        status: 403,
        message: "Ce produit n’appartient pas à votre boutique",
      },
      { status: 403 }
    );
  }

  if (vendorId) {
    matchedVendor = await Vendor.findById(vendorId);
    if (!matchedVendor) {
      return NextResponse.json(
        {
          status: 400,
          message: "La boutique sélectionnée n’existe pas",
        },
        { status: 400 }
      );
    }
  }

  if (isVendorUser(user)) {
    matchedVendor = await Vendor.findById(user.vendorId._id);
  }

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
      hidePrice: Boolean(hidePrice),
      description: String(description).trim(),
      category: matchedCategory.name,
      categorySlug: matchedCategory.slug,
      categoryId: matchedCategory._id,
      categoryCollectionGroup: matchedCategory.collectionGroup,
      vendorId: matchedVendor?._id,
      vendorName: matchedVendor?.name || "SB Store",
      vendorSlug: matchedVendor?.slug || "sb-store",
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
  const { user, error: authError } = await requireAuthUser();

  if (authError) {
    return NextResponse.json(
      { status: authError.status, message: authError.message },
      { status: authError.status }
    );
  }

  if (!isAdminUser(user) && !isVendorUser(user)) {
    return NextResponse.json(
      { status: 403, message: "Accès non autorisé" },
      { status: 403 }
    );
  }

  const existingProduct = await ClothingProduct.findById(id);
  if (!existingProduct) {
    return NextResponse.json({ status: 404, message: "Product not found" });
  }

  if (
    isVendorUser(user) &&
    !userOwnsVendor(user, existingProduct.vendorId)
  ) {
    return NextResponse.json(
      {
        status: 403,
        message: "Ce produit n’appartient pas à votre boutique",
      },
      { status: 403 }
    );
  }

  const product = await ClothingProduct.findByIdAndDelete(id);
  return NextResponse.json({
    status: 200,
    message: "Product deleted successfully",
  });
}; 
