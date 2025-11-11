"use client";
import { useMemo, useContext } from "react";
import Link from "next/link";
import { Context } from "@/Context/Context";
import {
  buildCategoryPath,
  buildCategoryPathFromParts,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";

const collectionMeta = [
  {
    key: "woman",
    label: "Woman",
    description: "Soft tailoring, new minimal details.",
    gradient: "from-[#fef3f2] via-white to-[#fde6ef]",
    fallbackSlug: "woman",
  },
  {
    key: "man",
    label: "Man",
    description: "Technical layers for daily rhythm.",
    gradient: "from-[#f1f5f9] via-white to-[#e2e8f0]",
    fallbackSlug: "man",
  },
  {
    key: "kids",
    label: "Kids",
    description: "Play-proof fabrics and color stories.",
    gradient: "from-[#faf5ff] via-white to-[#f3e8ff]",
    fallbackSlug: "kids",
  },
];

const Mobile = ({ setIsOpen, categories }) => {
  const { user, handleLogout } = useContext(Context);
  const name = user?.data?.name?.replace(/ .*/, "");

  const groupedCategories = useMemo(() => {
    const template = collectionMeta.reduce((acc, collection) => {
      acc[collection.key] = [];
      return acc;
    }, {});

    (categories || []).forEach((category) => {
      const key =
        normalizeCollectionGroup(category.collectionGroup) || "woman";
      if (!template[key]) {
        template[key] = [];
      }
      template[key].push(category);
    });

    return Object.keys(template).reduce((acc, key) => {
      acc[key] = [...template[key]].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      return acc;
    }, {});
  }, [categories]);

  const closeMenu = () => setIsOpen(false);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Category", href: "/category" },
    { label: "Products", href: "/products" },
    { label: "Contact", href: "/contact" },
    user?.data?.isAdmin
      ? {
          label: "Admin",
          href: "/dashboard",
        }
      : null,
  ].filter(Boolean);

  const renderCategoryLink = (category) => {
    const groupLabel =
      normalizeCollectionGroup(category.collectionGroup) || "woman";
    return (
      <Link
        key={category._id}
        href={buildCategoryPath(category)}
        onClick={closeMenu}
        className="group flex items-center justify-between rounded-2xl border border-gray-200/70 px-4 py-3 text-left transition hover:border-gray-900"
      >
        <span className="text-base font-semibold uppercase tracking-[0.35em] text-gray-900 group-hover:text-black">
          {category.name}
        </span>
        <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gray-400">
          {groupLabel}
        </span>
      </Link>
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-white text-gray-900 shadow-2xl md:hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex flex-col uppercase tracking-[0.4em] text-[0.6rem] text-gray-500"
        >
          <span className="text-gray-900 tracking-[0.6em] text-xs">SBSTORE</span>
          <span className="text-gray-400">atelier</span>
        </Link>
        <button
          onClick={closeMenu}
          className="rounded-full border border-gray-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gray-500 transition hover:border-gray-900 hover:text-gray-900"
        >
          Close
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
            Collections
          </p>
          {collectionMeta.map((collection) => {
            const categoriesForCollection =
              groupedCategories[collection.key] || [];
            return (
              <article
                key={collection.key}
                className={`rounded-3xl border border-gray-100 bg-gradient-to-br ${collection.gradient} p-5 shadow-sm`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-gray-500">
                      {collection.label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                      {collection.description}
                    </h3>
                  </div>
                  <Link
                    href={buildCategoryPathFromParts(
                      normalizeCollectionGroup(collection.key),
                      collection.fallbackSlug
                    )}
                    onClick={closeMenu}
                    className="rounded-full border border-gray-900 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-gray-900 transition hover:bg-gray-900 hover:text-white"
                  >
                    Shop
                  </Link>
                </div>
                {categoriesForCollection.length ? (
                  <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                    {categoriesForCollection.slice(0, 6).map((category) =>
                      renderCategoryLink(category)
                    )}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-gray-500">
                    Add categories to the {collection.label} group to populate
                    this section.
                  </p>
                )}
              </article>
            );
          })}
        </section>

        <section className="mt-10">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
            Account
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {user?.data ? (
              <>
                <div className="rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                    Signed in as
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
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/loginpage"
                  onClick={closeMenu}
                  className="rounded-full border border-gray-900 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signupPage"
                  onClick={closeMenu}
                  className="rounded-full border border-gray-200 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="border-t border-gray-100 px-6 py-4 text-[0.6rem] uppercase tracking-[0.4em] text-gray-400">
        {user?.data ? "Studio wardrobe, tailored for you." : "Discover the edit."}
      </div>
    </div>
  );
};

export default Mobile;
