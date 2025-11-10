import connectDB from "@/db/Database";
import Category from "@/models/Category";
import ClothingProduct from "@/models/Product";
import { NextResponse } from "next/server";
import { normalizeCollectionGroup } from "@/utils/categoryPaths";

const toErrorResponse = (message, status = 500) =>
  NextResponse.json(
    {
      status: "error",
      message,
    },
    { status }
  );

const parseSlugParams = (raw) => {
  if (Array.isArray(raw)) {
    if (raw.length >= 2) {
      return {
        slug: String(raw[1] || "").toLowerCase(),
        collectionGroup: normalizeCollectionGroup(raw[0]),
      };
    }
    return {
      slug: String(raw[0] || "").toLowerCase(),
      collectionGroup: undefined,
    };
  }
  return {
    slug: String(raw || "").toLowerCase(),
    collectionGroup: undefined,
  };
};

let categoryIndexesSynced = false;
const ensureCategoryIndexes = async () => {
  if (categoryIndexesSynced) return;
  await Category.syncIndexes();
  categoryIndexesSynced = true;
};

export const GET = async (req, { params }) => {
  try {
    await connectDB();
    await ensureCategoryIndexes();
    const { slug, collectionGroup } = parseSlugParams(params.slug);

    if (!slug) {
      return toErrorResponse("Category slug is required", 400);
    }

    const categoryQuery = { slug };
    if (collectionGroup) {
      categoryQuery.collectionGroup = collectionGroup;
    }

    const category = await Category.findOne(categoryQuery);

    if (!collectionGroup && category) {
      const slugUsageCount = await Category.countDocuments({ slug });
      if (slugUsageCount > 1) {
        return toErrorResponse(
          "This category exists in multiple collections. Please use /{collection}/{slug}.",
          400
        );
      }
    }
    const regexSafeSlug = slug?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") || "";
    const productFilters = [];

    if (category?._id) {
      productFilters.push({ categoryId: category._id });
    }

    productFilters.push(
      { categorySlug: slug },
      { category: { $regex: `^${regexSafeSlug}$`, $options: "i" } }
    );

    const productsQuery = {
      $or: productFilters.map((filter) =>
        collectionGroup
          ? { ...filter, categoryCollectionGroup: collectionGroup }
          : filter
      ),
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
        collectionGroup:
          collectionGroup || products[0]?.categoryCollectionGroup || "woman",
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

    if (collectionGroup && !products.length) {
      const fallbackCondition = {
        $or: [
          { categoryCollectionGroup: { $exists: false } },
          { categoryCollectionGroup: null },
        ],
      };
      const fallbackQuery = {
        $or: productFilters.map((filter) => ({
          ...filter,
          ...fallbackCondition,
        })),
      };
      products = await ClothingProduct.find(fallbackQuery);
    }

    if (
      category &&
      products.length &&
      products.some((product) => !product.categoryCollectionGroup)
    ) {
      await ClothingProduct.updateMany(
        {
          categorySlug: slug,
          category: category.name,
          $or: [
            { categoryCollectionGroup: { $exists: false } },
            { categoryCollectionGroup: null },
          ],
        },
        {
          categoryCollectionGroup: category.collectionGroup,
        }
      );

      await ClothingProduct.updateMany(
        {
          categorySlug: slug,
          category: category.name,
          $or: [
            { categoryId: { $exists: false } },
            { categoryId: null },
          ],
        },
        {
          categoryId: category._id,
        }
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
    await ensureCategoryIndexes();
    const { slug, collectionGroup } = parseSlugParams(params.slug);

    if (!slug) {
      return toErrorResponse("Category slug is required", 400);
    }

    const categoryQuery = { slug };
    if (collectionGroup) {
      categoryQuery.collectionGroup = collectionGroup;
    }

    const category = await Category.findOne(categoryQuery);

    if (!category) {
      return toErrorResponse("Category not found", 404);
    }

    const body = await req.json();
    const previousName = category.name;
    const previousSlug = category.slug;
    const previousGroup = category.collectionGroup;

    if (body.name && body.name.trim()) {
      category.name = body.name.trim();
    }

    if (body.description !== undefined) {
      category.description = body.description?.trim() || "";
    }

    if (body.image !== undefined) {
      category.image = body.image?.trim() || "";
    }

    if (Array.isArray(body.subcategories)) {
      category.subcategories = [
        ...new Set(
          body.subcategories
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        ),
      ];
    }

    if (body.collectionGroup !== undefined) {
      category.collectionGroup = normalizeCollectionGroup(body.collectionGroup);
    }

    const updatedCategory = await category.save();

    const nameChanged = updatedCategory.name !== previousName;
    const slugChanged = updatedCategory.slug !== previousSlug;
    const groupChanged = updatedCategory.collectionGroup !== previousGroup;

    if (nameChanged || slugChanged || groupChanged) {
      const matchConditions = [
        {
          $or: [{ categorySlug: previousSlug }, { category: previousName }],
        },
      ];

      if (previousGroup) {
        matchConditions.push({
          $or: [
            { categoryCollectionGroup: previousGroup },
            { categoryCollectionGroup: { $exists: false } },
            { categoryCollectionGroup: null },
          ],
        });
      }

      matchConditions.push({
        $or: [
          { categoryId: category._id },
          { categoryId: { $exists: false } },
          { categoryId: null },
        ],
      });

      const updateFilter = { $and: matchConditions };

      await ClothingProduct.updateMany(updateFilter, {
        category: updatedCategory.name,
        categorySlug: updatedCategory.slug,
        categoryId: updatedCategory._id,
        categoryCollectionGroup: updatedCategory.collectionGroup,
      });
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
      const keyPattern = error?.keyPattern || {};
      const hasNameGroupDuplicate =
        Object.prototype.hasOwnProperty.call(keyPattern, "name") &&
        Object.prototype.hasOwnProperty.call(keyPattern, "collectionGroup");
      const duplicateMessage = hasNameGroupDuplicate
        ? "Category with this name already exists in the selected collection"
        : "Category slug already exists";
      return toErrorResponse(duplicateMessage, 409);
    }
    return toErrorResponse(error.message);
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await connectDB();
    await ensureCategoryIndexes();
    const { slug, collectionGroup } = parseSlugParams(params.slug);

    if (!slug) {
      return toErrorResponse("Category slug is required", 400);
    }

    const categoryQuery = { slug };
    if (collectionGroup) {
      categoryQuery.collectionGroup = collectionGroup;
    }

    const category = await Category.findOne(categoryQuery);

    if (!category) {
      return toErrorResponse("Category not found", 404);
    }

    const groupConditions = {
      $or: [
        { categoryCollectionGroup: category.collectionGroup },
        { categoryCollectionGroup: { $exists: false } },
        { categoryCollectionGroup: null },
      ],
    };

    const productCount = await ClothingProduct.countDocuments({
      $and: [
        {
          $or: [
            { categorySlug: slug },
            { category: category.name },
            { categoryId: category._id },
          ],
        },
        groupConditions,
      ],
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
