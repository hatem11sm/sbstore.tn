import connectDB from "@/db/Database";
import Category from "@/models/Category";
import ClothingProduct from "@/models/Product";
import slugify from "@/utils/slugify";
import { normalizeCollectionGroup, buildCategoryKey } from "@/utils/categoryPaths";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    console.log("Raw request body:", body);
    
    const {
      name,
      price,
      description,
      category,
      categorySlug,
      categoryCollectionGroup,
      subcategory = "",
      mainImage,
    } = body;
    
    // Log the received values with their types
    console.log("Received values with types:", {
      name: { value: name, type: typeof name },
      price: { value: price, type: typeof price },
      description: { value: description, type: typeof description },
      category: { value: category, type: typeof category },
      categorySlug: { value: categorySlug, type: typeof categorySlug },
      subcategory: { value: subcategory, type: typeof subcategory },
      categoryCollectionGroup: { value: categoryCollectionGroup, type: typeof categoryCollectionGroup },
      mainImage: { value: mainImage, type: typeof mainImage }
    });

    // Validate required fields
    if (!name || !price || !description || (!category && !categorySlug) || !mainImage) {
      return NextResponse.json({ 
        status: 400, 
        message: "All fields are required",
        missingFields: {
          name: !name,
          price: !price,
          description: !description,
          category: !category && !categorySlug,
          subcategory: false,
          mainImage: !mainImage
        }
      });
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

    // Create the product with explicit type conversion
    const productData = {
      name: String(name).trim(),
      price: Number(price),
      description: String(description).trim(),
      category: matchedCategory.name,
      categorySlug: matchedCategory.slug,
      categoryId: matchedCategory._id,
      categoryCollectionGroup: matchedCategory.collectionGroup,
      subcategory: normalizedSubcategory,
      mainImage: String(mainImage).trim()
    };

    console.log("Creating product with formatted data:", productData);

    const clothingProduct = await ClothingProduct.create(productData);

    if (!clothingProduct) {
      return NextResponse.json({ 
        status: 400, 
        message: "Product not created" 
      });
    }

    return NextResponse.json({
      status: 201,
      message: "Product created successfully",
      data: {
        ...clothingProduct.toObject(),
        categoryKey: buildCategoryKey(matchedCategory),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    // Log the full error object
    console.error("Full error object:", JSON.stringify(error, null, 2));
    
    return NextResponse.json({ 
      status: 500, 
      message: "Error creating product",
      error: error.message,
      details: error.errors || error
    });
  }
};

export const GET = async (req) => {
  try {
    await connectDB();
    const products = await ClothingProduct.find({});
    if (!products) {
      return NextResponse.json({ 
        status: 400, 
        message: "No products found" 
      });
    }
    return NextResponse.json({
      status: 200,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ 
      status: 500, 
      message: "Error fetching products",
      error: error.message 
    });
  }
};
