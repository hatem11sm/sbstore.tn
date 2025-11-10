const COLLECTION_GROUPS = ["woman", "man", "kids"];

export const normalizeCollectionGroup = (value = "woman") => {
  const normalized = String(value || "").toLowerCase();
  return COLLECTION_GROUPS.includes(normalized) ? normalized : "woman";
};

export const ensureCategorySlug = (value = "") => String(value || "").trim().toLowerCase();

export const buildCategoryPathFromParts = (group, slug) => {
  const normalizedGroup = normalizeCollectionGroup(group);
  const normalizedSlug = ensureCategorySlug(slug);
  if (!normalizedSlug) {
    return "/category";
  }
  return `/${normalizedGroup}/${normalizedSlug}`;
};

export const buildCategoryPath = (category = {}) =>
  buildCategoryPathFromParts(category.collectionGroup, category.slug);

export const buildCategoryKey = (category = {}) => {
  const slug = ensureCategorySlug(category.slug);
  if (!slug) return "";
  const group = normalizeCollectionGroup(category.collectionGroup);
  return `${group}:${slug}`;
};

export const parseCategoryKey = (value = "") => {
  if (!value) return { slug: "", collectionGroup: "woman" };
  if (!value.includes(":")) {
    return { slug: ensureCategorySlug(value), collectionGroup: "woman" };
  }
  const [groupPart = "woman", slugPart = ""] = value.split(":");
  return {
    collectionGroup: normalizeCollectionGroup(groupPart),
    slug: ensureCategorySlug(slugPart),
  };
};
