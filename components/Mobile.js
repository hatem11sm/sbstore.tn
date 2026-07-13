"use client";
import { useMemo, useContext } from "react";
import Link from "next/link";
import { Context } from "@/Context/Context";
import { useCompare } from "@/Context/CompareProvider";
import { normalizeVendorForStorefront } from "@/utils/vendorStorefront";

const Mobile = ({ setIsOpen, vendors, products }) => {
  const { user, handleLogout } = useContext(Context);
  const { compareCount } = useCompare();
  const name = user?.data?.name?.replace(/ .*/, "");

  const storefronts = useMemo(() => {
    const countsBySlug = (products || []).reduce((acc, product) => {
      const key = product.vendorSlug || product.vendorId?.slug || "sb-store";
      acc[key] = {
        count: (acc[key]?.count || 0) + 1,
        categories: [...(acc[key]?.categories || []), product.category].filter(Boolean),
      };
      return acc;
    }, {});

    return (vendors || [])
      .map((vendor) => {
        const storefront = normalizeVendorForStorefront(vendor);
        const stats = countsBySlug[storefront.slug] || { count: 0, categories: [] };
        return {
          ...storefront,
          productCount: stats.count,
          categories: [...new Set(stats.categories)].slice(0, 4),
        };
      })
      .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
  }, [products, vendors]);

  const closeMenu = () => setIsOpen(false);

  const quickLinks = [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/about" },
    { label: "AI", href: "/assistant" },
    { label: "Boutiques", href: "/boutiques" },
    { label: compareCount ? `Compare (${compareCount})` : "Compare", href: "/compare" },
    { label: "Catégories", href: "/category" },
    { label: "Produits", href: "/products" },
    { label: "Contact", href: "/contact" },
    user?.data?.isAdmin
      ? {
          label: "Admin",
          href: "/dashboard",
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="relative flex h-full w-full flex-col bg-white text-gray-900 shadow-2xl md:hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex flex-col uppercase tracking-[0.4em] text-[0.6rem] text-gray-500"
        >
          <span className="text-gray-900 tracking-[0.6em] text-xs">SB STORE</span>
          <span className="text-gray-400">multi-boutiques</span>
        </Link>
        <button
          onClick={closeMenu}
          className="rounded-full border border-gray-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gray-500 transition hover:border-gray-900 hover:text-gray-900"
        >
          Fermer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8">
        <section>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
            Navigation
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-full border border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-5">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
            Boutiques
          </p>
          {storefronts.length ? (
            storefronts.map((storefront) => (
              <article
                key={storefront._id || storefront.slug}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-gray-500">
                      {storefront.storefrontLabel}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                      {storefront.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {storefront.tagline}
                    </p>
                  </div>
                  <Link
                    href={`/boutiques/${storefront.slug}`}
                    onClick={closeMenu}
                    className="rounded-full border border-gray-900 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-gray-900 transition hover:bg-gray-900 hover:text-white"
                  >
                    Voir
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.35em] text-gray-500">
                  <span className="rounded-full border border-gray-200 px-3 py-1">
                    {storefront.templateLabel}
                  </span>
                  <span className="rounded-full border border-gray-200 px-3 py-1">
                    {storefront.productCount} produits
                  </span>
                  <span className="rounded-full border border-gray-200 px-3 py-1">
                    {storefront.city || "Tunisie"}
                  </span>
                </div>
                {storefront.categories.length ? (
                  <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                    {storefront.categories.map((category) => (
                      <Link
                        key={`${storefront.slug}-${category}`}
                        href={`/products?vendor=${storefront.slug}`}
                        onClick={closeMenu}
                        className="group flex items-center justify-between rounded-2xl border border-gray-200/70 px-4 py-3 text-left transition hover:border-gray-900"
                      >
                        <span className="text-base font-semibold uppercase tracking-[0.2em] text-gray-900 group-hover:text-black">
                          {category}
                        </span>
                        <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gray-400">
                          voir
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
              Aucune boutique configurée pour le moment.
            </p>
          )}
        </section>

        <section className="mt-10">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
            Compte
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {user?.data ? (
              <>
                <div className="rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                    Connecté en tant que
                  </p>
                  <p className="mt-2 text-lg font-semibold">{name}</p>
                  <p className="text-sm text-gray-500">{user?.data?.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="rounded-full border border-gray-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/loginpage"
                  onClick={closeMenu}
                  className="rounded-full border border-gray-900 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/signupPage"
                  onClick={closeMenu}
                  className="rounded-full border border-gray-200 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="border-t border-gray-100 px-6 py-4 text-[0.6rem] uppercase tracking-[0.4em] text-gray-400">
        {user?.data ? "Votre selection SB Store vous attend." : "Decouvrez les boutiques."}
      </div>
    </div>
  );
};

export default Mobile;
