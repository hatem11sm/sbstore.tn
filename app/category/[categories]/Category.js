"use client";
import CardSkeleton from "@/components/CardSkeleton";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Category = ({ slug }) => {
  const [data, setData] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);

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
        const res = await axios.get(`/api/category/${slug}`);
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
      } catch (error) {
        console.error("Failed to fetch category data:", error);
        setCategoryInfo(null);
        setData([]);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const filteredProducts = selectedSubcategory
    ? data.filter(product => product.subcategory === selectedSubcategory)
    : data;

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

      {/* Subcategory Filter */}
      {subcategories.length > 0 && (
        <div className="mx-auto w-11/12 px-2 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory("")}
              className={`px-4 py-2 rounded-md ${
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
                className={`px-4 py-2 rounded-md ${
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

      <div className="mx-auto w-11/12 px-2 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {filteredProducts?.map((product) => (
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
      </div>
    </>
  );
};

export default Category;
