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

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    hidePrice: Boolean,
    category: String,
    categorySlug: String,
    categoryCollectionGroup: String,
    subcategory: String,
    size: [String],
    mainImage: String,
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

const VENDOR = {
  name: "Luxury Fahd",
  slug: "luxury-fahd",
  contactName: "Luxury Fahd",
  phone: "23 993 008",
  city: "Tunisie",
  description:
    "Luxury Fahd propose une selection premium inspiree des vitrines luxe: chaussures, claquettes, sacs, chemises, pantalons, ensembles et accessoires. Les prix sont communiques sur demande pour garder un contact direct avec la boutique.",
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

const BASE_PRODUCTS = [
  {
    name: "Ensemble blanc chemise manches courtes",
    description:
      "Look homme blanc compose d'une chemise fluide manches courtes et short assorti, style classe pour ete et sorties.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Ensemble",
    mainImage: "/images/vendors/luxury-fahd/catalog/ensemble-polo-blanc-pantalon.JPG",
  },
  {
    name: "Chemise blanche premium manches longues",
    description:
      "Chemise blanche elegante a coupe fluide, ideale pour un outfit propre, minimal et premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chemise",
    mainImage: "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG",
  },
  {
    name: "Claquettes DG noires",
    description:
      "Claquettes noires a logo relief, finition contrastee et semelle claire pour un style luxe decontracte.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/dg-black-slides.png",
  },
  {
    name: "Claquettes DG marron suede",
    description:
      "Claquettes marron effet suede avec logo ton sur ton, pensees pour les looks ete premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/dg-brown-slides.png",
  },
  {
    name: "Claquettes H orange",
    description:
      "Claquettes orange avec decoupe H et surpiqures apparentes, piece forte pour outfit estival.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/h-orange-slides.png",
  },
  {
    name: "Claquettes H bleu marine",
    description:
      "Claquettes bleu marine avec semelle orange et finition couture, facile a porter avec un look casual chic.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/h-navy-slides.png",
  },
  {
    name: "Claquettes H vertes",
    description:
      "Claquettes vert fonce avec surpiqures contrastees, selection premium pour une tenue sobre et distinctive.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/h-green-slides.png",
  },
  {
    name: "Claquettes H croco beige",
    description:
      "Claquettes beige effet croco avec semelle noire, associees a une ambiance luxe et accessoires premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/h-croc-beige-slides.png",
  },
  {
    name: "Chemise Loro Piana beige",
    description:
      "Chemise beige texturee, esprit Loro Piana, ideale pour une silhouette calme, propre et haut de gamme.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chemise",
    mainImage: "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG",
  },
  {
    name: "Sneakers On blanches",
    description:
      "Sneakers blanches avec logo dore, paire lumineuse pour completer un outfit moderne.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-blanches-logo-dore.JPG",
  },
];

const LUXY_PRODUCTS = [
  {
    name: "Chemise blanche RL",
    description:
      "Chemise blanche elegante avec coupe classique, pensee pour un look propre et habille.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chemise",
    mainImage: "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG",
  },
  {
    name: "Sneakers noires semelle orange",
    description:
      "Sneakers noires avec semelle crantee orange, une paire forte pour un outfit street luxe.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-noires-orange-semelle.JPG",
  },
  {
    name: "Sac bandouliere gris ciel",
    description:
      "Sac bandouliere gris clair avec fermeture metal, format compact pour accessoire premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Sac a main",
    mainImage: "/images/vendors/luxury-fahd/catalog/sac-bandouliere-gris-ciel.JPG",
  },
  {
    name: "Sneakers noires orange profil",
    description:
      "Sneakers noires avec details orange sur la semelle, selection premium pour tenue moderne.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-noires-orange.JPG",
  },
  {
    name: "Sac bandouliere camel",
    description:
      "Sac camel structure avec fermeture metal, accessoire sobre et haut de gamme.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Sac a main",
    mainImage: "/images/vendors/luxury-fahd/catalog/sac-bandouliere-camel.JPG",
  },
  {
    name: "Claquettes marron suede",
    description:
      "Claquettes marron effet suede avec detail H, faciles a porter en ete.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-marron.JPG",
  },
  {
    name: "Sac bandouliere taupe",
    description:
      "Sac bandouliere taupe au format compact, finition metal pour une touche luxe.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Sac a main",
    mainImage: "/images/vendors/luxury-fahd/catalog/sac-bandouliere-taupe.JPG",
  },
  {
    name: "Sneakers noires lacets blancs",
    description:
      "Sneakers noires avec lacets blancs et detail rouge, modele sportif et premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-noires-lacets-blancs.JPG",
  },
  {
    name: "Sac bandouliere bleu marine",
    description:
      "Sac bleu marine structure avec bande ton sur ton et fermeture metal.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Sac a main",
    mainImage: "/images/vendors/luxury-fahd/catalog/sac-bandouliere-bleu-marine.JPG",
  },
  {
    name: "Sneakers noires logo dore",
    description:
      "Sneakers noires avec logo dore lateral, style sobre pour un look classe.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG",
  },
  {
    name: "Sneakers blanches logo dore",
    description:
      "Sneakers blanches avec logo dore, paire lumineuse pour outfit casual chic.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-blanches-logo-dore.JPG",
  },
  {
    name: "Ensemble polo blanc et pantalon",
    description:
      "Ensemble blanc compose d'un haut style polo et d'un pantalon assorti, rendu propre et premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Ensemble",
    mainImage: "/images/vendors/luxury-fahd/catalog/ensemble-polo-blanc-pantalon.JPG",
  },
  {
    name: "Pantalon rayures avec claquettes",
    description:
      "Selection pantalon clair a rayures avec pieces assorties pour composer un look ete.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Pantalon",
    mainImage: "/images/vendors/luxury-fahd/catalog/pantalon-rayures-claquettes.JPG",
  },
  {
    name: "Claquettes grises H",
    description:
      "Claquettes grises avec decoupe H, semelle contrastee et style decontracte luxe.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-grises.JPG",
  },
  {
    name: "Sneakers noires croco",
    description:
      "Sneakers noires effet croco avec semelle epaisse, finition premium.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG",
  },
  {
    name: "Claquettes bleu marine H",
    description:
      "Claquettes bleu marine avec semelle orange et coutures contrastees.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-bleu-marine.JPG",
  },
  {
    name: "Sneakers noires semelle blanche",
    description:
      "Sneakers noires avec semelle blanche graphique, modele moderne et facile a porter.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-noires-semelle-blanche.JPG",
  },
  {
    name: "Claquettes orange H",
    description:
      "Claquettes orange avec decoupe H, couleur forte pour les looks ete.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-orange.JPG",
  },
  {
    name: "Claquettes vertes H",
    description:
      "Claquettes vertes avec coutures orange, style premium et original.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-vertes.JPG",
  },
  {
    name: "Sneakers croco noires",
    description:
      "Sneakers noires texture croco, silhouette basse et finition sobre.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG",
  },
  {
    name: "Sneakers noires blanches rouges",
    description:
      "Sneakers noires avec semelle blanche et rouge, design graphique et sportif.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Chaussures",
    mainImage: "/images/vendors/luxury-fahd/catalog/sneakers-noires-blanches-rouges.JPG",
  },
  {
    name: "Claquettes noires DG",
    description:
      "Claquettes noires avec logo relief, semelle claire et finition casual luxe.",
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory: "Claquettes",
    mainImage: "/images/vendors/luxury-fahd/catalog/claquettes-noires.JPG",
  },
];

const PRODUCTS = [...BASE_PRODUCTS, ...LUXY_PRODUCTS];

const run = async () => {
  if (!process.env.CONNECT_DB) {
    throw new Error("CONNECT_DB manquant");
  }

  await mongoose.connect(process.env.CONNECT_DB, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    const vendor = await Vendor.findOneAndUpdate(
      { slug: VENDOR.slug },
      VENDOR,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    for (const product of PRODUCTS) {
      await ClothingProduct.findOneAndUpdate(
        { vendorSlug: VENDOR.slug, name: product.name },
        {
          ...product,
          price: 0,
          hidePrice: true,
          vendorId: vendor._id,
          vendorName: vendor.name,
          vendorSlug: vendor.slug,
          size: ["Small", "Medium", "Large", "Extra Large"],
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `Luxury Fahd seeded: ${VENDOR.slug}, ${PRODUCTS.length} produits sans prix public.`
    );
  } finally {
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Failed to seed Luxury Fahd:", error);
  process.exit(1);
});
