"use client";
import CardSkeleton from "@/components/CardSkeleton";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";

const Category = ({ slug, collectionGroup }) => {
  const [data, setData] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [priceFilter, setPriceFilter] = useState([0, 0]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("featured");
  const normalizedGroup = collectionGroup
    ? collectionGroup.toLowerCase()
    : "";

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setCategoryInfo(null);
      setData([]);
      setSubcategories([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = normalizedGroup
          ? `/api/category/${normalizedGroup}/${slug}`
          : `/api/category/${slug}`;
        const res = await axios.get(endpoint);
        const { category, products } = res.data.data;
        setCategoryInfo(category);
        setData(products);

        const productSubcategories = products
          .map((product) => product.subcategory)
          .filter(Boolean);
        const uniqueSubcategories = category?.subcategories?.length
          ? category.subcategories
          : [...new Set(productSubcategories)];
        setSubcategories(uniqueSubcategories);

        const prices = products
          .map((product) => product.price)
          .filter((price) => typeof price === "number" && !Number.isNaN(price));
        if (prices.length) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceBounds([minPrice, maxPrice]);
          setPriceFilter([minPrice, maxPrice]);
        } else {
          setPriceBounds([0, 0]);
          setPriceFilter([0, 0]);
        }

        const sizes = products.flatMap((product) => product.size || []);
        const uniqueSizes = [...new Set(sizes)].filter(Boolean);
        setAvailableSizes(uniqueSizes);
        setSelectedSizes([]);
        setSearchQuery("");
        setSortOption("featured");
        setSelectedSubcategory("");
      } catch (error) {
        console.error("Failed to fetch category data:", error);
        setCategoryInfo(null);
        setData([]);
        setSubcategories([]);
        setAvailableSizes([]);
        setSelectedSizes([]);
        setPriceBounds([0, 0]);
        setPriceFilter([0, 0]);
        setSearchQuery("");
        setSortOption("featured");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, normalizedGroup]);

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceFilter;
    const hasPriceGuard = priceBounds[0] !== priceBounds[1] || priceBounds[0] !== 0;
    const query = searchQuery.trim().toLowerCase();

    let products = [...data];

    if (selectedSubcategory) {
      products = products.filter(
        (product) => product.subcategory === selectedSubcategory
      );
    }

    if (hasPriceGuard && priceBounds[1] >= priceBounds[0]) {
      products = products.filter((product) => {
        const price = typeof product.price === "number" ? product.price : 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    if (selectedSizes.length) {
      products = products.filter((product) => {
        const productSizes = product.size || [];
        return productSizes.some((size) => selectedSizes.includes(size));
      });
    }

    if (query) {
      products = products.filter((product) => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      });
    }

    const sorter = {
      featured: () => 0,
      priceAsc: (a, b) => (a.price || 0) - (b.price || 0),
      priceDesc: (a, b) => (b.price || 0) - (a.price || 0),
      nameAsc: (a, b) => (a.name || "").localeCompare(b.name || ""),
    }[sortOption];

    return sorter ? products.sort(sorter) : products;
  }, [
    data,
    selectedSubcategory,
    priceFilter,
    priceBounds,
    selectedSizes,
    searchQuery,
    sortOption,
  ]);

  const handlePriceChange = (type, value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setPriceFilter(([currentMin, currentMax]) => {
      if (type === "min") {
        const nextMin = Math.min(
          Math.max(numericValue, priceBounds[0]),
          Math.min(currentMax, priceBounds[1])
        );
        return [nextMin, currentMax];
      }
      const nextMax = Math.max(
        Math.min(numericValue, priceBounds[1]),
        Math.max(currentMin, priceBounds[0])
      );
      return [currentMin, nextMax];
    });
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubcategory("");
    setSelectedSizes([]);
    setSearchQuery("");
    setSortOption("featured");
    setPriceFilter(priceBounds);
  };

  if (loading) {
    return (
      <div className="mx-auto my-10 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        <CardSkeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white">
        <div className="mx-auto flex min-h-[62vh] w-full max-w-screen-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-10">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-black/40">
            {normalizedGroup || "collection"}
          </p>
          <h1 className="text-5xl font-semibold uppercase leading-none text-black sm:text-7xl">
            {categoryInfo?.name || slug}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-black/55">
            This edit is not available yet. Explore the full store while new
            pieces are being added.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex border border-black bg-black px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
          >
            View all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex h-[62vh] min-h-[460px] w-full flex-col items-center justify-center bg-black bg-cover bg-center bg-no-repeat">
        <div
          className="flex h-full w-full flex-col items-center justify-center bg-no-repeat bg-cover bg-center text-center"
          style={
            categoryInfo?.image
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.48)), url(${categoryInfo.image})`,
                }
              : undefined
          }
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-white/75">
            {normalizedGroup || "collection"}
          </p>
          <h1 className="text-6xl font-semibold uppercase leading-none text-white sm:text-8xl">
            {categoryInfo?.name || slug}
          </h1>
          <p className="mt-5 max-w-xl px-4 text-sm leading-6 text-white/80">
            A focused edit of essential silhouettes and everyday pieces.
          </p>
        </div>
      </div>
      <div
        className="mx-auto flex max-w-screen-2xl items-center gap-2 px-4 py-6 text-xs uppercase tracking-[0.18em] text-black/45 sm:px-6 lg:px-10"
      >
        Home <span>/</span>{" "}
        {categoryInfo?.name || slug}
      </div>

      <div className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 pb-16 sm:px-6 lg:flex-row lg:px-10">
        <aside className="w-full border-t border-black/10 pt-5 lg:w-72">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-black">
              Filter
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs uppercase tracking-[0.22em] text-black/40 hover:text-black"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 space-y-8 text-black/70">
            <div>
              <label className="text-xs uppercase tracking-[0.24em] text-black/40">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Look for a piece"
                className="mt-3 w-full border-0 border-b border-black/15 px-0 py-3 text-sm outline-none focus:border-black focus:ring-0"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  Price
                </p>
                <span className="text-xs text-black/45">
                  {priceBounds[0]} - {priceBounds[1] || priceBounds[0]}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  min={priceBounds[0]}
                  max={priceBounds[1] || undefined}
                  value={priceFilter[0]}
                  onChange={(event) => handlePriceChange("min", event.target.value)}
                  className="w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <span className="text-black/30">-</span>
                <input
                  type="number"
                  min={priceBounds[0]}
                  max={priceBounds[1] || undefined}
                  value={priceFilter[1]}
                  onChange={(event) => handlePriceChange("max", event.target.value)}
                  className="w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            {availableSizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/40">
                  Sizes
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {availableSizes.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-black/10 text-black/60 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {subcategories.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/40">
                  Subcategories
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedSubcategory("")}
                    className={`border px-4 py-2 text-left text-xs uppercase tracking-[0.16em] ${
                      selectedSubcategory === ""
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-black/65 hover:border-black"
                    }`}
                  >
                    All
                  </button>
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className={`border px-4 py-2 text-left text-xs uppercase tracking-[0.16em] ${
                        selectedSubcategory === subcategory
                          ? "border-black bg-black text-white"
                          : "border-black/10 text-black/65 hover:border-black"
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col gap-4 border-y border-black/10 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              {filteredProducts.length} pieces
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-[0.22em] text-black/40">
                Sort
              </label>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="border border-black/10 px-4 py-2 text-sm outline-none focus:border-black"
              >
                <option value="featured">Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Alphabetical</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-10 border border-dashed border-black/15 p-10 text-center">
              <p className="text-lg font-semibold uppercase tracking-[0.12em] text-black">
                No pieces match your filters
              </p>
              <p className="mt-2 text-sm text-black/50">
                Try adjusting the size, price, or keyword filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
            <Link
              href={`/products/${product?._id}`}
              key={product?._id}
              className="group"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                <Image
                  width={700}
                  height={900}
                  src={
                    withCloudinaryProxy(product?.mainImage) ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={product?.name}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-black">{product?.name}</h3>
              <p className="mt-1 text-sm text-black">
                {product?.hidePrice ? "Prix sur demande" : `${product?.price} Dt`}
              </p>
              {product?.subcategory && (
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-black/40">
                  {product.subcategory}
                </p>
              )}
            </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Category;
