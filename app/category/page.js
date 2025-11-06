"use client";
import { ProductContext } from "@/Context/CreateProduct";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const fallbackCategories = [
  {
    name: "Men",
    slug: "men",
    image:
      "https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?q=80&w=1964&auto=format&fit=crop",
  },
  {
    name: "Kids",
    slug: "kids",
    image:
      "https://images.unsplash.com/photo-1627859774205-83c1279a6382?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Women",
    slug: "women",
    image:
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?q=80&w=1974&auto=format&fit=crop",
  },
];

const CategoriesPage = () => {
  const { categories } = useContext(ProductContext);
  const displayCategories = categories.length ? categories : fallbackCategories;

  return (
    <div className="w-full md:w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ul className="mt-8 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {displayCategories.map((category) => (
          <li key={category._id || category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="group relative block rounded-md overflow-hidden"
            >
              <Image
                height={320}
                width={320}
                src={
                  category.image ||
                  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                }
                alt={`${category.name} category`}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-xl font-medium text-white">
                  {category.name} Collection
                </h3>

                <span className="mt-1.5 inline-block bg-white px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-900 rounded">
                  Shop Now
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
