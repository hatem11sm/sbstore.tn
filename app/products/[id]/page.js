"use client";
import { CartContext } from "@/Context/CartProvider";
import { useCompare } from "@/Context/CompareProvider";
import { Context } from "@/Context/Context";
import RelatedProducts from "@/components/RelatedProducts";
import Skeleton from "@/components/Skeleton";
import { calculateVendorTrustScore, formatRating, getVendorTrustLabel } from "@/utils/marketplaceScore";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

const Product = () => {
  const [product, setProduct] = useState({});
  const [reviewSummary, setReviewSummary] = useState({ total: 0, average: 0 });
  const [reviews, setReviews] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { id } = useParams();
  const { cartdetails, setCartDetails, addItemToCart } =
    useContext(CartContext);
  const { compareItems, compareCount, isInCompare, toggleCompareItem } =
    useCompare();
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`/api/product/${id}`);
      setProduct(res.data.data);
    };
    const fetchReviews = async () => {
      const res = await axios.get(`/api/reviews/${id}`);
      setReviews(res.data.data || []);
      setReviewSummary(res.data.summary || { total: 0, average: 0 });
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.data?._id) return;
      try {
        const response = await axios.get("/api/wishlist");
        setWishlistItems(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    };

    fetchWishlist();
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sizes = product?.size?.length
    ? product.size
    : ["Small", "Medium", "Large", "Extra Large"];
  const selectedSize = cartdetails?.size || sizes[0];
  const productCategory = product?.category || "Collection";
  const vendorName = product?.vendorName || product?.vendorId?.name || "SB Store";
  const vendorCity = product?.vendorId?.city || "Tunisie";
  const productPriceLabel = product?.hidePrice
    ? "Prix sur demande"
    : `${Number(product?.price || 0).toFixed(2)} Dt`;
  const displayCategory =
    {
      men: "Homme",
      man: "Homme",
      women: "Femme",
      woman: "Femme",
      kids: "Enfant",
      kid: "Enfant",
    }[String(productCategory).toLowerCase()] || productCategory;
  const formatSize = (size) =>
    ({
      small: "S",
      medium: "M",
      large: "L",
      "extra large": "XL",
      xl: "XL",
    }[String(size).toLowerCase()] || size);
  const averageRating = reviewSummary.average || 0;
  const trustScore = useMemo(
    () =>
      calculateVendorTrustScore({
        productCount: 1,
        orderCount: reviewSummary.total,
        avgRating: averageRating,
        reviewCount: reviewSummary.total,
      }),
    [averageRating, reviewSummary.total]
  );
  const trustLabel = getVendorTrustLabel(trustScore);
  const isWishlisted = wishlistItems.some(
    (item) => String(item.productId?._id || item.productId) === String(product._id)
  );
  const inCompare = isInCompare(product._id);

  if (!product?.mainImage) return <Skeleton />;

  const updateQuantity = (quantity) => {
    setCartDetails({
      ...cartdetails,
      quantity: Math.max(1, quantity),
    });
  };

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user?.data?._id) return;

    try {
      setIsSubmittingReview(true);
      const response = await axios.post(`/api/reviews/${id}`, reviewForm);
      setReviewSummary(response.data.summary || { total: 0, average: 0 });
      const reviewsResponse = await axios.get(`/api/reviews/${id}`);
      setReviews(reviewsResponse.data.data || []);
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
      });
    } catch (error) {
      console.error("Failed to submit review", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWishlist = async () => {
    if (!user?.data?._id || wishlistLoading) return;

    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        const response = await axios.delete("/api/wishlist", {
          data: { productId: product._id },
        });
        setWishlistItems(response.data.data || []);
      } else {
        const response = await axios.post("/api/wishlist", {
          productId: product._id,
        });
        setWishlistItems(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="mx-auto grid max-w-screen-2xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
        <div className="grid gap-3 md:grid-cols-2">
          {[product.mainImage, product.mainImage].map((image, index) => (
            <div
              key={`${product._id}-${index}`}
              className="relative aspect-[3/4] overflow-hidden bg-neutral-100"
            >
              <Image
                fill
                src={withCloudinaryProxy(image)}
                alt={product?.name}
                sizes="(min-width: 1024px) 36vw, 100vw"
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-black/45"
          >
            <Link href="/" className="transition hover:text-black">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/products" className="transition hover:text-black">
              Produits
            </Link>
            <span>/</span>
            <span className="text-black">{displayCategory}</span>
          </nav>

          <div className="border-b border-black/10 pb-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-black/45">
                  {displayCategory}
                </p>
                <h1 className="mt-3 text-3xl font-semibold uppercase leading-tight text-black sm:text-4xl">
                  {product?.name}
                </h1>
                <p className="mt-3 inline-flex border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-black/55">
                  Vendu par {vendorName}
                </p>
              </div>
              <p className="whitespace-nowrap rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                {productPriceLabel}
              </p>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-6 text-black/60">
              {product?.description ||
                "Une piece selectionnee par SB Store pour completer vos tenues du quotidien avec simplicite et style."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                "Livraison en Tunisie",
                "Paiement en TND",
                `${formatRating(averageRating)} / 5 avis`,
              ].map((item) => (
                  <div
                    key={item}
                    className="border border-black/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-black/70"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-b border-black/10 py-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-black">
                Taille
              </p>
              <span className="text-xs uppercase tracking-[0.16em] text-black/40">
                Choisissez une option
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {sizes.map((size) => {
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setCartDetails({
                        ...cartdetails,
                        size,
                      })
                    }
                    className={`border px-4 py-3 text-xs uppercase tracking-[0.16em] transition ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-black hover:border-black"
                    }`}
                  >
                    {formatSize(size)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-b border-black/10 py-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-black">
              Quantité
            </p>
            <div className="mt-4 flex w-36 border border-black/10">
              <button
                type="button"
                onClick={() => updateQuantity(cartdetails.quantity - 1)}
                className="h-11 w-11 text-xl text-black/60 transition hover:text-black"
                aria-label="Diminuer la quantité"
              >
                -
              </button>
              <input
                type="number"
                className="h-11 w-14 border-x border-black/10 text-center text-sm outline-none"
                value={cartdetails.quantity}
                readOnly
              />
              <button
                type="button"
                onClick={() => updateQuantity(cartdetails.quantity + 1)}
                className="h-11 w-11 text-xl text-black/60 transition hover:text-black"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
          </div>

          <div className="py-8">
            <div className="grid gap-3">
              {product?.hidePrice ? (
                <Link
                  href={`/assistant?q=${encodeURIComponent(`Je veux connaitre le prix de ${product?.name} chez ${vendorName}`)}`}
                  className="flex w-full items-center justify-center bg-black px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
                >
                  Demander le prix
                </Link>
              ) : user?.data ? (
                <button
                  onClick={() => addItemToCart(product)}
                  className="flex w-full items-center justify-center bg-black px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
                >
                  Ajouter au panier
                </button>
              ) : (
                <Link
                  href="/loginpage"
                  className="flex w-full items-center justify-center bg-black px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
                >
                  Connectez-vous pour commander
                </Link>
              )}

              {user?.data ? (
                <button
                  type="button"
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="flex w-full items-center justify-center border border-black/10 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:border-black"
                >
                  {isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => toggleCompareItem(product)}
                className="flex w-full items-center justify-center border border-black/10 px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:border-black"
              >
                {inCompare ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
              </button>
              {compareCount ? (
                <Link
                  href="/compare"
                  className="flex w-full items-center justify-center bg-[#f7f4ef] px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:bg-[#efe8dc]"
                >
                  Voir le comparateur ({compareItems.length})
                </Link>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 border border-black/10 bg-[#f7f4ef] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                    Score boutique
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#16181b]">
                    {trustScore}/100
                  </p>
                </div>
                <span className="border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/60">
                  {trustLabel}
                </span>
              </div>
              <p className="text-sm leading-6 text-black/60">
                Basé sur la note moyenne, le nombre d&apos;avis et la présence de la boutique sur la marketplace.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="border border-black/10 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">
                    Note
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#16181b]">
                    {formatRating(averageRating)} / 5
                  </p>
                </div>
                <div className="border border-black/10 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">
                    Avis
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#16181b]">
                    {reviewSummary.total}
                  </p>
                </div>
                <div className="border border-black/10 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">
                    Ville
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#16181b]">
                    {vendorCity}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 border-t border-black/10 pt-8 text-sm text-black/60">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-black">
                  Détails du produit
                  <span className="text-lg group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-6">
                  Catégorie : {displayCategory}. Sous-catégorie :{" "}
                  {product?.subcategory || "Sélection essentielle"}. Boutique :{" "}
                  {vendorName}.
                </p>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-black">
                  Livraison et échange
                  <span className="text-lg group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-6">
                  Contactez SB Store pour confirmer la disponibilite, la
                  livraison et les possibilités d’échange avant validation de
                  la commande.
                </p>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-black">
                  Besoin d’aide ?
                  <span className="text-lg group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-6">
                  Pour une question de taille, de couleur ou de disponibilité,
                  contactez-nous directement depuis la page contact.
                </p>
              </details>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pb-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="border border-black/10 bg-[#f7f4ef] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Innovation 2026
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#16181b]">
              Une fiche produit qui ne vend pas seulement un article, mais aussi la confiance
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-black/60">
              <li>Favoris pour revenir plus tard.</li>
              <li>Avis clients pour rassurer l&apos;achat.</li>
              <li>Score boutique pour comparer rapidement les vendeurs.</li>
              <li>Parcours marketplace clair entre produit, boutique et AI.</li>
            </ul>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Avis clients
                </p>
                <h2 className="mt-3 text-2xl font-bold text-[#16181b]">
                  Retour d&apos;expérience
                </h2>
              </div>
              <span className="text-sm font-semibold text-black/60">
                {formatRating(averageRating)} / 5
              </span>
            </div>

            {user?.data ? (
              <form onSubmit={handleReviewSubmit} className="mt-6 grid gap-4 border border-black/10 bg-[#f7f4ef] p-4">
                <div className="grid gap-2 sm:grid-cols-[140px,1fr] sm:items-center">
                  <label className="text-sm font-medium text-black/70">Note</label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} / 5
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  name="title"
                  value={reviewForm.title}
                  onChange={handleReviewChange}
                  placeholder="Titre de l'avis"
                  className="border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
                <textarea
                  name="comment"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  placeholder="Partage ton retour sur ce produit"
                  className="border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center justify-center bg-black px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700 disabled:opacity-60"
                >
                  {isSubmittingReview ? "Envoi..." : "Publier l'avis"}
                </button>
              </form>
            ) : (
              <Link
                href="/loginpage"
                className="mt-6 inline-flex items-center justify-center border border-black/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-black transition hover:border-black"
              >
                Connectez-vous pour laisser un avis
              </Link>
            )}

            <div className="mt-6 space-y-4">
              {reviews.length ? (
                reviews.map((review) => (
                  <article
                    key={review._id}
                    className="border border-black/10 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#16181b]">
                          {review.title || "Avis client"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/45">
                          {review.userName}
                        </p>
                      </div>
                      <span className="border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black/60">
                        {review.rating} / 5
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/60">
                      {review.comment}
                    </p>
                  </article>
                ))
              ) : (
                <div className="border border-dashed border-black/10 p-6 text-center text-sm text-black/50">
                  Aucun avis pour le moment. Cette section montrera aux futurs clients que la boutique inspire confiance.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RelatedProducts id={id} />
    </main>
  );
};

export default Product;
