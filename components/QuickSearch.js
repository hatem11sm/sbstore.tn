"use client";

import { ProductContext } from "@/Context/CreateProduct";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useContext, useMemo, useRef, useState } from "react";
import { BsSearch, BsX } from "react-icons/bs";

const QuickSearch = ({ isOpen, onClose }) => {
  const { products } = useContext(ProductContext);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const productList = products?.data || [];
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return productList.slice(0, 6);

    return productList
      .filter((product) => {
        const searchable = [
          product?.name,
          product?.category,
          product?.subcategory,
          product?.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(cleanQuery);
      })
      .slice(0, 6);
  }, [products, query]);

  if (!isOpen) return null;

  const closeSearch = () => {
    setQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 px-4 py-8 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Fermer la recherche"
        className="absolute inset-0 cursor-default"
        onClick={closeSearch}
      />
      <section className="relative mx-auto max-w-2xl overflow-hidden bg-white shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-4">
          <BsSearch className="h-5 w-5 text-black/45" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher lunettes, robe, montre..."
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="flex h-10 w-10 items-center justify-center border border-black/10 text-black transition hover:border-black"
            aria-label="Fermer la recherche"
          >
            <BsX className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-black/45">
            <span>Recherche instantanée</span>
            <span>{results.length} résultat(s)</span>
          </div>

          {results.length ? (
            <div className="grid gap-2">
              {results.map((product) => (
                <Link
                  key={product?._id}
                  href={`/products/${product?._id}`}
                  onClick={closeSearch}
                  className="group grid grid-cols-[76px,1fr,auto] items-center gap-4 border border-black/10 p-2 transition hover:border-black"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Image
                      fill
                      src={withCloudinaryProxy(product?.mainImage)}
                      alt={product?.name}
                      sizes="76px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">
                      {product?.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/45">
                      {product?.vendorName ||
                        product?.vendorId?.name ||
                        "SB Store"}
                    </p>
                  </div>
                  <p className="whitespace-nowrap rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                    {product?.hidePrice ? "Prix sur demande" : `${product?.price} Dt`}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 p-8 text-center">
              <p className="text-sm font-semibold text-black">
                Aucun produit trouvé
              </p>
              <p className="mt-2 text-sm text-black/55">
                Essayez un autre mot-clé ou consultez toutes les collections.
              </p>
              <Link
                href="/products"
                onClick={closeSearch}
                className="mt-5 inline-flex bg-black px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white"
              >
                Voir tous les produits
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuickSearch;
