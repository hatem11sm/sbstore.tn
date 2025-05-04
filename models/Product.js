import mongoose from "mongoose";

// Define valid categories
const VALID_CATEGORIES = ["Men", "Women", "Kids"];

// Define valid subcategories
const VALID_SUBCATEGORIES = [
  // Men's subcategories
  "T-Shirts", "Shirts", "Pants", "Jackets", "Shoes",
  // Women's subcategories
  "Dresses", "Tops", "Skirts", "Jeans", "Heels",
  // Kids' subcategories
  "Boys", "Girls", "Infants"
];

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
    enum: VALID_CATEGORIES
  },
  subcategory: {
    type: String,
    required: true,
    enum: VALID_SUBCATEGORIES
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

// Add pre-save middleware to log the document before saving
clothingProduct.pre('save', function(next) {
  console.log("Pre-save document:", this.toObject());
  next();
});

const ClothingProduct =
  mongoose.models.ClothingProduct ||
  mongoose.model("ClothingProduct", clothingProduct);

export default ClothingProduct;
