import connectDB from "@/db/Database";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

const normalizeCollectionGroup = (value) => {
  const normalized = String(value || "").toLowerCase();
  const allowed = ["woman", "man", "kids"];
  return allowed.includes(normalized) ? normalized : "woman";
};

let categoryIndexesSynced = false;
const ensureCategoryIndexes = async () => {
  if (categoryIndexesSynced) return;
  await Category.syncIndexes();
  categoryIndexesSynced = true;
};

export const GET = async () => {
  try {
    await connectDB();
    await ensureCategoryIndexes();
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
    await ensureCategoryIndexes();

    const body = await req.json();
    const {
      name,
      description = "",
      image = "",
      subcategories = [],
      collectionGroup,
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

    const normalizedGroup = normalizeCollectionGroup(collectionGroup);

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: image?.trim() || "",
      subcategories: sanitizedSubcategories,
      collectionGroup: normalizedGroup,
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
      const keyPattern = error?.keyPattern || {};
      const hasNameGroupDuplicate =
        Object.prototype.hasOwnProperty.call(keyPattern, "name") &&
        Object.prototype.hasOwnProperty.call(keyPattern, "collectionGroup");
      const duplicateMessage = hasNameGroupDuplicate
          ? "Category with this name already exists in the selected collection"
          : "Category slug already exists";
      return NextResponse.json(
        {
          status: "error",
          message: duplicateMessage,
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
