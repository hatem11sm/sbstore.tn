"use client";
import { ProductContext } from "@/Context/CreateProduct";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import CardSkeleton from "./CardSkeleton";

const HomeProducts = ({ show }) => {
  const { products } = useContext(ProductContext);

  if (!products?.data) {
    return (
      <div
        className={`bg-white mx-auto ${show ? "w-full lg:w-10/12" : "w-full"}`}
      >
        <CardSkeleton />
      </div>
    );
  }
  const visibleProducts = show
    ? products?.data?.slice(-4).reverse()
    : products?.data;

  return (
    <div className="bg-[#f7f4ef]">
      <div className={`mx-auto ${show ? "max-w-7xl" : "w-full"}`}>
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20 lg:max-w-full lg:px-8">
          <h2 className="sr-only">Products</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts?.map((product) => (
              <Link
                href={`/products/${product?._id}`}
                key={product?._id}
                className="group rounded-lg bg-white p-3 shadow-sm shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
              >
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                  <Image
                    width={500}
                    height={500}
                    src={withCloudinaryProxy(product?.mainImage)}
                    alt={product?.name}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 px-1 pb-2 pt-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#16181b]">
                      {product?.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500">
                      {product?.vendorName || product?.vendorId?.name || "SB Store"}
                    </p>
                  </div>
                  <p className="whitespace-nowrap rounded-full bg-[#16181b] px-3 py-1 text-sm font-bold text-white">
                    {product?.hidePrice ? "Prix sur demande" : `${product?.price} Dt`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProducts;
