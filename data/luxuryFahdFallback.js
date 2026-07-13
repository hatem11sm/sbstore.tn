export const luxuryFahdFallbackVendor = {
  _id: "fallback-luxury-fahd",
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

const productRows = [
  ["Ensemble blanc chemise manches courtes", "Ensemble", "/images/vendors/luxury-fahd/catalog/ensemble-polo-blanc-pantalon.JPG"],
  ["Chemise blanche premium manches longues", "Chemise", "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG"],
  ["Claquettes DG noires", "Claquettes", "/images/vendors/luxury-fahd/dg-black-slides.png"],
  ["Claquettes DG marron suede", "Claquettes", "/images/vendors/luxury-fahd/dg-brown-slides.png"],
  ["Claquettes H orange", "Claquettes", "/images/vendors/luxury-fahd/h-orange-slides.png"],
  ["Claquettes H bleu marine", "Claquettes", "/images/vendors/luxury-fahd/h-navy-slides.png"],
  ["Claquettes H vertes", "Claquettes", "/images/vendors/luxury-fahd/h-green-slides.png"],
  ["Claquettes H croco beige", "Claquettes", "/images/vendors/luxury-fahd/h-croc-beige-slides.png"],
  ["Chemise Loro Piana beige", "Chemise", "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG"],
  ["Sneakers On blanches", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-blanches-logo-dore.JPG"],
  ["Chemise blanche RL", "Chemise", "/images/vendors/luxury-fahd/catalog/chemise-blanche-rl.JPG"],
  ["Sneakers noires semelle orange", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-noires-orange-semelle.JPG"],
  ["Sac bandouliere gris ciel", "Sac a main", "/images/vendors/luxury-fahd/catalog/sac-bandouliere-gris-ciel.JPG"],
  ["Sneakers noires orange profil", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-noires-orange.JPG"],
  ["Sac bandouliere camel", "Sac a main", "/images/vendors/luxury-fahd/catalog/sac-bandouliere-camel.JPG"],
  ["Claquettes marron suede", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-marron.JPG"],
  ["Sac bandouliere taupe", "Sac a main", "/images/vendors/luxury-fahd/catalog/sac-bandouliere-taupe.JPG"],
  ["Sneakers noires lacets blancs", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-noires-lacets-blancs.JPG"],
  ["Sac bandouliere bleu marine", "Sac a main", "/images/vendors/luxury-fahd/catalog/sac-bandouliere-bleu-marine.JPG"],
  ["Sneakers noires logo dore", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG"],
  ["Sneakers blanches logo dore", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-blanches-logo-dore.JPG"],
  ["Ensemble polo blanc et pantalon", "Ensemble", "/images/vendors/luxury-fahd/catalog/ensemble-polo-blanc-pantalon.JPG"],
  ["Pantalon rayures avec claquettes", "Pantalon", "/images/vendors/luxury-fahd/catalog/pantalon-rayures-claquettes.JPG"],
  ["Claquettes grises H", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-grises.JPG"],
  ["Sneakers noires croco", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG"],
  ["Claquettes bleu marine H", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-bleu-marine.JPG"],
  ["Sneakers noires semelle blanche", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-noires-semelle-blanche.JPG"],
  ["Claquettes orange H", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-orange.JPG"],
  ["Claquettes vertes H", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-vertes.JPG"],
  ["Sneakers croco noires", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-croco-noires.JPG"],
  ["Sneakers noires blanches rouges", "Chaussures", "/images/vendors/luxury-fahd/catalog/sneakers-noires-blanches-rouges.JPG"],
  ["Claquettes noires DG", "Claquettes", "/images/vendors/luxury-fahd/catalog/claquettes-noires.JPG"],
];

export const luxuryFahdFallbackProducts = productRows.map(
  ([name, subcategory, mainImage], index) => ({
    _id: `luxury-fahd-${index + 1}`,
    name,
    description: `${name} disponible chez Luxury Fahd. Contact direct pour confirmer la disponibilite, la taille et la livraison.`,
    price: 0,
    hidePrice: true,
    category: "Men",
    categorySlug: "men",
    categoryCollectionGroup: "man",
    subcategory,
    mainImage,
    vendorId: luxuryFahdFallbackVendor,
    vendorName: luxuryFahdFallbackVendor.name,
    vendorSlug: luxuryFahdFallbackVendor.slug,
    size: ["Small", "Medium", "Large", "Extra Large"],
  })
);

export const mergeLuxuryFahdFallbackProducts = (products = []) => {
  const productList = Array.isArray(products) ? products : [];
  const hasLuxuryFahd = productList.some(
    (product) => product?.vendorSlug === luxuryFahdFallbackVendor.slug
  );

  return hasLuxuryFahd
    ? productList
    : [...luxuryFahdFallbackProducts, ...productList];
};

export const mergeLuxuryFahdFallbackVendors = (vendors = []) => {
  const vendorList = Array.isArray(vendors) ? vendors : [];
  const hasLuxuryFahd = vendorList.some(
    (vendor) => vendor?.slug === luxuryFahdFallbackVendor.slug
  );

  return hasLuxuryFahd ? vendorList : [luxuryFahdFallbackVendor, ...vendorList];
};
