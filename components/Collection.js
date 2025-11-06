"use client";
import { ProductContext } from "@/Context/CreateProduct";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useContext, useMemo } from "react";

const fallbackCategories = [
  {
    name: "Men",
    slug: "men",
    image: "/images/models/man-fashion.jpg",
  },
  {
    name: "Kids",
    slug: "kids",
    image: "/images/models/kids-fashion.jpg",
  },
  {
    name: "Women",
    slug: "women",
    image: "/images/models/woman-fashion.jpg",
  },
];

const Collection = () => {
  const { categories } = useContext(ProductContext);

  const displayCategories = useMemo(() => {
    if (!categories.length) {
      return fallbackCategories;
    }

    const normalized = categories.map((category, index) => ({
      key: category._id || `${category.slug}-${index}`,
      name: category.name,
      slug: category.slug,
      image: category.image || fallbackCategories[index % fallbackCategories.length].image,
    }));

    if (normalized.length >= 3) {
      return normalized.slice(0, 3);
    }

    const merged = [...normalized];
    let fallbackIndex = 0;
    while (merged.length < 3) {
      const fallback = fallbackCategories[fallbackIndex % fallbackCategories.length];
      merged.push({
        key: `${fallback.slug}-${merged.length}`,
        ...fallback,
      });
      fallbackIndex += 1;
    }
    return merged;
  }, [categories]);

  return (
    <section>
      <div className="mx-auto lg:w-10/12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-3xl">
            New Collection
          </h2>

          <p className="mx-auto mt-4 max-w-md text-gray-500">
            For unique and stylish clothing, shoes and accessories in the
            collection you can select the best one for you.
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {displayCategories.map((category, index) => {
            const isFeatured = index === 2;
            return (
              <li
                key={category.key}
                className={
                  isFeatured
                    ? "lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                    : undefined
                }
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block"
                >
                  <Image
                    height={isFeatured ? 300 : 300}
                    width={isFeatured ? 500 : 300}
                    src={withCloudinaryProxy(category.image)}
                    alt={`${category.name} collection`}
                    className={`aspect-square w-full object-cover transition duration-500 group-hover:opacity-90 ${
                      isFeatured ? "" : ""
                    }`}
                  />

                  <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                    <h3
                      className={`text-xl font-medium ${
                        isFeatured ? "text-black" : "text-white"
                      }`}
                    >
                      {`${category.name} Collection`}
                    </h3>

                    <span className="mt-1.5 inline-block bg-black px-5 py-3 text-xs font-medium uppercase tracking-wide text-white rounded">
                      Shop Now
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Collection;
