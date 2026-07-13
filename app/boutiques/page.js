"use client";

import { ProductContext } from "@/Context/CreateProduct";
import { normalizeVendorForStorefront } from "@/utils/vendorStorefront";
import Link from "next/link";
import Image from "next/image";
import { useContext, useMemo } from "react";

const italianLuxuryBoutiqueBackground =
  "/images/boutiques/italian-luxury-boutique-bg.png";

const BoutiquesPage = () => {
  const { vendors, products } = useContext(ProductContext);

  const vendorCards = useMemo(() => {
    const productList = products?.data || [];
    const countsBySlug = productList.reduce((accumulator, product) => {
      const key = product.vendorSlug || product.vendorId?.slug || "sb-store";
      accumulator[key] = {
        count: (accumulator[key] || 0) + 1,
        sample: product,
      };
      return accumulator;
    }, {});

    const normalizedVendors = (vendors || []).map((vendor) =>
      normalizeVendorForStorefront({
        ...vendor,
        productCount: countsBySlug[vendor.slug]?.count || 0,
      })
    );

    if (normalizedVendors.length) {
      return normalizedVendors.sort(
        (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)
      );
    }

    const groupedFromProducts = Object.entries(countsBySlug).map(([slug, entry]) =>
      normalizeVendorForStorefront({
        _id: entry.sample.vendorId?._id || slug,
        name: entry.sample.vendorName || entry.sample.vendorId?.name || "SB Store",
        slug,
        city: entry.sample.vendorId?.city || "Tunisie",
        description:
          entry.sample.vendorId?.description || "Vendeur actif sur la marketplace SB Store.",
        productCount: entry.count,
      })
    );

    if (groupedFromProducts.length) return groupedFromProducts;

    return [
      normalizeVendorForStorefront({
        _id: "sb-store",
        name: "SB Store",
        slug: "sb-store",
        city: "Tunis",
        description: "Boutique principale de la plateforme multi-boutiques.",
        productCount: productList.length || 0,
      }),
    ];
  }, [products, vendors]);

  return (
    <main className="boutiques-luxury min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-[#d8b66a]/20 bg-[#050505] px-4 py-16 text-white sm:px-6 lg:px-8">
        <Image
          src={italianLuxuryBoutiqueBackground}
          alt=""
          fill
          priority
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.86)_48%,rgba(5,5,5,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(216,182,106,0.22),transparent_32%)]" />
        <div className="absolute right-12 top-12 h-48 w-48 animate-pulse border border-[#d8b66a]/25" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d8b66a]">
              Marketplace italiana
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[0.9] sm:text-7xl">
              Boutiques
              <br />
              premium.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              Explorez des vitrines vendeur avec une ambiance noire et gold,
              inspirée du luxe italien.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-[#d8b66a] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#f0d38a]"
              >
                Explorer le catalogue
              </Link>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center border border-[#d8b66a]/35 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:text-[#d8b66a]"
              >
                Demander à l&apos;AI
              </Link>
            </div>
          </div>
          <div className="relative grid gap-4 sm:grid-cols-2">
            <article className="border border-[#d8b66a]/20 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b66a]/70">
                Vitrines
              </p>
              <p className="mt-3 text-xl font-bold">Chaque vendeur a son univers</p>
            </article>
            <article className="border border-[#d8b66a]/20 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b66a]/70">
                Achat
              </p>
              <p className="mt-3 text-xl font-bold">Un seul parcours client</p>
            </article>
            <article className="border border-[#d8b66a]/20 bg-white/5 p-5 backdrop-blur sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b66a]/70">
                Style
              </p>
              <p className="mt-3 text-base leading-7 text-white/72">
                Noir profond, accents dorés, photos produit fortes et mise en scène animée.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b66a]/75">
              Selezione
            </p>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl">
              Choisir une boutique
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Chaque carte ouvre une vitrine dédiée avec ses produits et son style.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendorCards.map((vendor) => (
            <article
              key={vendor._id}
              className="group flex flex-col overflow-hidden border border-[#d8b66a]/20 bg-[#101010] transition duration-500 hover:-translate-y-2 hover:border-[#d8b66a]/70"
            >
              <div
                className="relative overflow-hidden px-6 py-8 text-white"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,182,106,0.24),transparent_42%)]" />
                <div className="flex items-start justify-between gap-4">
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b66a]/75">
                      {vendor.storefrontLabel}
                    </p>
                    <h2 className="mt-3 text-2xl font-black uppercase">{vendor.name}</h2>
                    <p className="mt-2 text-sm text-white/75">
                      {vendor.tagline}
                    </p>
                  </div>
                  <span className="relative border border-[#d8b66a]/35 bg-[#d8b66a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d8b66a]">
                    {vendor.templateLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  <span className="border border-[#d8b66a]/20 bg-[#d8b66a]/10 px-3 py-1 text-[#d8b66a]">
                    {vendor.city || "Tunisie"}
                  </span>
                  <span className="border border-white/10 bg-white/5 px-3 py-1">
                    {vendor.productCount} produit(s)
                  </span>
                </div>

                <p className="mt-5 flex-1 text-sm leading-7 text-white/62">
                  {vendor.shortDescription || vendor.description}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={`/boutiques/${vendor.slug || "sb-store"}`}
                    className="inline-flex items-center justify-center bg-[#d8b66a] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#f0d38a]"
                  >
                    Ouvrir la vitrine
                  </Link>
                  <Link
                    href={`/products?vendor=${vendor.slug || "sb-store"}`}
                    className="inline-flex items-center justify-center border border-[#d8b66a]/25 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-[#d8b66a] hover:text-[#d8b66a]"
                  >
                    Voir les produits
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <style jsx global>{`
        .boutiques-luxury h1,
        .boutiques-luxury h2,
        .boutiques-luxury h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
        }
      `}</style>
    </main>
  );
};

export default BoutiquesPage;
