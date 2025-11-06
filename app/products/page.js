"use client";

import { ProductContext } from "@/Context/CreateProduct";
import slugify from "@/utils/slugify";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowPathIcon,
  FunnelIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useContext, useMemo, useState } from "react";

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
  { value: "featured", label: "Featured" },
  { value: "recent", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A → Z" },
  { value: "name-desc", label: "Name Z → A" },
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

const Products = () => {
  const { products, categories } = useContext(ProductContext);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryOptions = useMemo(() => {
    if (!categories?.length) return [];
    return categories
      .map((category) => ({
        label: category.name,
        value: category.slug,
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
        return {
          ...product,
          colorToken,
          createdAt,
          categorySlug: product.categorySlug ?? slugify(product.category ?? "misc"),
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

  const toggleValue = (value, setter) =>
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery("");
    setSelectedSort("featured");
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = preparedProducts;

    if (selectedCategories.length) {
      const slugSet = new Set(selectedCategories);
      result = result.filter((product) => slugSet.has(product.categorySlug));
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
    searchQuery,
    selectedSort,
  ]);

  const totalProducts = preparedProducts.length;
  const activeProducts = filteredAndSortedProducts.length;
  const isLoading = !products?.data;

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
  ];

  const filterSections = [
    {
      id: "category",
      title: "Category",
      options: categoryOptions,
      selected: selectedCategories,
      onToggle: (value) => toggleValue(value, setSelectedCategories),
    },
    {
      id: "color",
      title: "Color",
      options: colorOptions,
      selected: selectedColors,
      onToggle: (value) => toggleValue(value, setSelectedColors),
      withSwatch: true,
    },
    {
      id: "size",
      title: "Size",
      options: sizeOptions,
      selected: selectedSizes,
      onToggle: (value) => toggleValue(value, setSelectedSizes),
    },
  ].filter((section) => section.options.length);

  const FilterPanel = () => (
    <div className="space-y-6">
      {filterSections.map((section) => (
        <div key={section.id} className="rounded-2xl border border-gray-100 p-5 shadow-sm">
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
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all duration-150",
                    isActive
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
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
            <Dialog.Panel className="relative h-full w-full max-w-xs overflow-y-auto bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Filters
                  </Dialog.Title>
                  <p className="text-sm text-gray-500">
                    Tailor the collection to match your vibe.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="sr-only">Close filters</span>
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
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pb-16 lg:pt-28">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                Curated Collection
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Discover pieces that match your style
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:text-lg">
                Filter by category, color palette, or fit. Every change updates instantly, so
                finding your next favourite outfit feels effortless.
              </p>
            </div>
            <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:w-96">
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
                placeholder="Search for denim, jackets, shoes..."
                className="flex-1 border-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm">
                <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                Showing <span className="font-semibold text-gray-900">{activeProducts}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalProducts}</span> pieces
              </div>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-gray-600">
                Sort by
              </label>
              <select
                id="sort"
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 lg:hidden"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {activeFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    className="rounded-full p-1 text-gray-400 transition hover:bg-white hover:text-gray-600"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <FilterPanel />
            </aside>
            <section aria-label="Product listing" className="min-h-[320px]">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="aspect-square w-full rounded-2xl bg-gray-200" />
                      <div className="mt-4 h-4 w-32 rounded-full bg-gray-200" />
                      <div className="mt-3 h-4 w-20 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : activeProducts === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/80 p-12 text-center shadow-sm">
                  <Image
                    src="https://illustrations.popsy.co/gray/waiting.svg"
                    alt="Empty state illustration"
                    width={160}
                    height={160}
                    className="mb-8 opacity-80"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">We couldn&apos;t find a match</h3>
                  <p className="mt-3 max-w-md text-sm text-gray-500">
                    Try adjusting your filters or search keywords to explore more of the collection.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredAndSortedProducts.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={
                            product.mainImage ||
                            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={product.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(min-width: 1280px) 20vw, (min-width: 640px) 32vw, 90vw"
                        />
                        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 shadow-sm">
                            {product.category}
                          </span>
                          <span className="rounded-full border border-white/70 bg-white/80 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm">
                            {product.colorToken === "neutral"
                              ? "Classic Tone"
                              : COLOR_META.find((meta) => meta.id === product.colorToken)?.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 px-5 py-6">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <p className="text-lg font-semibold text-gray-900">
                            {Number(product.price).toFixed(2)} Dt
                          </p>
                          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-400">
                            <span>Sizes</span>
                            <span className="font-semibold text-gray-600">
                              {(product.size ?? []).slice(0, 3).join(" • ") ||
                                "Standard fit"}
                              {(product.size ?? []).length > 3 ? " +" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
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

export default Products;
