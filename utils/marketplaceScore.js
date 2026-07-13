export const calculateVendorTrustScore = ({
  productCount = 0,
  orderCount = 0,
  avgRating = 0,
  reviewCount = 0,
}) => {
  const productScore = Math.min(productCount * 8, 24);
  const orderScore = Math.min(orderCount * 6, 30);
  const ratingScore = Math.min(avgRating * 8, 40);
  const reviewScore = Math.min(reviewCount * 2, 6);
  const rawScore = Math.round(productScore + orderScore + ratingScore + reviewScore);

  return Math.max(0, Math.min(rawScore, 100));
};

export const getVendorTrustLabel = (score) => {
  if (score >= 80) return "Boutique recommandée";
  if (score >= 60) return "Boutique fiable";
  if (score >= 40) return "Boutique en croissance";
  return "Boutique récente";
};

export const formatRating = (value = 0) => Number(value).toFixed(1);
