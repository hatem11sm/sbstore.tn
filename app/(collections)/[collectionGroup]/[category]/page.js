import Category from "@/app/category/[categories]/Category";
import { notFound } from "next/navigation";
import { normalizeCollectionGroup, ensureCategorySlug } from "@/utils/categoryPaths";

const ALLOWED_GROUPS = new Set(["woman", "man", "kids"]);

const CollectionCategoryPage = ({ params }) => {
  const normalizedGroup = normalizeCollectionGroup(params?.collectionGroup);
  if (!ALLOWED_GROUPS.has(normalizedGroup)) {
    notFound();
  }
  const slug = ensureCategorySlug(params?.category);
  if (!slug) {
    notFound();
  }

  return <Category slug={slug} collectionGroup={normalizedGroup} />;
};

export default CollectionCategoryPage;
