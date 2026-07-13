"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CardSkeleton from "./CardSkeleton";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";

const RelatedProducts = ({ id }) => {
  const [product, setProduct] = useState([]);
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios(`/api/relatedProducts/${id}`);

      setProduct(res.data);
    };
    fetchProduct();
  }, [id]);

  console.log();

  if (!product?.relatedProducts) {
    return (
      <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-10">
        <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.24em] text-black">
          Produits similaires
        </h2>
        <div className="bg-white">
          <CardSkeleton />
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-screen-2xl border-t border-black/10 px-4 py-14 sm:px-6 lg:px-10">
      <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.24em] text-black">
        Produits similaires
      </h2>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {product?.relatedProducts?.map((product) => (
          <Link
            href={`/products/${product?._id}`}
            key={product?._id}
            className="group"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
              <Image
                width={700}
                height={900}
                src={withCloudinaryProxy(product?.mainImage)}
                alt={product?.name}
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <h3 className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-black">
              {product?.name}
            </h3>
            <p className="mt-1 text-sm text-black">
              {product?.hidePrice ? "Prix sur demande" : `${product?.price} Dt`}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-black/40">
              {product?.vendorName || product?.vendorId?.name || "SB Store"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
