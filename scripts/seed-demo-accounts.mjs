import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer",
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null,
  },
});

const vendorSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    contactName: String,
    phone: String,
    city: String,
    description: String,
    shortDescription: String,
    tagline: String,
    logo: String,
    banner: String,
    whatsapp: String,
    instagram: String,
    template: String,
    accentColor: String,
    shippingPolicy: String,
    returnPolicy: String,
    status: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

const PASSWORD = "Password123!";

const LUXURY_FAHD_VENDOR = {
  name: "Luxury Fahd",
  slug: "luxury-fahd",
  contactName: "Luxury Fahd",
  phone: "23 993 008",
  city: "Tunisie",
  description:
    "Luxury Fahd propose une selection premium inspiree des vitrines luxe: chaussures, claquettes, sacs, chemises, pantalons, ensembles et accessoires.",
  shortDescription:
    "Chaussures, claquettes, sacs et outfits premium pour un style luxe.",
  tagline: "Outfit de classe, vetement de luxe.",
  logo: "/images/vendors/luxury-fahd/luxury-fahd-profile.png",
  banner: "/images/boutiques/luxury-fahd-boutique-bg-v2.png",
  whatsapp: "23993008",
  instagram: "https://www.instagram.com/luxury_fahd_/",
  template: "story",
  accentColor: "#0b0b0d",
  shippingPolicy:
    "Contact direct sur WhatsApp pour confirmer disponibilite, taille, couleur et livraison.",
  returnPolicy:
    "Echange selon disponibilite et validation avec la boutique avant livraison.",
  status: "active",
};

const upsertUser = async ({ name, email, role, isAdmin = false, vendorId = null }) => {
  const password = await bcrypt.hash(PASSWORD, 10);
  await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password,
      role,
      isAdmin,
      vendorId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const run = async () => {
  if (!process.env.CONNECT_DB) {
    throw new Error("CONNECT_DB manquant");
  }

  await mongoose.connect(process.env.CONNECT_DB);

  try {
    const vendor = await Vendor.findOneAndUpdate(
      { slug: LUXURY_FAHD_VENDOR.slug },
      LUXURY_FAHD_VENDOR,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await upsertUser({
      name: "Hatem Admin",
      email: "admin@sbstore.tn",
      role: "admin",
      isAdmin: true,
    });

    await upsertUser({
      name: "Client Demo",
      email: "client@sbstore.tn",
      role: "customer",
    });

    await upsertUser({
      name: "Luxury Fahd Vendeur",
      email: "vendeur@sbstore.tn",
      role: "vendor",
      vendorId: vendor._id,
    });

    console.log("Comptes demo crees / mis a jour:");
    console.log(`Admin: admin@sbstore.tn / ${PASSWORD}`);
    console.log(`Client: client@sbstore.tn / ${PASSWORD}`);
    console.log(`Vendeur: vendeur@sbstore.tn / ${PASSWORD}`);
  } finally {
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Failed to seed demo accounts:", error);
  process.exit(1);
});
