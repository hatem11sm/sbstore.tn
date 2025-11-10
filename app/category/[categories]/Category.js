"use client";
import CardSkeleton from "@/components/CardSkeleton";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
      <div className="w-full lg:w-11/12 mx-auto my-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full lg:w-11/12 mx-auto my-4">
        <div className="bg-white p-8 rounded-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No products found
          </h2>
          <p className="text-gray-500">
            Please check back later or explore other categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-96 bg-cover bg-center bg-no-repeat">
        <div
          className="flex flex-col items-center justify-center w-full h-full bg-no-repeat bg-cover bg-hero-pattern"
          style={
            categoryInfo?.image
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${categoryInfo.image})`,
                }
              : undefined
          }
        >
          <h1 className="text-4xl font-bold text-white capitalize">
            {categoryInfo?.name || slug}
          </h1>
          <p className="text-xl font-medium text-white">
            For unique and stylish clothing in the collection you can select the
            best one for you.
          </p>
        </div>
      </div>
      <div
        className="mx-auto w-11/12 px-2 py-8 sm:px-6 sm:py-12 lg:px-8 text-gray-500 text-sm"
        style={{ maxWidth: "90rem" }}
      >
        Home <span className="mx-2">/</span>{" "}
        {categoryInfo?.name || slug}
      </div>

      <div className="mx-auto w-11/12 px-2 py-8 sm:px-6 sm:py-12 lg:px-8 flex flex-col gap-10 lg:flex-row" style={{ maxWidth: "90rem" }}>
        <aside className="w-full rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm lg:w-72">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-600">
              Filter
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs uppercase tracking-[0.3em] text-gray-400 hover:text-gray-700"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 space-y-6 text-gray-600">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Look for a piece"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  Price (DT)
                </p>
                <span className="text-xs text-gray-500">
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min={priceBounds[0]}
                  max={priceBounds[1] || undefined}
                  value={priceFilter[1]}
                  onChange={(event) => handlePriceChange("max", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {availableSizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  Sizes
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {availableSizes.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
                          active
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
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
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  Subcategories
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubcategory("")}
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                      selectedSubcategory === ""
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                        selectedSubcategory === subcategory
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} pieces curated
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Sort
              </label>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Alphabetical</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-lg font-semibold text-gray-800">
                No pieces match your filters
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting the size, price, or keyword filters.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {filteredProducts.map((product) => (
            <Link
              href={`/products/${product?._id}`}
              key={product?._id}
              className="group"
            >
              <div className="aspect-h-1 aspect-w-1 w-full md:h-5/6 overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <Image
                  width={500}
                  height={400}
                  src={
                    product?.mainImage ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={product?.name}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product?.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {product?.price} Dt
              </p>
              {product?.subcategory && (
                <p className="mt-1 text-sm text-gray-500">
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
