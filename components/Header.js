"use client";
import Link from "next/link";
import { BsBag } from "react-icons/bs";
import Mobile from "./Mobile";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import SideCart from "./SideCart";
import { Context } from "@/Context/Context";
import { ProductContext } from "@/Context/CreateProduct";
import Image from "next/image";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import { LuAlignJustify, LuX } from "react-icons/lu";
import {
  buildCategoryPath,
  buildCategoryPathFromParts,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, handleLogout } = useContext(Context);
  const { categories } = useContext(ProductContext);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [activeCollection, setActiveCollection] = useState("woman");
  const name = user?.data?.name.replace(/ .*/, "");

  const handleCollectionNavigate = useCallback(() => {
    setShowCollectionMenu(false);
  }, []);

  const curatedCollections = useMemo(() => {
    const resolveHref = (hint, fallbackGroup = "woman") => {
      const normalizedGroup = normalizeCollectionGroup(fallbackGroup);
      const normalizedHint = (hint || "").toLowerCase();
      if (!normalizedHint) {
        return `/${normalizedGroup}`;
      }

      const exactMatch = categories?.find(
        (category) =>
          category.slug?.toLowerCase() === normalizedHint &&
          normalizeCollectionGroup(category.collectionGroup) === normalizedGroup
      );
      if (exactMatch) {
        return buildCategoryPath(exactMatch);
      }

      const looseMatch = categories?.find((category) => {
        const slug = category.slug?.toLowerCase() || "";
        const label = category.name?.toLowerCase() || "";
        return slug.includes(normalizedHint) || label.includes(normalizedHint);
      });
      if (looseMatch) {
        return buildCategoryPath(looseMatch);
      }
      return buildCategoryPathFromParts(normalizedGroup, normalizedHint);
    };

    const baseCollections = [
      {
        key: "woman",
        label: "Woman",
        slugHint: "woman",
        tagline: "Soft tailoring and elevated staples for a modern wardrobe.",
        heroImages: [
          {
            title: "Evening",
            subtitle: "Structured silhouettes",
            image: "/images/models/woman-fashion.jpg",
          },
          {
            title: "Atelier",
            subtitle: "Artful layers",
            image: "/images/models/woman-dress.jpg",
          },
        ],
        quickLinks: [
          {
            label: "View All",
            description: "Discover the complete womenswear edit",
          },
          {
            label: "Best Sellers",
            description: "Pieces our community keeps coming back to",
          },
          {
            label: "Outerwear",
            description: "Light trenches & statement coats",
          },
        ],
        features: [
          "New neutrals with architectural draping.",
          "Premium cotton poplin shirts cut in oversized volumes.",
          "Accessories designed to layer texture on texture.",
        ],
        accentImage: {
          src: "/images/models/woman-lunettes.jpg",
          caption: "Resort eyewear capsule",
        },
      },
      {
        key: "man",
        label: "Man",
        slugHint: "man",
        tagline: "Technical fabrics and precise lines for daily city rhythm.",
        heroImages: [
          {
            title: "Evening",
            subtitle: "Minimal black",
            image: "/images/models/man-fashion.jpg",
          },
          {
            title: "Athletic",
            subtitle: "Ease in motion",
            image: "/images/models/man-cap.jpg",
          },
        ],
        quickLinks: [
          {
            label: "Tailoring",
            description: "Double-breasted suits & relaxed blazers",
          },
          {
            label: "Smart Casual",
            description: "Layer-ready knitwear and soft tees",
          },
          {
            label: "Accessories",
            description: "Minimal watches and leather goods",
          },
        ],
        features: [
          "Performance outerwear with taped seams.",
          "Breathable knit polos ready for long days.",
          "Sculpted footwear for urban explorers.",
        ],
        accentImage: {
          src: "/images/models/man-watch.jpg",
          caption: "Iconic chronograph restock",
        },
      },
      {
        key: "kids",
        label: "Kids",
        slugHint: "kids",
        tagline: "Play-proof fabrics with joyful palettes.",
        heroImages: [
          {
            title: "Weekend",
            subtitle: "Relaxed denim",
            image: "/images/models/kids-fashion.jpg",
          },
          {
            title: "City Play",
            subtitle: "Soft layers",
            image: "/images/models/woman-lunettes-2.jpg",
          },
        ],
        quickLinks: [
          {
            label: "New In",
            description: "Fresh drops in playful prints",
          },
          {
            label: "Mini Essentials",
            description: "Soft basics for every day adventures",
          },
          {
            label: "Occasion Wear",
            description: "Party-ready looks with subtle shine",
          },
        ],
        features: [
          "Organic cotton sets built for movement.",
          "Vivid knitwear with tactile embroidery.",
          "Mini accessories to finish every outfit.",
        ],
        accentImage: {
          src: "/images/models/woman-lunettes-2.jpg",
          caption: "Color therapy capsule",
        },
      },
    ];

    return baseCollections.map((collection) => ({
      ...collection,
        href: resolveHref(collection.slugHint, collection.key),
        heroImages: collection.heroImages.map((tile) => ({
          ...tile,
          href: resolveHref(tile.slugHint || collection.slugHint, collection.key),
        })),
        quickLinks: collection.quickLinks.map((link) => ({
          ...link,
          href: resolveHref(link.slugHint || collection.slugHint, collection.key),
        })),
    }));
  }, [categories]);

  const groupedCategories = useMemo(() => {
    const template = {
      woman: [],
      man: [],
      kids: [],
    };

    (categories || []).forEach((category) => {
      const key = normalizeCollectionGroup(category.collectionGroup);
      if (!template[key]) {
        template[key] = [];
      }
      template[key].push(category);
    });

    return Object.entries(template).reduce((accumulator, [key, list]) => {
      accumulator[key] = [...list].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      return accumulator;
    }, {});
  }, [categories]);

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

  const activeCollectionDetails =
    curatedCollections.find(
      (collection) => collection.key === activeCollection
    ) || curatedCollections[0];
  const activeCollectionCategories =
    groupedCategories[activeCollection] || [];

  return (
    <div className="w-full relative">
      <header className="bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto flex h-24 max-w-screen-2xl items-center gap-6 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCollectionMenu(true)}
              className="relative hidden h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-900 transition hover:border-gray-900 hover:text-gray-900 md:flex"
              aria-label="Open curated collections menu"
            >
              <LuAlignJustify className="h-5 w-5" />
            </button>
            <Link className="group flex items-center gap-4" href="/">
              <span className="sr-only">Home</span>
              <Image
                src={withCloudinaryProxy("/logo/logo-black.svg")}
                alt="Logo"
                width={160}
                height={160}
                className="h-24 w-auto drop-shadow-sm"
              />
              <div className="hidden lg:flex flex-col uppercase tracking-[0.4em] text-[0.6rem] text-gray-500">
                <span className="text-gray-900 tracking-[0.6em] text-xs">
                  SBSTORE
                </span>
                <span className="text-gray-400">atelier</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-8 text-[0.7rem] font-semibold uppercase tracking-[0.4em]">
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-900"
                    href="/about"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-900"
                    href="/category"
                  >
                    Category
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-900"
                    href="/products"
                  >
                    Products
                  </Link>
                </li>

                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-900"
                    href="/contact"
                  >
                    Contact
                  </Link>
                </li>
                {user?.data?.isAdmin && (
                  <li>
                    <Link
                      className="text-gray-500 transition hover:text-gray-900"
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
              <span
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="text-gray-800 transition hover:text-gray-800/75 cursor-pointer"
              >
                <BsBag fontSize={19} />
              </span>
              {user?.data ? (
                <div className="sm:flex sm:gap-4">
                  <span className="hidden rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-[#2f4550] transition hover:text-[#2f4550]/75 sm:block">
                    {name}
                  </span>
                  <span
                    onClick={handleLogout}
                    className="hidden cursor-pointer md:block rounded-md bg-[#2f4550] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2930] "
                  >
                    Logout
                  </span>
                </div>
              ) : (
                <div className="sm:flex sm:gap-4">
                  <Link
                    href="/loginpage"
                    className="block rounded-md bg-[#2f4550] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2930] "
                  >
                    Login
                  </Link>

                  <Link
                    className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-[#2f4550] transition hover:text-[#2f4550]/75 sm:block"
                    href="/signupPage"
                  >
                    Register
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75  md:hidden"
              >
                <span className="sr-only">Toggle menu</span>
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
            aria-label="Close curated collections menu"
          >
            Close
            <LuX className="h-4 w-4" />
          </button>
          <div className="menu-fade-ltr mx-auto flex h-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row">
            <aside className="flex w-full flex-col border-b border-gray-200 pb-8 text-left md:w-64 md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <div>
                <p className="text-lg font-semibold tracking-[0.8em] text-gray-900">
                  SB / STORE
                </p>
                <p className="text-xs uppercase tracking-[0.6em] text-gray-400">
                  atelier
                </p>
                <p className="mt-12 text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                  Collections
                </p>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                {curatedCollections.map((collection) => {
                  const count =
                    groupedCategories[collection.key]?.length || 0;
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
                        {count ? `${count} categories` : "awaiting"}
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
                    {activeCollectionDetails?.label}
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold text-gray-900">
                    {activeCollectionDetails?.tagline}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-gray-500">
                    {activeCollectionDetails?.features?.[0] ||
                      "Tailored edits refreshed weekly by our studio."}
                  </p>
                </div>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                  {activeCollectionCategories.length
                    ? `${activeCollectionCategories.length} categories`
                    : "No categories yet"}
                </p>
              </div>
              <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr,0.8fr]">
                <div>
                  {activeCollectionCategories.length ? (
                    <div className="grid gap-y-3 gap-x-12 min-[480px]:grid-cols-2">
                      {activeCollectionCategories.map((category) => (
                        <Link
                          key={category._id}
                          href={buildCategoryPath(category)}
                          onClick={handleCollectionNavigate}
                          className="group border-b border-gray-200 py-3 text-left transition hover:border-gray-900"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-semibold uppercase tracking-[0.35em] text-gray-900 group-hover:text-black">
                              {category.name}
                            </span>
                          <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gray-400">
                            {normalizeCollectionGroup(
                              category.collectionGroup || activeCollection
                            )}
                          </span>
                          </div>
                          {category.subcategories?.length > 0 && (
                            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-400">
                              {category.subcategories.slice(0, 3).join("  •  ")}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Add categories to the {activeCollectionDetails?.label} group
                      from the admin dashboard to reveal them here.
                    </p>
                  )}

                  <div className="mt-10">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                      Highlights
                    </p>
                    <ul className="mt-5 space-y-2 text-sm text-gray-600">
                      {(activeCollectionDetails?.features || []).slice(0, 4).map(
                        (feature, index) => (
                          <li
                            key={`${feature}-${index}`}
                            className="flex items-start gap-3"
                          >
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-900" />
                            <span>{feature}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                {activeCollectionDetails?.accentImage && (
                  <div className="relative hidden min-h-[420px] overflow-hidden rounded-[2.5rem] border border-gray-200/70 bg-gray-50/60 shadow-inner lg:block">
                    <Image
                      src={activeCollectionDetails.accentImage.src}
                      alt={activeCollectionDetails.accentImage.caption}
                      fill
                      sizes="(min-width: 1024px) 320px, 100vw"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-[0.6rem] uppercase tracking-[0.5em] text-white/70">
                        Capsule
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {activeCollectionDetails.accentImage.caption}
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
            aria-label="Close mobile navigation"
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-md">
            <Mobile setIsOpen={setIsOpen} categories={categories} />
          </div>
        </div>
      )}
      {isCartOpen && (
        <SideCart setIsCartOpen={setIsCartOpen} isCartOpen={isCartOpen} />
      )}
    </div>
  );
};

export default Header;
