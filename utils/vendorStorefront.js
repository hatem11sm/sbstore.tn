export const vendorTemplates = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Une vitrine premium et sobre pour la mode, les accessoires et les marques épurées.",
    storefrontLabel: "Édition minimal",
  },
  {
    id: "catalog",
    label: "Catalogue",
    description: "Une mise en avant plus dense des catégories et des produits pour les boutiques au stock riche.",
    storefrontLabel: "Édition catalogue",
  },
  {
    id: "story",
    label: "Story",
    description: "Une vitrine orientée identité de marque, bannière, histoire et sélection éditoriale.",
    storefrontLabel: "Édition story",
  },
  {
    id: "promo",
    label: "Promo",
    description: "Une mise en page qui pousse les offres, les nouveautés et les CTA commerciaux.",
    storefrontLabel: "Édition promo",
  },
];

export const defaultVendorBanner =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80";

export const defaultVendorLogo =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";

export const getVendorTemplate = (templateId = "minimal") =>
  vendorTemplates.find((template) => template.id === templateId) || vendorTemplates[0];

export const getVendorAccent = (accentColor = "#16181b") =>
  /^#([0-9A-F]{3}){1,2}$/i.test(accentColor) ? accentColor : "#16181b";

export const normalizeVendorForStorefront = (vendor = {}) => {
  const template = getVendorTemplate(vendor.template);

  return {
    ...vendor,
    template: template.id,
    templateLabel: template.label,
    storefrontLabel: template.storefrontLabel,
    accentColor: getVendorAccent(vendor.accentColor),
    banner: vendor.banner || defaultVendorBanner,
    logo: vendor.logo || defaultVendorLogo,
    tagline:
      vendor.tagline ||
      vendor.shortDescription ||
      "Une mini-boutique pensee pour vendre dans la marketplace SB Store.",
    shortDescription:
      vendor.shortDescription ||
      "Une vitrine personnalisée avec produits, catégories, confiance et contact direct.",
    description:
      vendor.description ||
      "Cette boutique dispose de sa propre vitrine au sein de la marketplace et peut mettre en avant ses produits, son identité et ses services.",
    shippingPolicy:
      vendor.shippingPolicy || "Livraison rapide en Tunisie avec confirmation de commande.",
    returnPolicy:
      vendor.returnPolicy || "Échange selon disponibilité et validation avec la boutique.",
  };
};
