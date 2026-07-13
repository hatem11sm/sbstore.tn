"use client";
import Link from "next/link";
import { BsBag, BsSearch } from "react-icons/bs";
import Mobile from "./Mobile";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import SideCart from "./SideCart";
import QuickSearch from "./QuickSearch";
import { Context } from "@/Context/Context";
import { useCompare } from "@/Context/CompareProvider";
import { ProductContext } from "@/Context/CreateProduct";
import Image from "next/image";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import { LuX } from "react-icons/lu";
import { normalizeVendorForStorefront } from "@/utils/vendorStorefront";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, handleLogout } = useContext(Context);
  const { compareCount } = useCompare();
  const { categories, vendors, products } = useContext(ProductContext);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [activeCollection, setActiveCollection] = useState("sb-store");
  const name = user?.data?.name.replace(/ .*/, "");

  const handleCollectionNavigate = useCallback(() => {
    setShowCollectionMenu(false);
  }, []);

  const curatedCollections = useMemo(() => {
    const productList = products?.data || [];
    const countsBySlug = productList.reduce((acc, product) => {
      const key = product.vendorSlug || product.vendorId?.slug || "sb-store";
      acc[key] = {
        count: (acc[key]?.count || 0) + 1,
        categories: [
          ...(acc[key]?.categories || []),
          product.category,
        ].filter(Boolean),
      };
      return acc;
    }, {});

    const normalizedVendors = (vendors || []).map((vendor) => {
      const stats = countsBySlug[vendor.slug] || { count: 0, categories: [] };
      const storefront = normalizeVendorForStorefront(vendor);
      return {
        key: storefront.slug,
        href: `/boutiques/${storefront.slug}`,
        label: storefront.name,
        tagline: storefront.tagline,
        templateLabel: storefront.templateLabel,
        storefrontLabel: storefront.storefrontLabel,
        city: storefront.city || "Tunisie",
        banner: storefront.banner,
        logo: storefront.logo,
        shortDescription: storefront.shortDescription,
        accentColor: storefront.accentColor,
        productCount: stats.count,
        categories: [...new Set(stats.categories)].slice(0, 6),
        quickLinks: [
          {
            label: "Ouvrir la vitrine",
            description: "Voir la mini-boutique",
            href: `/boutiques/${storefront.slug}`,
          },
          {
            label: "Voir les produits",
            description: "Parcourir le catalogue vendeur",
            href: `/products?vendor=${storefront.slug}`,
          },
          {
            label: "Demander à l'AI",
            description: "Recommandations guidées",
            href: `/assistant?q=${encodeURIComponent(`Montre-moi les produits de ${storefront.name}`)}`,
          },
        ],
      };
    });

    if (normalizedVendors.length) {
      return normalizedVendors.sort(
        (a, b) => b.productCount - a.productCount || a.label.localeCompare(b.label)
      );
    }

    return [
      {
        key: "sb-store",
        href: "/boutiques",
        label: "SB Store",
        tagline: "Votre plateforme multi-boutiques en Tunisie.",
        templateLabel: "Minimal",
        storefrontLabel: "Édition minimal",
        city: "Tunisie",
        banner: "/images/models/woman-fashion.jpg",
        logo: "/logo/logo-black.svg",
        shortDescription: "Catalogue commun, vitrines vendeur, AI et comparaison.",
        accentColor: "#16181b",
        productCount: productList.length,
        categories: [],
        quickLinks: [
          { label: "Voir les boutiques", description: "Explorer les vitrines", href: "/boutiques" },
          { label: "Voir les produits", description: "Parcourir le catalogue", href: "/products" },
          { label: "Demander à l'AI", description: "Trouver un produit", href: "/assistant" },
        ],
      },
    ];
  }, [products, vendors]);

  useEffect(() => {
    if (!curatedCollections.length) return;
    const exists = curatedCollections.some(
      (collection) => collection.key === activeCollection
    );
    if (!exists) {
      setActiveCollection(curatedCollections[0].key);
    }
  }, [activeCollection, curatedCollections]);

  useEffect(() => {
    if (!showCollectionMenu) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowCollectionMenu(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showCollectionMenu]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isSearchShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isSearchShortcut) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeCollectionDetails =
    curatedCollections.find(
      (collection) => collection.key === activeCollection
    ) || curatedCollections[0];
  const activeCollectionCategories = activeCollectionDetails?.categories || [];

  return (
    <div className="w-full relative">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="border-b border-black/10 bg-black px-4 py-2 text-white">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <span>SB Store: votre plateforme multi-boutiques en Tunisie</span>
            <span className="text-white/70">
              Livraison Tunisie • Support WhatsApp • Paiement simple
            </span>
          </div>
        </div>
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-6 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <Link className="group flex items-center gap-4" href="/">
              <span className="sr-only">Home</span>
              <Image
                src={withCloudinaryProxy("/logo/logo-black.svg")}
                alt="Logo"
                width={160}
                height={160}
                className="h-12 w-auto"
              />
              <div className="hidden lg:flex flex-col uppercase tracking-[0.35em] text-[0.58rem] text-gray-500">
                <span className="text-black tracking-[0.45em] text-[0.65rem]">
                  SB STORE
                </span>
                <span className="text-gray-400">multi-boutiques</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-7 text-[0.72rem] font-medium uppercase tracking-[0.18em]">
                <li>
                  <Link
                    className="text-black/60 transition hover:text-black"
                    href="/boutiques"
                  >
                    Boutiques
                  </Link>
                </li>

                <li>
                  <Link
                    className="text-black/60 transition hover:text-black"
                    href="/products"
                  >
                    Produits
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-black/60 transition hover:text-black"
                    href="/assistant"
                  >
                    Assistant
                  </Link>
                </li>
                <li className="hidden xl:block">
                  <Link
                    className="text-black/60 transition hover:text-black"
                    href="/compare"
                  >
                    Compare
                  </Link>
                </li>
                {user?.data?.isAdmin && (
                  <li>
                    <Link
                      className="text-black/60 transition hover:text-black"
                      href="/dashboard"
                      onClick={(e) => {
                        if (!user?.data?.isAdmin) {
                          e.preventDefault();
                          return;
                        }
                      }}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden h-10 items-center gap-3 border border-black/10 bg-white px-3 text-xs font-medium uppercase tracking-[0.16em] text-black/60 transition hover:border-black hover:text-black lg:flex"
                aria-label="Ouvrir la recherche rapide"
              >
                <BsSearch className="h-4 w-4" />
                Rechercher
                <kbd className="border border-black/10 px-1.5 py-0.5 text-[0.55rem] text-black/35">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white text-black transition hover:border-black lg:hidden"
                aria-label="Ouvrir la recherche rapide"
              >
                <BsSearch className="h-4 w-4" />
              </button>
              <Link
                href="/compare"
                className="hidden h-10 items-center justify-center border border-black/10 bg-white px-3 text-xs font-medium uppercase tracking-[0.16em] text-black/60 transition hover:border-black hover:text-black xl:inline-flex"
              >
                Compare {compareCount ? `(${compareCount})` : ""}
              </Link>
              <span
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center border border-black/10 bg-white text-black transition hover:border-black"
              >
                <BsBag fontSize={19} />
              </span>
              {user?.data ? (
                <div className="sm:flex sm:gap-4">
                  <span className="hidden border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black sm:block">
                    {name}
                  </span>
                  <span
                    onClick={handleLogout}
                    className="hidden cursor-pointer bg-black px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700 md:block"
                  >
                    Déconnexion
                  </span>
                </div>
              ) : (
                <div className="sm:flex sm:gap-4">
                  <Link
                    href="/loginpage"
                    className="block bg-black px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
                  >
                    Connexion
                  </Link>

                  <Link
                    className="hidden border border-black/10 bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black transition hover:border-black sm:block"
                    href="/signupPage"
                  >
                    Inscription
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden border border-black/10 bg-white p-2.5 text-black transition hover:border-black"
              >
                <span className="sr-only">Ouvrir le menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      {showCollectionMenu && activeCollectionDetails && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur">
          <button
            onClick={() => setShowCollectionMenu(false)}
            className="absolute right-8 top-8 flex items-center gap-3 rounded-full border border-gray-300 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gray-500 transition hover:border-gray-600 hover:text-gray-900"
            aria-label="Fermer le menu des collections"
          >
            Fermer
            <LuX className="h-4 w-4" />
          </button>
          <div className="menu-fade-ltr mx-auto flex h-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row">
            <aside className="flex w-full flex-col border-b border-gray-200 pb-8 text-left md:w-64 md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <div>
                <p className="text-lg font-semibold tracking-[0.8em] text-gray-900">
                  SB / STORE
                </p>
                <p className="text-xs uppercase tracking-[0.6em] text-gray-400">
                  multi-boutiques
                </p>
                <p className="mt-12 text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                  Boutiques
                </p>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {curatedCollections.map((collection) => {
                  const count = collection.productCount || 0;
                  const isActive = activeCollection === collection.key;
                  return (
                    <button
                      key={collection.key}
                      onMouseEnter={() => setActiveCollection(collection.key)}
                      onClick={() => setActiveCollection(collection.key)}
                      className={`flex flex-col gap-2 border-l px-5 py-3 text-left transition ${
                        isActive
                          ? "border-gray-900 text-gray-900"
                          : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-xl font-medium uppercase tracking-[0.45em]">
                        {collection.label}
                      </span>
                      <span className="text-[0.6rem] uppercase tracking-[0.4em] text-gray-400">
                        {count ? `${count} produits` : "vitrine prête"}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>
            <section className="flex-1 overflow-y-auto pb-6">
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                    {activeCollectionDetails?.storefrontLabel}
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold text-gray-900">
                    {activeCollectionDetails?.tagline}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-gray-500">
                    {activeCollectionDetails?.shortDescription ||
                      "Une mini-boutique reliée au catalogue, à l'AI et au comparateur."}
                  </p>
                </div>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                  {activeCollectionDetails?.templateLabel || "Template"}
                </p>
              </div>
              <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr,0.8fr]">
                <div>
                  {activeCollectionCategories.length ? (
                    <div className="grid gap-y-3 gap-x-12 min-[480px]:grid-cols-2">
                      {activeCollectionCategories.map((category, index) => (
                        <Link
                          key={`${category}-${index}`}
                          href={`/products?vendor=${activeCollectionDetails.key}`}
                          onClick={handleCollectionNavigate}
                          className="group border-b border-gray-200 py-3 text-left transition hover:border-gray-900"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-semibold uppercase tracking-[0.35em] text-gray-900 group-hover:text-black">
                              {category}
                            </span>
                            <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gray-400">
                              catalogue
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Cette boutique n&apos;a pas encore de catégories mises en avant.
                      Tu peux quand même ouvrir sa vitrine ou son catalogue complet.
                    </p>
                  )}

                  <div className="mt-10">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                      Actions boutique
                    </p>
                    <ul className="mt-5 space-y-2 text-sm text-gray-600">
                      {(activeCollectionDetails?.quickLinks || []).slice(0, 4).map(
                        (feature) => (
                          <li
                            key={feature.label}
                            className="flex items-start gap-3"
                          >
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-900" />
                            <Link
                              href={feature.href}
                              onClick={handleCollectionNavigate}
                              className="transition hover:text-black"
                            >
                              <span className="font-semibold text-gray-900">
                                {feature.label}
                              </span>
                              <span className="ml-2 text-gray-500">
                                {feature.description}
                              </span>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                {activeCollectionDetails?.banner && (
                  <div className="relative hidden min-h-[420px] overflow-hidden rounded-[2.5rem] border border-gray-200/70 bg-gray-50/60 shadow-inner lg:block">
                    <Image
                      src={withCloudinaryProxy(activeCollectionDetails.banner)}
                      alt={activeCollectionDetails.label}
                      fill
                      sizes="(min-width: 1024px) 320px, 100vw"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-[0.6rem] uppercase tracking-[0.5em] text-white/70">
                        Boutique
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {activeCollectionDetails.label}
                      </p>
                      <p className="mt-2 text-sm text-white/75">
                        {activeCollectionDetails.city} • {activeCollectionDetails.templateLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fermer la navigation mobile"
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-md">
            <Mobile setIsOpen={setIsOpen} categories={categories} vendors={vendors} products={products?.data || []} />
          </div>
        </div>
      )}
      {isCartOpen && (
        <SideCart setIsCartOpen={setIsCartOpen} isCartOpen={isCartOpen} />
      )}
      <QuickSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default Header;
