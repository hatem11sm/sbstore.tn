"use client";
import { ProductContext } from "@/Context/CreateProduct";
import withCloudinaryProxy from "@/utils/cloudinaryProxy";
import Image from "next/image";
import Link from "next/link";
import { useContext, useMemo } from "react";
import { BsArrowRight, BsStars } from "react-icons/bs";
import {
  buildCategoryPath,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";

const fallbackCategories = [
  {
    name: "Homme",
    slug: "men",
    image: "/images/models/man-fashion.jpg",
    collectionGroup: "man",
    line: "Looks urbains, montres et pieces fortes.",
    tone: "Studio homme",
  },
  {
    name: "Femme",
    slug: "women",
    image: "/images/models/woman-fashion.jpg",
    collectionGroup: "woman",
    line: "Mode, accessoires et inspirations premium.",
    tone: "Selection femme",
  },
  {
    name: "Enfant",
    slug: "kids",
    image: "/images/models/kids-fashion.jpg",
    collectionGroup: "kids",
    line: "Selections faciles pour enfants et cadeaux.",
    tone: "Univers kids",
  },
];

const collectionMeta = {
  man: {
    label: "Studio homme",
    line: "Looks urbains, montres et pieces fortes.",
    accent: "#7dd3fc",
  },
  kids: {
    label: "Univers kids",
    line: "Selections faciles pour enfants et cadeaux.",
    accent: "#facc15",
  },
  woman: {
    label: "Selection femme",
    line: "Mode, accessoires et inspirations premium.",
    accent: "#f472b6",
  },
};

const collectionOrder = ["man", "woman", "kids"];

const getCollectionRank = (collectionGroup) => {
  const rank = collectionOrder.indexOf(collectionGroup);
  return rank === -1 ? collectionOrder.length : rank;
};

const Collection = () => {
  const { categories } = useContext(ProductContext);

  const displayCategories = useMemo(() => {
    if (!categories.length) {
      return fallbackCategories;
    }

    const normalized = categories
      .map((category, index) => {
        const collectionGroup = normalizeCollectionGroup(category.collectionGroup);

        return {
          key: category._id || `${category.slug}-${index}`,
          name: category.name,
          slug: category.slug,
          collectionGroup,
          image: category.image || fallbackCategories[index % fallbackCategories.length].image,
          line:
            collectionMeta[collectionGroup]?.line ||
            "Une entree rapide vers les meilleurs produits SB Store.",
          tone: collectionMeta[collectionGroup]?.label || "Collection SB",
        };
      })
      .sort(
        (a, b) =>
          getCollectionRank(a.collectionGroup) -
          getCollectionRank(b.collectionGroup)
      );

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
    <section className="relative overflow-hidden bg-[#101113] text-white">
      <div className="absolute inset-0 opacity-25">
        <div className="collection-grid-bg" />
      </div>
      <div className="collection-light collection-light-left" />
      <div className="collection-light collection-light-right" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              <BsStars className="h-4 w-4" />
              Selections SB Store
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
              Collections 3D
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/60 sm:text-base">
            Une entree immersive pour les univers homme, femme et enfant:
            images en profondeur, reflets modernes et navigation directe.
          </p>
        </header>

        <ul className="collection-stage relative z-10 mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {displayCategories.map((category, index) => {
            const meta =
              collectionMeta[category.collectionGroup] ||
              collectionMeta[fallbackCategories[index]?.collectionGroup] ||
              collectionMeta.woman;
            return (
              <li
                key={
                  category.key ||
                  `${category.collectionGroup || "collection"}-${category.slug}`
                }
                className={`collection-card-wrap collection-card-${index + 1}`}
              >
                <Link
                  href={buildCategoryPath(category)}
                  className="collection-card group relative block min-h-[430px] overflow-hidden border border-white/12 bg-white/8 p-4 text-white backdrop-blur"
                  style={{ "--accent": meta.accent }}
                >
                  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-x-8 top-8 h-24 bg-[var(--accent)] blur-3xl" />
                  </div>
                  <div className="collection-shine" />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                        {category.tone || meta.label}
                      </p>
                      <h3 className="mt-3 text-4xl font-black uppercase leading-none text-white">
                        {category.name}
                      </h3>
                    </div>
                    <span className="collection-index flex h-12 w-12 items-center justify-center border border-white/15 bg-black/25 text-xs font-black text-white">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="collection-image-shell">
                    <Image
                      height={520}
                      width={420}
                      src={withCloudinaryProxy(category.image)}
                      alt={`${category.name} collection`}
                      unoptimized
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.55))]" />
                  </div>

                  <div className="relative z-10 mt-6">
                    <p className="max-w-xs text-sm leading-6 text-white/65">
                      {category.line || meta.line}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 border border-white/15 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition duration-300 group-hover:bg-[var(--accent)]">
                      Voir la collection <BsArrowRight className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="collection-orbit collection-orbit-one" />
                  <div className="collection-orbit collection-orbit-two" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .collection-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
          background-size: 42px 42px;
          transform: perspective(700px) rotateX(62deg) translateY(-22%);
          transform-origin: center top;
        }

        .collection-light {
          position: absolute;
          pointer-events: none;
          width: 38%;
          height: 46%;
          filter: blur(82px);
          opacity: 0.26;
          transform: skewY(-10deg);
        }

        .collection-light-left {
          left: -14%;
          top: 8%;
          background: linear-gradient(135deg, #7dd3fc, transparent);
        }

        .collection-light-right {
          right: -16%;
          bottom: 0;
          background: linear-gradient(135deg, #f472b6, #facc15);
        }

        .collection-stage {
          perspective: 1200px;
        }

        .collection-card-wrap {
          transform-style: preserve-3d;
        }

        .collection-card {
          box-shadow:
            0 34px 90px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          transform-style: preserve-3d;
          transition:
            transform 600ms ease,
            border-color 300ms ease,
            background 300ms ease;
          animation: collectionFloat 7s ease-in-out infinite alternate;
        }

        .collection-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.2), transparent 32%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 58%);
          opacity: 0.55;
        }

        .collection-shine {
          position: absolute;
          inset: -40% auto auto -35%;
          width: 45%;
          height: 180%;
          background: rgba(255, 255, 255, 0.18);
          transform: rotate(18deg) translateX(-130%);
          transition: transform 700ms ease;
        }

        .collection-card:hover .collection-shine {
          transform: rotate(18deg) translateX(360%);
        }

        .collection-index {
          transform: translateZ(84px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
        }

        .collection-card-1 .collection-card {
          transform: rotateY(8deg) translateZ(0);
        }

        .collection-card-2 .collection-card {
          animation-delay: -1.8s;
          transform: translateY(28px) translateZ(40px);
        }

        .collection-card-3 .collection-card {
          animation-delay: -3.2s;
          transform: rotateY(-8deg) translateZ(0);
        }

        .collection-card:hover {
          border-color: color-mix(in srgb, var(--accent) 70%, white 30%);
          background: rgba(255, 255, 255, 0.13);
          transform: rotateY(0deg) translateY(-12px) translateZ(70px);
        }

        .collection-image-shell {
          position: relative;
          z-index: 5;
          margin-top: 28px;
          height: 250px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.28);
          transform: translateZ(54px);
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.3);
        }

        .collection-orbit {
          position: absolute;
          pointer-events: none;
          border: 1px solid var(--accent);
          opacity: 0.38;
          transform: rotateX(70deg) rotateZ(-16deg);
        }

        .collection-orbit-one {
          right: -34px;
          top: 118px;
          width: 180px;
          height: 180px;
          animation: orbitSpin 9s linear infinite;
        }

        .collection-orbit-two {
          left: -40px;
          bottom: 92px;
          width: 130px;
          height: 130px;
          animation: orbitSpin 11s linear infinite reverse;
        }

        @keyframes collectionFloat {
          from {
            margin-top: 0;
          }
          to {
            margin-top: -14px;
          }
        }

        @keyframes orbitSpin {
          from {
            rotate: 0deg;
          }
          to {
            rotate: 360deg;
          }
        }

        @media (max-width: 1023px) {
          .collection-card-1 .collection-card,
          .collection-card-2 .collection-card,
          .collection-card-3 .collection-card,
          .collection-card:hover {
            transform: none;
          }

          .collection-card-2 .collection-card {
            animation-delay: -1.8s;
          }
        }
      `}</style>
    </section>
  );
};

export default Collection;
