import mongoose from "mongoose";
import slugify from "@/utils/slugify";

const vendorSchema = new mongoose.Schema(
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
    contactName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    logo: {
      type: String,
      trim: true,
      default: "",
    },
    banner: {
      type: String,
      trim: true,
      default: "",
    },
    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },
    instagram: {
      type: String,
      trim: true,
      default: "",
    },
    facebook: {
      type: String,
      trim: true,
      default: "",
    },
    template: {
      type: String,
      enum: ["minimal", "catalog", "story", "promo"],
      default: "minimal",
    },
    accentColor: {
      type: String,
      trim: true,
      default: "#16181b",
    },
    shippingPolicy: {
      type: String,
      trim: true,
      default: "",
    },
    returnPolicy: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ name: 1 }, { unique: true });
vendorSchema.index({ slug: 1 }, { unique: true });

vendorSchema.pre("validate", async function handleSlug(next) {
  if (!this.name) return next();
  if (!this.isModified("name") && this.slug) return next();

  try {
    const baseSlug = slugify(this.name);
    let candidate = baseSlug;
    let attempt = 1;

    while (
      await this.constructor.exists({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      attempt += 1;
      candidate = slugify(`${this.name}-${attempt}`);
    }

    this.slug = candidate;
    next();
  } catch (error) {
    next(error);
  }
});

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;
