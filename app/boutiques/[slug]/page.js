"use client";

import { useCompare } from "@/Context/CompareProvider";
import { ProductContext } from "@/Context/CreateProduct";
import {
  calculateVendorTrustScore,
  getVendorTrustLabel,
} from "@/utils/marketplaceScore";
import { normalizeVendorForStorefront } from "@/utils/vendorStorefront";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useMemo } from "react";

const productPriceLabel = (product) =>
  product?.hidePrice
    ? "Prix sur demande"
    : `${Number(product?.price || 0).toFixed(2)} Dt`;

const statsPriceLabel = (vendorStats, type = "avg") => {
  if (vendorStats.hidePrices) return "Sur demande";
  if (type === "range") {
    return `${vendorStats.minPrice.toFixed(2)} - ${vendorStats.maxPrice.toFixed(2)} Dt`;
  }
  if (type === "min") return `${vendorStats.minPrice.toFixed(2)} Dt`;
  return `${vendorStats.avgPrice.toFixed(2)} Dt`;
};

const CATEGORY_ORDER = [
  "Chaussures",
  "Claquettes",
  "Sac a main",
  "Sac a dos",
  "Pull",
  "Chemise",
  "Casquette",
  "Pantalon",
  "Lunettes",
  "Montres",
  "Ensemble",
  "Accessoires",
];

const categoryId = (value = "selection") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeProductSubcategory = (product) => {
  const raw = product?.subcategory || product?.category || "Selection";
  const normalized = raw.toString().trim().toLowerCase();

  if (["shoes", "sneakers", "chaussure", "chaussures"].includes(normalized)) {
    return "Chaussures";
  }
  if (["slides", "claquette", "claquettes"].includes(normalized)) {
    return "Claquettes";
  }
  if (["shirts", "shirt", "chemise", "chemises"].includes(normalized)) {
    return "Chemise";
  }
  if (["pants", "pantalon", "pantalons"].includes(normalized)) {
    return "Pantalon";
  }
  if (["bags", "bag", "sac", "sac a main", "sac à main"].includes(normalized)) {
    return "Sac a main";
  }
  if (["outfit", "ensemble", "sets"].includes(normalized)) {
    return "Ensemble";
  }

  return raw.toString().trim() || "Selection";
};

const CategoryIcon = ({ name }) => {
  const id = categoryId(name);
  const iconProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (id.includes("chaussures")) {
    return (
      <svg {...iconProps}>
        <path d="M4 15.5c3.5.4 6.2-.5 8.4-3.2l1.2-1.5c.8-1 2.1-1.4 3.3-1l1.7.6c1.3.5 2.3 1.5 2.7 2.8l.4 1.4c.4 1.5-.7 2.9-2.2 2.9H5.7c-1.2 0-2.1-.9-1.7-2Z" />
        <path d="M13.2 11.2c1.4.8 3 1.2 4.8 1.1" />
      </svg>
    );
  }

  if (id.includes("claquettes")) {
    return (
      <svg {...iconProps}>
        <path d="M6 15.5c2.4-4 4.8-6.6 7.4-7.6" />
        <path d="M3.8 17.6c2.9 1.4 7 1.6 12.2.5 2.6-.5 4.3-1.9 5.2-4.1" />
        <path d="M12.9 8.1c2.3 1.8 3.4 4.4 3.1 7.8" />
      </svg>
    );
  }

  if (id.includes("sac")) {
    return (
      <svg {...iconProps}>
        <path d="M7 9V7a5 5 0 0 1 10 0v2" />
        <path d="M5.3 9h13.4l1 10.5a2 2 0 0 1-2 2.2H6.3a2 2 0 0 1-2-2.2L5.3 9Z" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  if (id.includes("chemise") || id.includes("pull")) {
    return (
      <svg {...iconProps}>
        <path d="m8 4 4 2 4-2 4 4-3 3v9H7v-9L4 8l4-4Z" />
        <path d="M10 6.5 12 9l2-2.5" />
      </svg>
    );
  }

  if (id.includes("pantalon")) {
    return (
      <svg {...iconProps}>
        <path d="M8 3h8l1 18h-4l-1-10-1 10H7L8 3Z" />
        <path d="M8 7h8" />
      </svg>
    );
  }

  if (id.includes("lunettes")) {
    return (
      <svg {...iconProps}>
        <circle cx="8" cy="14" r="3.3" />
        <circle cx="16" cy="14" r="3.3" />
        <path d="M11.3 14h1.4M4.7 13l-1.7-2M19.3 13l1.7-2" />
      </svg>
    );
  }

  if (id.includes("montres")) {
    return (
      <svg {...iconProps}>
        <path d="M9 2h6l1 5-1 3H9L8 7l1-5Z" />
        <circle cx="12" cy="12" r="4" />
        <path d="M9 14 8 17l1 5h6l1-5-1-3M12 10v2l1.5 1" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3Z" />
    </svg>
  );
};

const buildCategoryGroups = (products = []) => {
  const groups = products.reduce((accumulator, product) => {
    const label = normalizeProductSubcategory(product);
    const id = categoryId(label);

    if (!accumulator[id]) {
      accumulator[id] = {
        id,
        label,
        products: [],
      };
    }

    accumulator[id].products.push(product);
    return accumulator;
  }, {});

  return Object.values(groups).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.label);
    const bIndex = CATEGORY_ORDER.indexOf(b.label);
    const safeA = aIndex === -1 ? CATEGORY_ORDER.length : aIndex;
    const safeB = bIndex === -1 ? CATEGORY_ORDER.length : bIndex;
    return safeA - safeB || a.label.localeCompare(b.label);
  });
};

const ProductCard = ({ product, vendorName, isInCompare, toggleCompareItem }) => (
  <article className="group luxury-product-card overflow-hidden border border-white/10 bg-[#0d0d0d] text-white transition duration-500 hover:-translate-y-2 hover:border-[#d8b66a]/65">
    <Link href={`/products/${product._id}`} className="relative block">
      <div className="aspect-[4/5] w-full overflow-hidden bg-[#050505]">
        <Image
          width={500}
          height={640}
          src={withCloudinaryProxy(product.mainImage)}
          alt={product.name}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_42%,rgba(0,0,0,0.84)_100%)]" />
      <div className="absolute left-4 top-4 border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
        {product.subcategory || product.category || "Selection"}
      </div>
      <p className="absolute right-4 top-4 bg-[#d8b66a] px-3 py-2 text-sm font-black text-black shadow-xl shadow-black/30">
        {productPriceLabel(product)}
      </p>
    </Link>
    <div className="p-5">
      <Link href={`/products/${product._id}`}>
        <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-semibold leading-tight text-white transition group-hover:text-[#d8b66a]">
          {product.name}
        </h3>
      </Link>
      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/42">
        {vendorName}
      </p>
      <div className="mt-5 grid grid-cols-[1fr,0.72fr] gap-2">
        <button
          type="button"
          onClick={() => toggleCompareItem(product)}
          className="border border-[#d8b66a]/25 px-3 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:border-[#d8b66a] hover:text-[#d8b66a]"
        >
          {isInCompare(product._id) ? "Retirer" : "Comparer"}
        </button>
        <Link
          href={`/assistant?q=${encodeURIComponent(`Compare ${product.name} de ${vendorName}`)}`}
          className="bg-[#d8b66a] px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#f0d38a]"
        >
          AI
        </Link>
      </div>
    </div>
  </article>
);

const SharedCatalog = ({
  displayVendor,
  newProducts,
  categoryGroups,
  isInCompare,
  toggleCompareItem,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}) => {
  const groups = categoryGroups?.length ? categoryGroups : buildCategoryGroups(newProducts);

  return (
    <section className="mt-10" id="catalogue-luxury">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b66a]/75">
            Collezione boutique
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            Produits par catégorie
          </h2>
        </div>
        <Link
          href={`/products?vendor=${displayVendor.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b66a]"
        >
          Voir tout le catalogue
        </Link>
      </div>

      {groups.length ? (
        <>
          <nav
            aria-label="Catégories Luxury Fahd"
            className="sticky top-0 z-20 mt-7 -mx-4 overflow-x-auto border-y border-[#d8b66a]/20 bg-[#070707]/92 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-none"
          >
            <div className="flex min-w-max gap-3">
              {groups.map((group) => (
                <a
                  key={`dock-${group.id}`}
                  href={`#${group.id}`}
                  className="inline-flex items-center gap-2 border border-[#d8b66a]/25 bg-black/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#d8b66a] hover:text-[#d8b66a]"
                >
                  <CategoryIcon name={group.label} />
                  <span>{group.label}</span>
                  <span className="text-[#d8b66a]">{group.products.length}</span>
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-8 space-y-12">
            {groups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-28">
                <div className="mb-5 flex flex-col gap-3 border-b border-[#d8b66a]/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#d8b66a]/35 bg-[#d8b66a]/10 text-[#d8b66a]">
                      <CategoryIcon name={group.label} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b66a]/70">
                        {group.products.length} produit(s)
                      </p>
                      <h3 className="mt-1 text-2xl font-black text-white">
                        {group.label}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/products?vendor=${displayVendor.slug}&subcategory=${encodeURIComponent(group.label)}`}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b66a]"
                  >
                    Voir toute la catégorie
                  </Link>
                </div>

                <div className={`grid grid-cols-1 gap-5 ${columns}`}>
                  {group.products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      vendorName={displayVendor.name}
                      isInCompare={isInCompare}
                      toggleCompareItem={toggleCompareItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 border border-dashed border-[#d8b66a]/25 p-8 text-center">
          <p className="text-sm font-semibold text-white">
            Aucun produit pour cette boutique pour le moment
          </p>
          <p className="mt-2 text-sm text-white/55">
            Ajoute des produits depuis l&apos;admin pour voir la vitrine complète.
          </p>
        </div>
      )}
    </section>
  );
};

const StorefrontHero = ({ displayVendor, vendorProducts, vendorStats, compareCount }) => {
  const ctaTextByTemplate = {
    minimal: "Découvrir la boutique",
    catalog: "Entrer dans le catalogue",
    story: "Lire la vitrine",
    promo: "Voir les meilleures offres",
  };

  const headlineByTemplate = {
    minimal: displayVendor.tagline,
    catalog: "Une boutique pensée pour comparer, filtrer et acheter vite.",
    story: "Une boutique qui raconte son univers avant même de vendre.",
    promo: "Une vitrine conçue pour convertir les nouveautés et les offres.",
  };

  const supportingByTemplate = {
    minimal: displayVendor.shortDescription,
    catalog:
      "Le client entre d'abord dans un catalogue riche, voit les catégories fortes et bascule vite vers les produits pertinents.",
    story:
      "Le template story met en avant la personnalité de la marque, son ambiance et une sélection éditoriale courte et forte.",
    promo:
      "Le template promo pousse les vedettes, les prix visibles et les appels à l'action les plus commerciaux.",
  };

  return (
    <section className="luxury-store-hero relative overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0">
        <Image
          src={withCloudinaryProxy(displayVendor.banner)}
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.88)_45%,rgba(5,5,5,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(216,182,106,0.28),transparent_34%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-end lg:px-8">
        <div>
          <Link
            href="/boutiques"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b66a]"
          >
            Retour aux boutiques
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <div
              className="relative h-16 w-16 overflow-hidden rounded-full border border-[#d8b66a]/45 bg-black shadow-2xl shadow-[#d8b66a]/15"
            >
              <Image
                src={withCloudinaryProxy(displayVendor.logo)}
                alt={`${displayVendor.name} logo`}
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                Italian luxury storefront
              </p>
              <p className="mt-2 text-lg font-bold text-[#d8b66a]">{displayVendor.name}</p>
            </div>
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black uppercase leading-[0.88] sm:text-7xl lg:text-8xl">
            {displayVendor.name}
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-semibold text-[#d8b66a] sm:text-2xl">
            {headlineByTemplate[displayVendor.template]}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
            {supportingByTemplate[displayVendor.template]}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
            <span className="border border-[#d8b66a]/35 bg-[#d8b66a]/10 px-3 py-1 text-[#d8b66a]">
              {displayVendor.templateLabel}
            </span>
            <span className="border border-white/10 bg-white/10 px-3 py-1">
              {displayVendor.city || "Tunisie"}
            </span>
            <span className="border border-white/10 bg-white/10 px-3 py-1">
              {vendorProducts.length} produit(s)
            </span>
            <span className="border border-white/10 bg-white/10 px-3 py-1">
              {vendorStats.trustLabel}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/products?vendor=${displayVendor.slug}`}
              className="inline-flex items-center justify-center bg-[#d8b66a] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#f0d38a]"
            >
              {ctaTextByTemplate[displayVendor.template]}
            </Link>
            <Link
              href={`/assistant?q=${encodeURIComponent(`Montre-moi les produits de ${displayVendor.name}`)}`}
              className="inline-flex items-center justify-center border border-[#d8b66a]/35 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8b66a] hover:text-[#d8b66a]"
            >
              Demander à l&apos;AI
            </Link>
          </div>
        </div>

        <div className="luxury-stat-panel grid gap-3 border border-[#d8b66a]/25 bg-black/45 p-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-[#d8b66a]/15 p-3">
              <p className="text-white/45">Prix moyen</p>
              <p className="mt-2 font-semibold text-[#d8b66a]">
                {statsPriceLabel(vendorStats)}
              </p>
            </div>
            <div className="border border-[#d8b66a]/15 p-3">
              <p className="text-white/45">Comparateur</p>
              <p className="mt-2 font-semibold text-[#d8b66a]">{compareCount || 0} sélection(s)</p>
            </div>
            <div className="border border-[#d8b66a]/15 p-3">
              <p className="text-white/45">Univers</p>
              <p className="mt-2 font-semibold text-[#d8b66a]">
                {vendorStats.categories[0] || "Marketplace"}
              </p>
            </div>
            <div className="border border-[#d8b66a]/15 p-3">
              <p className="text-white/45">Contact</p>
              <p className="mt-2 font-semibold text-[#d8b66a]">
                {displayVendor.whatsapp || displayVendor.phone || "Message direct"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MinimalLayout = (props) => {
  const { displayVendor, vendorStats, featuredProducts, newProducts, isInCompare, toggleCompareItem } = props;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Score boutique", `${vendorStats.trustScore}/100`],
          [
            "Gamme de prix",
            statsPriceLabel(vendorStats, "range"),
          ],
          [
            "Sous-catégories",
            vendorStats.subcategories.slice(0, 2).join(" / ") || "Sélection générale",
          ],
          [
            "Contact rapide",
            displayVendor.whatsapp || displayVendor.phone || "Message via boutique",
          ],
        ].map(([label, value]) => (
          <article key={label} className="border border-black/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              {label}
            </p>
            <p className="mt-3 text-sm font-bold text-[#16181b]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,0.95fr]">
        <section className="bg-[#f7f4ef] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            À propos
          </p>
          <h2 className="mt-3 text-3xl font-black">L’identité de la boutique</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/70 sm:text-base">
            {displayVendor.description}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="border border-black/10 bg-white/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Livraison
              </p>
              <p className="mt-3 text-sm leading-7 text-black/70">
                {displayVendor.shippingPolicy}
              </p>
            </div>
            <div className="border border-black/10 bg-white/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Retour / échange
              </p>
              <p className="mt-3 text-sm leading-7 text-black/70">
                {displayVendor.returnPolicy}
              </p>
            </div>
          </div>
        </section>

        <section className="border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Actions boutique
          </p>
          <div className="mt-4 grid gap-3">
            <Link
              href="/compare"
              className="inline-flex items-center justify-center bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Aller au comparateur
            </Link>
            <Link
              href={`/assistant?q=${encodeURIComponent(`Je veux acheter chez ${displayVendor.name}`)}`}
              className="inline-flex items-center justify-center border border-black/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black"
            >
              Concierge AI
            </Link>
          </div>
          <div className="mt-6 grid gap-3 text-sm leading-7 text-black/70">
            <p>
              <span className="font-semibold text-[#16181b]">Template:</span>{" "}
              {displayVendor.templateLabel}
            </p>
            <p>
              <span className="font-semibold text-[#16181b]">Ville:</span>{" "}
              {displayVendor.city || "Tunisie"}
            </p>
            <p>
              <span className="font-semibold text-[#16181b]">Contact:</span>{" "}
              {displayVendor.whatsapp || displayVendor.phone || "À configurer"}
            </p>
          </div>
        </section>
      </div>

      {featuredProducts.length ? (
        <section className="mt-10 border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Produits vedettes
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#16181b]">
                La sélection à montrer en premier
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link
                key={`featured-${product._id}`}
                href={`/products/${product._id}`}
                className="border border-black/10 bg-[#fcfaf6] p-4 transition hover:-translate-y-1"
              >
                <div className="aspect-[4/4.3] overflow-hidden bg-gray-100">
                  <Image
                    src={withCloudinaryProxy(product.mainImage)}
                    alt={product.name}
                    width={600}
                    height={640}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-4 text-lg font-bold text-[#16181b]">{product.name}</p>
                <p className="mt-2 text-sm text-gray-500">{product.category}</p>
                <p className="mt-3 text-sm font-bold text-[#16181b]">
                  {productPriceLabel(product)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <SharedCatalog
        displayVendor={displayVendor}
        newProducts={newProducts}
        isInCompare={isInCompare}
        toggleCompareItem={toggleCompareItem}
      />
    </>
  );
};

const CatalogLayout = (props) => {
  const { displayVendor, vendorStats, featuredProducts, newProducts, isInCompare, toggleCompareItem } = props;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
        <aside className="border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Navigation boutique
          </p>
          <div className="mt-5 grid gap-3">
            <div className="border border-black/10 bg-[#fcfaf6] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Catégories</p>
              <p className="mt-3 text-sm font-semibold text-[#16181b]">
                {vendorStats.categories.join(" / ") || "Marketplace"}
              </p>
            </div>
            <div className="border border-black/10 bg-[#fcfaf6] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Sous-catégories</p>
              <p className="mt-3 text-sm font-semibold text-[#16181b]">
                {vendorStats.subcategories.slice(0, 4).join(" / ") || "Sélection générale"}
              </p>
            </div>
            <div className="border border-black/10 bg-[#fcfaf6] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Service</p>
              <p className="mt-3 text-sm leading-7 text-black/70">
                {displayVendor.shippingPolicy}
              </p>
            </div>
          </div>
        </aside>

        <div className="border border-black/10 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Score", `${vendorStats.trustScore}/100`],
              ["Prix moyen", statsPriceLabel(vendorStats)],
              ["Produits", `${newProducts.length}`],
              ["Contact", displayVendor.whatsapp || displayVendor.phone || "Direct"],
            ].map(([label, value]) => (
              <article key={label} className="border border-black/10 bg-[#fcfaf6] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-black/45">{label}</p>
                <p className="mt-3 text-sm font-bold text-[#16181b]">{value}</p>
              </article>
            ))}
          </div>

          {featuredProducts.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link
                  key={`catalog-featured-${product._id}`}
                  href={`/products/${product._id}`}
                  className="border border-black/10 p-4 transition hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={withCloudinaryProxy(product.mainImage)}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 text-base font-bold text-[#16181b]">{product.name}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gray-500">
                    {product.category}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <SharedCatalog
        displayVendor={displayVendor}
        newProducts={newProducts}
        isInCompare={isInCompare}
        toggleCompareItem={toggleCompareItem}
        columns="sm:grid-cols-2 lg:grid-cols-4"
      />
    </>
  );
};

const StoryLayout = (props) => {
  const { displayVendor, vendorStats, featuredProducts, newProducts, isInCompare, toggleCompareItem } = props;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="bg-[#f4ece4] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Histoire de la boutique
          </p>
          <h2 className="mt-3 text-3xl font-black text-[#16181b]">
            Une vitrine qui raconte avant de vendre
          </h2>
          <p className="mt-4 text-sm leading-7 text-black/70 sm:text-base">
            {displayVendor.description}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="border border-black/10 bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Promesse</p>
              <p className="mt-3 text-sm leading-7 text-black/70">{displayVendor.tagline}</p>
            </div>
            <div className="border border-black/10 bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Livraison</p>
              <p className="mt-3 text-sm leading-7 text-black/70">{displayVendor.shippingPolicy}</p>
            </div>
            <div className="border border-black/10 bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Échange</p>
              <p className="mt-3 text-sm leading-7 text-black/70">{displayVendor.returnPolicy}</p>
            </div>
          </div>
        </article>

        <article className="border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Signaux de confiance
          </p>
          <div className="mt-5 space-y-3">
            {[
              ["Score boutique", `${vendorStats.trustScore}/100`],
              ["Ville", displayVendor.city || "Tunisie"],
              ["Prix moyen", statsPriceLabel(vendorStats)],
              ["Contact", displayVendor.whatsapp || displayVendor.phone || "Direct"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border border-black/10 p-4">
                <p className="text-sm text-black/60">{label}</p>
                <p className="text-sm font-semibold text-[#16181b]">{value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {featuredProducts.length ? (
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b66a]/75">
                Lusso Italiano
              </p>
              <h2 className="mt-3 text-3xl font-black text-white">
                Pièces signature de la boutique
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.18fr,0.82fr]">
            <Link
              href={`/products/${featuredProducts[0]._id}`}
              className="group relative min-h-[560px] overflow-hidden border border-[#d8b66a]/25 bg-[#0b0b0b]"
            >
              <div className="absolute inset-0 overflow-hidden bg-[#050505]">
                <Image
                  src={withCloudinaryProxy(featuredProducts[0].mainImage)}
                  alt={featuredProducts[0].name}
                  width={900}
                  height={680}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.18)_38%,rgba(0,0,0,0.86)_100%)]" />
              <div className="absolute left-6 top-6 border border-[#d8b66a]/35 bg-black/45 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b66a] backdrop-blur">
                Capsule Milano
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d8b66a]/80">
                  Produit de luxe italien
                </p>
                <h3 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                  {featuredProducts[0].name}
                </h3>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="bg-[#d8b66a] px-4 py-3 text-sm font-black text-black">
                    {productPriceLabel(featuredProducts[0])}
                  </span>
                  <span className="border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Voir le produit
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid gap-5">
              {featuredProducts.slice(1).map((product) => (
                <Link
                  key={`story-${product._id}`}
                  href={`/products/${product._id}`}
                  className="group relative min-h-[268px] overflow-hidden border border-[#d8b66a]/20 bg-[#0b0b0b]"
                >
                  <div className="absolute inset-0 bg-[#050505]">
                    <Image
                      src={withCloudinaryProxy(product.mainImage)}
                      alt={product.name}
                      width={700}
                      height={440}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.38)_62%,rgba(0,0,0,0.08)_100%)]" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b66a]/80">
                      Sartoria moderna
                    </p>
                    <h3 className="mt-2 max-w-sm text-2xl font-black uppercase leading-none text-white">
                      {product.name}
                    </h3>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="bg-[#d8b66a] px-3 py-2 text-xs font-black text-black">
                        {productPriceLabel(product)}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/65">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SharedCatalog
        displayVendor={displayVendor}
        newProducts={newProducts}
        isInCompare={isInCompare}
        toggleCompareItem={toggleCompareItem}
      />
    </>
  );
};

const PromoLayout = (props) => {
  const { displayVendor, vendorStats, featuredProducts, newProducts, isInCompare, toggleCompareItem } = props;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Offre boutique", displayVendor.tagline],
          ["Prix d'appel", statsPriceLabel(vendorStats, "min")],
          ["Contact express", displayVendor.whatsapp || displayVendor.phone || "Direct"],
          ["Confiance", vendorStats.trustLabel],
        ].map(([label, value]) => (
          <article key={label} className="border border-black/10 bg-[#fff7ed] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              {label}
            </p>
            <p className="mt-3 text-sm font-bold text-[#16181b]">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <article className="border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Bloc commercial
          </p>
          <h2 className="mt-3 text-3xl font-black text-[#16181b]">
            Une vitrine pensée pour accélérer la décision
          </h2>
          <p className="mt-4 text-sm leading-7 text-black/70">
            Le template promo met en avant les meilleurs produits, les prix bien
            visibles et des appels à l&apos;action plus directs pour favoriser la conversion.
          </p>
          <div className="mt-6 grid gap-3">
            <Link
              href={`/products?vendor=${displayVendor.slug}`}
              className="inline-flex items-center justify-center bg-[#16181b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Voir les offres
            </Link>
            <Link
              href={`/assistant?q=${encodeURIComponent(`Trouve-moi les meilleures offres de ${displayVendor.name}`)}`}
              className="inline-flex items-center justify-center border border-black/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black"
            >
              AI bonnes affaires
            </Link>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={`promo-${product._id}`}
              href={`/products/${product._id}`}
              className="border border-black/10 bg-white p-4 transition hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={withCloudinaryProxy(product.mainImage)}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-base font-bold text-[#16181b]">{product.name}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-[#7c2d12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                  Vedette
                </span>
                <span className="text-sm font-black text-[#16181b]">
                  {productPriceLabel(product)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SharedCatalog
        displayVendor={displayVendor}
        newProducts={newProducts}
        isInCompare={isInCompare}
        toggleCompareItem={toggleCompareItem}
      />
    </>
  );
};

const StorefrontTemplate = (props) => {
  switch (props.displayVendor.template) {
    case "catalog":
      return <CatalogLayout {...props} />;
    case "story":
      return <StoryLayout {...props} />;
    case "promo":
      return <PromoLayout {...props} />;
    case "minimal":
    default:
      return <MinimalLayout {...props} />;
  }
};

const VendorShowcasePage = () => {
  const params = useParams();
  const { vendors, products } = useContext(ProductContext);
  const { compareCount, isInCompare, toggleCompareItem } = useCompare();

  const vendor = useMemo(
    () => (vendors || []).find((item) => item.slug === params?.slug),
    [params?.slug, vendors]
  );

  const vendorProducts = useMemo(() => {
    const productList = products?.data || [];
    return productList.filter(
      (product) => (product.vendorSlug || "sb-store") === params?.slug
    );
  }, [params?.slug, products]);

  const displayVendor = useMemo(
    () =>
      normalizeVendorForStorefront(
        vendor || {
          name: "SB Store",
          slug: "sb-store",
          city: "Tunisie",
          description: "Boutique principale de la plateforme.",
          contactName: "",
          phone: "",
        }
      ),
    [vendor]
  );

  const vendorStats = useMemo(() => {
    const prices = vendorProducts.map((product) => Number(product.price || 0));
    const categories = [
      ...new Set(vendorProducts.map((product) => product.category).filter(Boolean)),
    ];
    const subcategories = [
      ...new Set(vendorProducts.map((product) => product.subcategory).filter(Boolean)),
    ];
    const avgPrice = prices.length
      ? prices.reduce((sum, value) => sum + value, 0) / prices.length
      : 0;
    const trustScore = calculateVendorTrustScore({
      productCount: vendorProducts.length,
      orderCount: Math.max(1, vendorProducts.length * 2),
      avgRating: 4.2,
      reviewCount: Math.max(1, vendorProducts.length),
    });

    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      avgPrice,
      hidePrices:
        vendorProducts.length > 0 &&
        vendorProducts.every((product) => product.hidePrice),
      categories,
      subcategories,
      trustScore,
      trustLabel: getVendorTrustLabel(trustScore),
    };
  }, [vendorProducts]);

  const categoryGroups = useMemo(
    () => buildCategoryGroups(vendorProducts),
    [vendorProducts]
  );
  const featuredProducts = [];
  const newProducts = vendorProducts;

  return (
    <main className="luxury-storefront min-h-screen bg-[#070707]">
      <StorefrontHero
        displayVendor={displayVendor}
        vendorProducts={vendorProducts}
        vendorStats={vendorStats}
        compareCount={compareCount}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <StorefrontTemplate
          displayVendor={displayVendor}
          vendorStats={vendorStats}
          featuredProducts={featuredProducts}
          newProducts={newProducts}
          categoryGroups={categoryGroups}
          isInCompare={isInCompare}
          toggleCompareItem={toggleCompareItem}
        />
      </section>
      <style jsx global>{`
        .luxury-storefront {
          background:
            radial-gradient(circle at top left, rgba(216, 182, 106, 0.16), transparent 28%),
            linear-gradient(180deg, #050505 0%, #0b0b0b 42%, #070707 100%);
        }

        .luxury-storefront h2,
        .luxury-storefront h3 {
          letter-spacing: 0;
        }

        .luxury-storefront h1,
        .luxury-storefront h2,
        .luxury-storefront h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
        }

        .luxury-storefront section,
        .luxury-storefront article,
        .luxury-storefront aside {
          border-color: rgba(216, 182, 106, 0.22);
        }

        .luxury-storefront article,
        .luxury-storefront aside {
          background-color: rgba(12, 12, 12, 0.88);
          color: white;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
        }

        .luxury-storefront p {
          color: rgba(255, 255, 255, 0.68);
        }

        .luxury-storefront h2,
        .luxury-storefront h3,
        .luxury-storefront .text-\\[\\#16181b\\] {
          color: #ffffff;
        }

        .luxury-storefront .bg-\\[\\#f7f4ef\\],
        .luxury-storefront .bg-\\[\\#fcfaf6\\],
        .luxury-storefront .bg-\\[\\#f4ece4\\],
        .luxury-storefront .bg-white,
        .luxury-storefront .bg-white\\/55,
        .luxury-storefront .bg-white\\/60 {
          background-color: rgba(14, 14, 14, 0.9);
        }

        .luxury-storefront .text-black,
        .luxury-storefront .text-black\\/70,
        .luxury-storefront .text-black\\/60,
        .luxury-storefront .text-gray-500,
        .luxury-storefront .text-gray-600 {
          color: rgba(255, 255, 255, 0.68);
        }

        .luxury-storefront .text-black\\/45 {
          color: rgba(216, 182, 106, 0.72);
        }

        .luxury-storefront .bg-black,
        .luxury-storefront .bg-\\[\\#16181b\\] {
          background-color: #d8b66a;
          color: #050505;
        }

        .luxury-storefront .border-black\\/10,
        .luxury-storefront .border-black\\/15 {
          border-color: rgba(216, 182, 106, 0.22);
        }

        .luxury-store-hero::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(216, 182, 106, 0.75), transparent);
        }

        .luxury-stat-panel,
        .luxury-product-card {
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(216, 182, 106, 0.16);
        }

        .luxury-product-card {
          position: relative;
          overflow: hidden;
        }

        .luxury-product-card::before {
          content: "";
          position: absolute;
          inset: -40% auto auto -35%;
          width: 42%;
          height: 180%;
          background: rgba(216, 182, 106, 0.18);
          transform: rotate(18deg) translateX(-130%);
          transition: transform 800ms ease;
        }

        .luxury-product-card:hover::before {
          transform: rotate(18deg) translateX(380%);
        }

      `}</style>
    </main>
  );
};

export default VendorShowcasePage;
