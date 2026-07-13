"use client";
import HeroBanner from "../components/HeroBanner";
import HomeProducts from "../components/HomeProducts";
import { ProductContext } from "../Context/CreateProduct";
import { normalizeVendorForStorefront } from "../utils/vendorStorefront";
import Link from "next/link";
import { useContext, useMemo, useState } from "react";

export default function Home() {
  const [show] = useState(true);
  const { vendors, products } = useContext(ProductContext);
  const productList = useMemo(() => products?.data || [], [products]);

  const featuredVendors = useMemo(() => {
    const countsBySlug = productList.reduce((accumulator, product) => {
      const key = product.vendorSlug || product.vendorId?.slug || "sb-store";
      accumulator[key] = {
        count: (accumulator[key]?.count || 0) + 1,
        sample: product,
      };
      return accumulator;
    }, {});

    const normalizedVendors = (vendors || []).map((vendor) => {
      const vendorCount = countsBySlug[vendor.slug];
      return normalizeVendorForStorefront({
        _id: vendor._id,
        name: vendor.name,
        slug: vendor.slug,
        city: vendor.city || "Tunisie",
        description:
          vendor.description ||
          "Boutique partenaire presente sur la plateforme SB Store.",
        productCount: vendorCount?.count || 0,
      });
    });

    if (normalizedVendors.length) {
      return normalizedVendors
        .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
        .slice(0, 3);
    }

    const groupedFromProducts = Object.entries(countsBySlug).map(([slug, entry]) =>
      normalizeVendorForStorefront({
        _id: entry.sample.vendorId?._id || slug,
        name: entry.sample.vendorName || entry.sample.vendorId?.name || "SB Store",
        slug,
        city: entry.sample.vendorId?.city || "Tunisie",
        description: "Boutique partenaire presente sur la plateforme SB Store.",
        productCount: entry.count,
      })
    );

    if (groupedFromProducts.length) {
      return groupedFromProducts.slice(0, 3);
    }

    return [
      normalizeVendorForStorefront({
        _id: "sb-store",
        name: "SB Store",
        slug: "sb-store",
        city: "Tunisie",
        description: "Selection principale de la plateforme multi-boutiques.",
        productCount: productList.length || 0,
      }),
    ];
  }, [productList, vendors]);

  return (
    <main className="flex flex-col bg-white">
      <HeroBanner />

      <section className="border-y border-black/10 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1fr,1fr,1fr]">
          <Link
            href="/boutiques"
            className="group border border-black bg-black p-6 text-white transition hover:bg-[#202226]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Multi-boutiques
            </p>
            <h2 className="mt-3 text-3xl font-black leading-none">
              Choisir une boutique
            </h2>
            <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-white">
              Voir les vitrines
            </span>
          </Link>

          <Link
            href="/products"
            className="group border border-black/10 bg-[#f7f4ef] p-6 transition hover:border-black"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Catalogue
            </p>
            <h2 className="mt-3 text-3xl font-black leading-none text-[#16181b]">
              Voir tous les produits
            </h2>
            <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-black">
              Acheter maintenant
            </span>
          </Link>

          <Link
            href="/assistant"
            className="group border border-black/10 bg-white p-6 transition hover:border-black"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Besoin précis
            </p>
            <h2 className="mt-3 text-3xl font-black leading-none text-[#16181b]">
              Demander à l&apos;assistant
            </h2>
            <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-black">
              Trouver plus vite
            </span>
          </Link>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                Boutiques
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#16181b] sm:text-4xl">
                Acheter par vendeur
              </h2>
            </div>
            <Link
              href="/boutiques"
              className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.16em] text-black"
            >
              Toutes les boutiques
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredVendors.map((vendor) => (
              <article
                key={vendor._id}
                className="overflow-hidden border border-black/10 bg-white"
              >
                <div
                  className="p-6 text-white"
                  style={{ backgroundColor: vendor.accentColor }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                    {vendor.city || "Tunisie"}
                  </p>
                  <h3 className="mt-3 text-2xl font-black">{vendor.name}</h3>
                  <p className="mt-2 text-sm text-white/75">
                    {vendor.productCount} produit(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 p-5">
                  <Link
                    href={`/boutiques/${vendor.slug}`}
                    className="inline-flex items-center justify-center bg-black px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
                  >
                    Ouvrir
                  </Link>
                  <Link
                    href={`/products?vendor=${vendor.slug}`}
                    className="inline-flex items-center justify-center border border-black/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-black transition hover:border-black"
                  >
                    Produits
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ef] px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
              Nouveautés
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#16181b] sm:text-4xl">
              Derniers produits
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.16em] text-black"
          >
            Voir le catalogue
          </Link>
        </div>
      </section>
      <HomeProducts show={show} />
    </main>
  );
}
