import "dotenv/config";
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    contactName: String,
    phone: String,
    city: String,
    description: String,
    status: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    vendorId: mongoose.Schema.Types.ObjectId,
    vendorName: String,
    vendorSlug: String,
  },
  { strict: false }
);

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
const ClothingProduct =
  mongoose.models.ClothingProduct ||
  mongoose.model("ClothingProduct", productSchema, "clothingproducts");

const DEMO_VENDORS = [
  {
    name: "Maison Atlas",
    contactName: "Sana Ben Ali",
    phone: "22 110 240",
    city: "Tunis",
    description:
      "Boutique mode et accessoires avec une sélection premium pour femme et homme.",
    status: "active",
    slug: "maison-atlas",
  },
  {
    name: "Casbah Kids",
    contactName: "Youssef Trabelsi",
    phone: "28 410 335",
    city: "Sousse",
    description:
      "Spécialiste enfant avec des pièces confortables pour l’école et le week-end.",
    status: "active",
    slug: "casbah-kids",
  },
  {
    name: "Nordic Watch Club",
    contactName: "Amine Gharbi",
    phone: "55 900 118",
    city: "Sfax",
    description:
      "Montres, lunettes et accessoires pour un vestiaire urbain plus pointu.",
    status: "active",
    slug: "nordic-watch-club",
  },
];

const run = async () => {
  if (!process.env.CONNECT_DB) {
    throw new Error("CONNECT_DB manquant");
  }

  await mongoose.connect(process.env.CONNECT_DB);

  try {
    const vendors = [];

    for (const vendorData of DEMO_VENDORS) {
      const existing = await Vendor.findOne({ slug: vendorData.slug });
      if (existing) {
        vendors.push(existing);
        continue;
      }

      const created = await Vendor.create(vendorData);
      vendors.push(created);
    }

    const products = await ClothingProduct.find({}).sort({ _id: 1 });
    for (let index = 0; index < products.length; index += 1) {
      const vendor = vendors[index % vendors.length];
      await ClothingProduct.findByIdAndUpdate(products[index]._id, {
        vendorId: vendor._id,
        vendorName: vendor.name,
        vendorSlug: vendor.slug,
      });
    }

    console.log(
      `Marketplace demo seeded: ${vendors.length} vendors, ${products.length} products linked.`
    );
  } finally {
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Failed to seed marketplace demo:", error);
  process.exit(1);
});
