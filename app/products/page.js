"use client";

import { useCompare } from "@/Context/CompareProvider";
import { ProductContext } from "@/Context/CreateProduct";
import slugify from "@/utils/slugify";
import { buildCategoryKey } from "@/utils/categoryPaths";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";

const SIZE_OPTIONS = ["Small", "Medium", "Large", "Extra Large"];

const COLOR_META = [
  { id: "black", label: "Black", swatch: "#111111", keywords: [/black/i, /noir/i] },
  { id: "white", label: "White", swatch: "#f8fafc", keywords: [/white/i, /blanc/i] },
  { id: "blue", label: "Blue", swatch: "#2563eb", keywords: [/blue/i, /navy/i, /azure/i] },
  { id: "green", label: "Green", swatch: "#16a34a", keywords: [/green/i, /emerald/i, /olive/i] },
  { id: "red", label: "Red", swatch: "#dc2626", keywords: [/red/i, /rouge/i, /crimson/i] },
  { id: "neutral", label: "Neutral", swatch: "#9ca3af", keywords: [] },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Mise en avant" },
  { value: "recent", label: "Plus récents" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name-asc", label: "Nom A → Z" },
  { value: "name-desc", label: "Nom Z → A" },
];

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const extractColorToken = (product) => {
  const haystack = `${product?.name ?? ""} ${product?.description ?? ""}`.toLowerCase();
  for (const meta of COLOR_META) {
    if (meta.keywords.some((regex) => regex.test(haystack))) {
      return meta.id;
    }
  }
  return "neutral";
};

const parseObjectIdDate = (objectId) => {
  if (!objectId || typeof objectId !== "string" || objectId.length < 8) {
    return new Date(0);
  }
  const timestamp = parseInt(objectId.substring(0, 8), 16);
  return new Date(timestamp * 1000);
};

const ProductsContent = () => {
  const { products, categories } = useContext(ProductContext);
  const { compareCount, isInCompare, toggleCompareItem } = useCompare();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const vendorFromQuery = searchParams.get("vendor");
    const searchFromQuery = searchParams.get("q");
    const subcategoryFromQuery = searchParams.get("subcategory");

    if (vendorFromQuery) {
      setSelectedVendors((current) =>
        current.includes(vendorFromQuery) ? current : [vendorFromQuery]
      );
    }

    if (subcategoryFromQuery) {
      setSelectedSubcategories((current) =>
        current.includes(subcategoryFromQuery)
          ? current
          : [subcategoryFromQuery]
      );
    }

    if (searchFromQuery) {
      setSearchQuery(searchFromQuery);
    }
  }, [searchParams]);

  const categoryOptions = useMemo(() => {
    if (!categories?.length) return [];
    return categories
      .map((category) => ({
        label: `${category.name} · ${
          (category.collectionGroup || "woman").toUpperCase()
        }`,
        value: buildCategoryKey(category),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const rawProducts = useMemo(() => products?.data ?? [], [products]);

  const preparedProducts = useMemo(
    () =>
      rawProducts.map((product) => {
        const colorToken = extractColorToken(product);
        const createdAt =
          product.createdAt || product.updatedAt
            ? new Date(product.updatedAt ?? product.createdAt)
            : parseObjectIdDate(product._id);
        const normalizedSlug = product.categorySlug
          ? product.categorySlug
          : slugify(product.category ?? "misc");
        const categoryCollectionGroup =
          product.categoryCollectionGroup || "woman";
        return {
          ...product,
          colorToken,
          createdAt,
          categorySlug: normalizedSlug,
          categoryCollectionGroup,
          categoryKey: buildCategoryKey({
            slug: normalizedSlug,
            collectionGroup: categoryCollectionGroup,
          }),
        };
      }),
    [rawProducts]
  );

  const colorOptions = useMemo(() => {
    const counts = preparedProducts.reduce((acc, product) => {
      acc[product.colorToken] = (acc[product.colorToken] ?? 0) + 1;
      return acc;
    }, {});
    return COLOR_META.filter((meta) => counts[meta.id]).map((meta) => ({
      label: meta.label,
      value: meta.id,
      swatch: meta.swatch,
      count: counts[meta.id],
    }));
  }, [preparedProducts]);

  const sizeOptions = useMemo(() => {
    const counts = preparedProducts.reduce((acc, product) => {
      (product.size ?? []).forEach((size) => {
        acc[size] = (acc[size] ?? 0) + 1;
      });
      return acc;
    }, {});
    return SIZE_OPTIONS.filter((size) => counts[size]).map((size) => ({
      label: size,
      value: size,
      count: counts[size],
    }));
  }, [preparedProducts]);

  const vendorOptions = useMemo(() => {
    const counts = preparedProducts.reduce((accumulator, product) => {
      const key = product.vendorSlug || "sb-store";
      if (!accumulator[key]) {
        accumulator[key] = {
          label: product.vendorName || product.vendorId?.name || "SB Store",
          value: key,
          count: 0,
        };
      }
      accumulator[key].count += 1;
      return accumulator;
    }, {});

    return Object.values(counts).sort((a, b) => a.label.localeCompare(b.label));
  }, [preparedProducts]);

  const subcategoryOptions = useMemo(() => {
    const counts = preparedProducts.reduce((accumulator, product) => {
      const key = product.subcategory || "";
      if (!key) return accumulator;

      if (!accumulator[key]) {
        accumulator[key] = {
          label: key,
          value: key,
          count: 0,
        };
      }
      accumulator[key].count += 1;
      return accumulator;
    }, {});

    return Object.values(counts).sort((a, b) => a.label.localeCompare(b.label));
  }, [preparedProducts]);


  const toggleValue = (value, setter) =>
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedVendors([]);
    setSelectedSubcategories([]);
    setSearchQuery("");
    setSelectedSort("featured");
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = preparedProducts;

    if (selectedCategories.length) {
      const keySet = new Set(selectedCategories);
      result = result.filter((product) => keySet.has(product.categoryKey));
    }

    if (selectedColors.length) {
      const colorSet = new Set(selectedColors);
      result = result.filter((product) => colorSet.has(product.colorToken));
    }

    if (selectedSizes.length) {
      result = result.filter((product) =>
        selectedSizes.every((size) => (product.size ?? []).includes(size))
      );
    }

    if (selectedVendors.length) {
      const vendorSet = new Set(selectedVendors);
      result = result.filter((product) =>
        vendorSet.has(product.vendorSlug || "sb-store")
      );
    }

    if (selectedSubcategories.length) {
      const subcategorySet = new Set(
        selectedSubcategories.map((item) => item.toLowerCase())
      );
      result = result.filter((product) =>
        subcategorySet.has((product.subcategory || "").toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const needle = searchQuery.trim().toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(needle) ||
          product.description?.toLowerCase().includes(needle)
      );
    }

    const sorted = [...result];
    switch (selectedSort) {
      case "price-asc":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        break;
    }
    return sorted;
  }, [
    preparedProducts,
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedVendors,
    selectedSubcategories,
    searchQuery,
    selectedSort,
  ]);

  const totalProducts = preparedProducts.length;
  const activeProducts = filteredAndSortedProducts.length;
  const isLoading = !products?.data;
  const activeVendorCount = vendorOptions.length;

  const catalogueHighlights = useMemo(() => {
    const cheapestProduct = [...preparedProducts].sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    )[0];
    const newestProduct = [...preparedProducts].sort(
      (a, b) => b.createdAt - a.createdAt
    )[0];
    const leadingVendor = [...vendorOptions].sort((a, b) => b.count - a.count)[0];

    return {
      cheapestProduct,
      newestProduct,
      leadingVendor,
    };
  }, [preparedProducts, vendorOptions]);

  const activeFilters = [
    ...selectedCategories.map((value) => ({
      id: `category-${value}`,
      label: categoryOptions.find((option) => option.value === value)?.label ?? value,
      onRemove: () => toggleValue(value, setSelectedCategories),
    })),
    ...selectedColors.map((value) => ({
      id: `color-${value}`,
      label: COLOR_META.find((meta) => meta.id === value)?.label ?? value,
      onRemove: () => toggleValue(value, setSelectedColors),
    })),
    ...selectedSizes.map((value) => ({
      id: `size-${value}`,
      label: value,
      onRemove: () => toggleValue(value, setSelectedSizes),
    })),
    ...selectedVendors.map((value) => ({
      id: `vendor-${value}`,
      label:
        vendorOptions.find((option) => option.value === value)?.label ?? value,
      onRemove: () => toggleValue(value, setSelectedVendors),
    })),
    ...selectedSubcategories.map((value) => ({
      id: `subcategory-${value}`,
      label:
        subcategoryOptions.find((option) => option.value === value)?.label ??
        value,
      onRemove: () => toggleValue(value, setSelectedSubcategories),
    })),
  ];

  const filterSections = [
    {
      id: "category",
      title: "Catégorie",
      options: categoryOptions,
      selected: selectedCategories,
      onToggle: (value) => toggleValue(value, setSelectedCategories),
    },
    {
      id: "color",
      title: "Couleur",
      options: colorOptions,
      selected: selectedColors,
      onToggle: (value) => toggleValue(value, setSelectedColors),
      withSwatch: true,
    },
    {
      id: "size",
      title: "Taille",
      options: sizeOptions,
      selected: selectedSizes,
      onToggle: (value) => toggleValue(value, setSelectedSizes),
    },
    {
      id: "vendor",
      title: "Boutique",
      options: vendorOptions,
      selected: selectedVendors,
      onToggle: (value) => toggleValue(value, setSelectedVendors),
    },
    {
      id: "subcategory",
      title: "Sous-catégorie",
      options: subcategoryOptions,
      selected: selectedSubcategories,
      onToggle: (value) => toggleValue(value, setSelectedSubcategories),
    },
  ].filter((section) => section.options.length);

  const FilterPanel = () => (
    <div className="space-y-6">
      {filterSections.map((section) => (
        <div
          key={section.id}
          className="rounded-lg border border-black/10 bg-white p-5 shadow-sm shadow-black/5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              {section.title}
            </h3>
            <span className="text-xs text-gray-400">
              {section.selected.length}/{section.options.length}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {section.options.map((option) => {
              const isActive = section.selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => section.onToggle(option.value)}
                  className={classNames(
                    "flex w-full items-center justify-between rounded-full border px-4 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "border-[#16181b] bg-[#16181b] text-white shadow-sm"
                      : "border-black/10 text-gray-700 hover:border-black"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {section.withSwatch && (
                      <span
                        aria-hidden
                        className="inline-flex h-3.5 w-3.5 rounded-full border border-white/70 shadow-inner"
                        style={{ backgroundColor: option.swatch }}
                      />
                    )}
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span
                      className={classNames(
                        "text-xs font-medium",
                        isActive ? "text-white/80" : "text-gray-400"
                      )}
                    >
                      {option.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const FilterDrawer = () => (
    <Transition.Root show={mobileFiltersOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileFiltersOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative h-full w-full max-w-xs overflow-y-auto bg-[#f7f4ef] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Filtres
                  </Dialog.Title>
                  <p className="text-sm text-gray-500">
                    Affine la sélection par boutique, taille, couleur ou mot-clé.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="sr-only">Fermer les filtres</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <FilterPanel />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );

  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-screen-2xl px-4 pb-12 pt-12 sm:px-6 lg:px-10 lg:pb-16 lg:pt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-black/55">
                Catalogue marketplace
              </span>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold uppercase leading-[0.95] text-black sm:text-7xl">
                Une sélection plus nette, plus premium, plus facile à parcourir
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
                Filtre les produits par boutique, catégorie, couleur ou taille.
                Chaque résultat vient du vrai catalogue marketplace.
              </p>
            </div>
            <div className="flex w-full max-w-lg items-center gap-3 border border-black/10 bg-white px-5 py-3 sm:w-96">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-3.5-3.5m1-4.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher une boutique, un style, une pièce..."
                className="flex-1 border-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:bg-neutral-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span className="sr-only">Effacer la recherche</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr,0.7fr,0.7fr,0.7fr]">
            <div className="border border-black/10 bg-[#f7f4ef] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Direction catalogue
              </p>
              <p className="mt-3 text-lg font-bold text-[#16181b]">
                Compare les boutiques, filtre vite et entre dans la bonne sélection sans perdre de temps.
              </p>
            </div>
            <div className="border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Boutiques actives
              </p>
              <p className="mt-3 text-3xl font-black text-[#16181b]">
                {activeVendorCount}
              </p>
              <p className="mt-1 text-sm text-black/55">vitrine(s) visibles</p>
            </div>
            <div className="border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Produit repère
              </p>
              <p className="mt-3 text-sm font-bold text-[#16181b]">
                {catalogueHighlights.cheapestProduct?.name || "En préparation"}
              </p>
              <p className="mt-1 text-sm text-black/55">
                {catalogueHighlights.cheapestProduct
                  ? catalogueHighlights.cheapestProduct.hidePrice
                    ? "Sur demande"
                    : `${Number(catalogueHighlights.cheapestProduct.price || 0).toFixed(2)} Dt`
                  : "Ajoute plus de produits"}
              </p>
            </div>
            <div className="border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Boutique en tête
              </p>
              <p className="mt-3 text-sm font-bold text-[#16181b]">
                {catalogueHighlights.leadingVendor?.label || "Marketplace"}
              </p>
              <p className="mt-1 text-sm text-black/55">
                {catalogueHighlights.leadingVendor
                  ? `${catalogueHighlights.leadingVendor.count} produit(s)`
                  : "En attente de catalogue"}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-gray-700">
                <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                {isLoading ? (
                  <span className="font-semibold text-gray-900">
                    Chargement du catalogue
                  </span>
                ) : (
                  <>
                    Affichage de{" "}
                    <span className="font-semibold text-gray-900">
                      {activeProducts}
                    </span>{" "}
                    sur{" "}
                    <span className="font-semibold text-gray-900">
                      {totalProducts}
                    </span>{" "}
                    produits
                  </>
                )}
              </div>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Réinitialiser
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-gray-600">
                Trier par
              </label>
              <select
                id="sort"
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value)}
                className="border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black transition hover:border-black lg:hidden"
              >
                <FunnelIcon className="h-4 w-4" />
                Filtres
              </button>
            </div>
          </div>

          {!isLoading && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {catalogueHighlights.newestProduct ? (
                <span className="border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/60">
                  Nouveau: {catalogueHighlights.newestProduct.name}
                </span>
              ) : null}
              {vendorOptions.slice(0, 3).map((vendor) => (
                <Link
                  key={vendor.value}
                  href={`/products?vendor=${vendor.value}`}
                  className="border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/60 transition hover:border-black hover:text-black"
                >
                  {vendor.label}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border border-black/10 bg-[#f7f4ef] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Besoin d&apos;aide
            </p>
            <p className="text-sm text-black/70">
              Lance l&apos;assistant AI pour chercher par budget, boutique ou besoin client.
            </p>
            <Link
              href={`/assistant${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
              className="inline-flex items-center justify-center bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
            >
              Ouvrir l&apos;assistant
            </Link>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {activeFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-700"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    className="p-1 text-gray-400 transition hover:bg-neutral-100 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-4">
                <div className="border border-black/10 bg-[#16181b] p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                    Conseil rapide
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Commence par la boutique si tu sais déjà chez qui acheter.
                    Sinon, trie par prix ou demande une sélection à l&apos;AI.
                  </p>
                </div>
                <FilterPanel />
              </div>
            </aside>
            <section aria-label="Product listing" className="min-h-[320px]">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse border border-black/10 bg-white p-3"
                    >
                      <div className="aspect-[3/4] w-full bg-gray-200" />
                      <div className="mt-4 h-4 w-32 rounded-full bg-gray-200" />
                      <div className="mt-3 h-4 w-20 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : activeProducts === 0 ? (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-black/10 bg-white p-12 text-center">
                  <Image
                    src="https://illustrations.popsy.co/gray/waiting.svg"
                    alt="Empty state illustration"
                    width={160}
                    height={160}
                    className="mb-8 opacity-80"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">Aucun produit ne correspond à cette sélection</h3>
                  <p className="mt-3 max-w-md text-sm text-gray-500">
                    Essaie d&apos;élargir les filtres, de changer le mot-clé ou de passer par l&apos;assistant AI.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-6 inline-flex items-center gap-2 bg-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                  {filteredAndSortedProducts.map((product) => (
                    <article
                      key={product._id}
                      className="group relative flex flex-col overflow-hidden border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl hover:shadow-black/5"
                    >
                      <Link href={`/products/${product._id}`} className="block">
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                          <Image
                            src={
                              withCloudinaryProxy(product.mainImage) ||
                              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 32vw, 90vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                            <span className="bg-white/90 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-black">
                              {product.category}
                            </span>
                            <span className="border border-white/70 bg-white/80 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-black/60">
                              {product.colorToken === "neutral"
                                ? "Classic Tone"
                                : COLOR_META.find((meta) => meta.id === product.colorToken)?.label}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <Link href={`/products/${product._id}`}>
                            <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-[0.06em] text-black">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-black/50">
                            {product.vendorName ||
                              product.vendorId?.name ||
                              "SB Store"}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/45">
                            {product.description}
                          </p>
                        </div>
                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-semibold text-black">
                              {product.hidePrice
                                ? "Prix sur demande"
                                : `${Number(product.price).toFixed(2)} Dt`}
                            </p>
                            <div className="hidden items-center gap-1 text-xs uppercase tracking-wide text-gray-400 sm:flex">
                              <span>Tailles</span>
                              <span className="font-semibold text-gray-600">
                                {(product.size ?? []).slice(0, 3).join(" • ") ||
                                  "Standard"}
                                {(product.size ?? []).length > 3 ? " +" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="grid gap-2 border-t border-black/5 pt-3">
                            <button
                              type="button"
                              onClick={() => toggleCompareItem(product)}
                              className="inline-flex items-center justify-center border border-black/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-black transition hover:border-black"
                            >
                              {isInCompare(product._id) ? "Retirer du comparateur" : "Comparer ce produit"}
                            </button>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                                Voir la fiche
                              </span>
                              <Link
                                href={`/products/${product._id}`}
                                className="inline-flex items-center justify-center bg-black px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition group-hover:bg-neutral-800"
                              >
                                Découvrir
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <FilterDrawer />
    </div>
  );
};

const Products = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsContent />
    </Suspense>
  );
};

export default Products;
