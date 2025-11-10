import mongoose from "mongoose";
import slugify from "@/utils/slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    collectionGroup: {
      type: String,
      enum: ["woman", "man", "kids"],
      default: "woman",
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ name: 1, collectionGroup: 1 }, { unique: true });
categorySchema.index({ slug: 1, collectionGroup: 1 }, { unique: true });

categorySchema.pre("validate", async function handleSlug(next) {
  if (
    !this.isModified("name") &&
    !this.isModified("collectionGroup") &&
    this.slug
  ) {
    return next();
  }

  if (!this.name) {
    return next();
  }

  try {
    const baseSlug = slugify(this.name);
    const normalizedGroup = this.collectionGroup || "woman";
    let candidate = baseSlug;
    let attempt = 1;

    const existsWithSlug = async (slugValue) => {
      const existing = await this.constructor.exists({
        slug: slugValue,
        collectionGroup: normalizedGroup,
        _id: { $ne: this._id },
      });
      return Boolean(existing);
    };

    while (await existsWithSlug(candidate)) {
      attempt += 1;
      candidate = slugify(`${this.name}-${attempt}`);
    }

    this.slug = candidate;
    next();
  } catch (error) {
    next(error);
  }
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
