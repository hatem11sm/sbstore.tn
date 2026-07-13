"use client";

import { useCompare } from "@/Context/CompareProvider";
import { calculateVendorTrustScore, getVendorTrustLabel } from "@/utils/marketplaceScore";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const ComparePage = () => {
  const { compareItems, clearCompare, toggleCompareItem } = useCompare();

  const insights = useMemo(() => {
    if (!compareItems.length) return null;

    const lowestPrice = [...compareItems].sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    )[0];
    const broadestSizing = [...compareItems].sort(
      (a, b) => (b.size?.length || 0) - (a.size?.length || 0)
    )[0];
    const trustLeader = [...compareItems]
      .map((product) => ({
        ...product,
        trustScore: calculateVendorTrustScore({
          productCount: 1,
          orderCount: 1,
          avgRating: 4,
          reviewCount: 1,
        }),
      }))
      .sort((a, b) => b.trustScore - a.trustScore)[0];

    return {
      lowestPrice,
      broadestSizing,
      trustLeader,
    };
  }, [compareItems]);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
              Comparateur intelligent
            </p>
            <h1 className="mt-2 text-4xl font-black text-[#16181b] sm:text-5xl">
              Compare les produits comme un client 2026
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Analyse les prix, les boutiques, les tailles et les signaux de confiance pour décider plus vite.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center border border-black/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-black transition hover:border-black"
            >
              Ajouter des produits
            </Link>
            {compareItems.length ? (
              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex items-center justify-center bg-black px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
              >
                Vider la comparaison
              </button>
            ) : null}
          </div>
        </div>

        {!compareItems.length ? (
          <div className="mt-10 border border-dashed border-black/10 p-12 text-center">
            <p className="text-lg font-semibold text-[#16181b]">
              Aucun produit à comparer pour le moment
            </p>
            <p className="mt-3 text-sm text-black/55">
              Ajoute des produits depuis le catalogue ou depuis une fiche produit pour obtenir une comparaison intelligente.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <div className="border border-black/10 bg-[#f7f4ef] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Meilleur prix
                </p>
                <p className="mt-3 text-lg font-bold text-[#16181b]">
                  {insights?.lowestPrice?.name}
                </p>
                <p className="mt-1 text-sm text-black/55">
                  {insights?.lowestPrice?.hidePrice
                    ? "Prix sur demande"
                    : `${Number(insights?.lowestPrice?.price || 0).toFixed(2)} Dt`}
                </p>
              </div>
              <div className="border border-black/10 bg-[#f7f4ef] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Tailles les plus variées
                </p>
                <p className="mt-3 text-lg font-bold text-[#16181b]">
                  {insights?.broadestSizing?.name}
                </p>
                <p className="mt-1 text-sm text-black/55">
                  {insights?.broadestSizing?.size?.length || 0} option(s)
                </p>
              </div>
              <div className="border border-black/10 bg-[#f7f4ef] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Boutique la plus rassurante
                </p>
                <p className="mt-3 text-lg font-bold text-[#16181b]">
                  {insights?.trustLeader?.vendorName}
                </p>
                <p className="mt-1 text-sm text-black/55">
                  {getVendorTrustLabel(insights?.trustLeader?.trustScore || 0)}
                </p>
              </div>
            </div>

            <div className="mt-10 overflow-x-auto border border-black/10">
              <div
                className="grid min-w-[980px] bg-white"
                style={{ gridTemplateColumns: `220px repeat(${compareItems.length}, minmax(220px, 1fr))` }}
              >
                <div className="border-r border-b border-black/10 bg-[#16181b] p-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Critère
                </div>
                {compareItems.map((item) => (
                  <div key={item._id} className="border-b border-r border-black/10 bg-white p-4">
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                      <Image
                        fill
                        src={withCloudinaryProxy(item.mainImage)}
                        alt={item.name}
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#16181b]">
                      {item.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleCompareItem(item)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/45"
                    >
                      Retirer
                    </button>
                  </div>
                ))}

                {[
                  [
                    "Prix",
                    (item) =>
                      item.hidePrice
                        ? "Prix sur demande"
                        : `${Number(item.price || 0).toFixed(2)} Dt`,
                  ],
                  ["Boutique", (item) => item.vendorName],
                  ["Catégorie", (item) => item.category],
                  [
                    "Tailles",
                    (item) => item.size?.length ? item.size.join(" / ") : "Standard",
                  ],
                  [
                    "Pourquoi le choisir",
                    (item) =>
                      `Idéal si tu veux ${item.category?.toLowerCase() || "un produit"} chez ${item.vendorName}.`,
                  ],
                ].map(([label, render]) => (
                  <>
                    <div
                      key={label}
                      className="border-r border-b border-black/10 bg-[#f7f4ef] p-4 text-sm font-semibold text-[#16181b]"
                    >
                      {label}
                    </div>
                    {compareItems.map((item) => (
                      <div
                        key={`${label}-${item._id}`}
                        className="border-r border-b border-black/10 p-4 text-sm leading-6 text-black/60"
                      >
                        {render(item)}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default ComparePage;
