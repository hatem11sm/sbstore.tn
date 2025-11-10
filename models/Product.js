import mongoose from "mongoose";
import slugify from "@/utils/slugify";

const clothingProduct = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  categorySlug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
  },
  categoryCollectionGroup: {
    type: String,
    enum: ["woman", "man", "kids"],
    default: "woman",
    lowercase: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
    default: "",
  },
  size: {
    type: [String],
    enum: ["Small", "Medium", "Large", "Extra Large"],
    default: ["Small", "Medium", "Large", "Extra Large"],
  },
  mainImage: {
    type: String,
    required: true,
  },
});

clothingProduct.pre("validate", function ensureCategorySlug(next) {
  if (this.category && !this.categorySlug) {
    this.categorySlug = slugify(this.category);
  }
  if (!this.categoryCollectionGroup) {
    this.categoryCollectionGroup = "woman";
  }
  next();
});

// Add pre-save middleware to log the document before saving
clothingProduct.pre('save', function(next) {
  console.log("Pre-save document:", this.toObject());
  next();
});

const ClothingProduct =
  mongoose.models.ClothingProduct ||
  mongoose.model("ClothingProduct", clothingProduct);

export default ClothingProduct;
