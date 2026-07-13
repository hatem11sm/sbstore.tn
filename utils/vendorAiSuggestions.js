const categoryToneMap = {
  woman: "élégante et actuelle",
  man: "urbaine et polyvalente",
  kids: "confortable et joyeuse",
};

export const buildVendorAiSuggestions = ({
  name = "",
  description = "",
  categoryLabel = "",
  collectionGroup = "woman",
  subcategory = "",
  vendorLabel = "",
  city = "",
  price = "",
}) => {
  const tone = categoryToneMap[String(collectionGroup).toLowerCase()] || "moderne";
  const cleanName = name.trim() || "Pièce signature";
  const cleanCategory = categoryLabel.trim() || "mode";
  const cleanVendor = vendorLabel.trim() || "votre boutique";
  const cleanCity = city.trim() || "Tunisie";
  const numericPrice = Number(price || 0);

  const titleSuggestion = `${cleanName} ${cleanCategory !== cleanName ? `- ${cleanCategory}` : ""}`
    .replace(/\s+/g, " ")
    .trim();

  const descriptionSuggestion = `Découvrez ${cleanName}, une pièce ${tone} proposée par ${cleanVendor}. Pensée pour une clientèle à la recherche d'un style ${tone}, cette sélection s'intègre facilement dans un vestiaire ${cleanCategory.toLowerCase()}. ${subcategory ? `Sous-catégorie: ${subcategory}. ` : ""}Disponible sur notre marketplace avec livraison en ${cleanCity}.`;

  const tags = [
    cleanCategory,
    subcategory || "marketplace",
    cleanCity,
    cleanVendor,
    tone,
  ]
    .filter(Boolean)
    .map((tag) => tag.toLowerCase().replace(/\s+/g, "-"));

  const recommendedPrice =
    numericPrice > 0
      ? Math.max(10, Math.round(numericPrice * 1.08))
      : "";

  const completenessScore = [name, description, categoryLabel].filter(
    (value) => value && String(value).trim()
  ).length;

  const qualityScore = Math.min(
    100,
    Math.round(
      completenessScore * 20 +
        (String(description).trim().length > 120 ? 25 : 10) +
        (numericPrice > 0 ? 20 : 0) +
        (subcategory ? 10 : 0)
    )
  );

  const recommendations = [
    description.trim().length < 120
      ? "Ajoute plus de détails concrets sur la coupe, l'usage ou la matière."
      : "La description a déjà une bonne longueur pour inspirer confiance.",
    numericPrice <= 0
      ? "Ajoute un prix clair pour améliorer la conversion."
      : `Le prix actuel semble cohérent. Une version premium pourrait se placer autour de ${recommendedPrice} Dt.`,
    subcategory
      ? "La sous-catégorie est renseignée, c'est bon pour la découvrabilité."
      : "Ajoute une sous-catégorie pour aider le client et les filtres du catalogue.",
  ];

  return {
    titleSuggestion,
    descriptionSuggestion,
    tags,
    recommendedPrice,
    qualityScore,
    recommendations,
  };
};
