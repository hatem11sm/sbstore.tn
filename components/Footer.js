"use client";
import { Context } from "@/Context/Context";
import { ProductContext } from "@/Context/CreateProduct";
import Link from "next/link";
import { useContext, useMemo } from "react";
import {
  buildCategoryPath,
  buildCategoryPathFromParts,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";

const Footer = () => {
  const { user } = useContext(Context);
  const { categories } = useContext(ProductContext);

  const groupedCategories = useMemo(() => {
    const template = { woman: [], man: [], kids: [] };
    (categories || []).forEach((category) => {
      const key = normalizeCollectionGroup(category.collectionGroup);
      if (!template[key]) template[key] = [];
      template[key].push(category);
    });
    Object.keys(template).forEach((key) => {
      template[key] = template[key].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    });
    return template;
  }, [categories]);

  const footerCollections = useMemo(() => {
    const resolveHref = (hint, fallbackGroup) => {
      const normalizedGroup = normalizeCollectionGroup(fallbackGroup);
      const normalizedHint = (hint || "").toLowerCase();
      if (!normalizedHint) {
        return `/${normalizedGroup}`;
      }
      const exactMatch = categories?.find(
        (category) =>
          category.slug?.toLowerCase() === normalizedHint &&
          normalizeCollectionGroup(category.collectionGroup) === normalizedGroup
      );
      if (exactMatch) {
        return buildCategoryPath(exactMatch);
      }
      const looseMatch = categories?.find((category) => {
        const slug = category.slug?.toLowerCase() || "";
        const label = category.name?.toLowerCase() || "";
        return slug.includes(normalizedHint) || label.includes(normalizedHint);
      });
      if (looseMatch) {
        return buildCategoryPath(looseMatch);
      }
      return buildCategoryPathFromParts(normalizedGroup, normalizedHint);
    };

    return [
      {
        key: "woman",
        label: "Femme",
        tagline: "Sélection pensée pour elle.",
        href: resolveHref("woman", "woman"),
        items: groupedCategories.woman || [],
        collectionGroup: "woman",
      },
      {
        key: "man",
        label: "Homme",
        tagline: "Essentiels modernes et coupes propres.",
        href: resolveHref("man", "man"),
        items: groupedCategories.man || [],
        collectionGroup: "man",
      },
      {
        key: "kids",
        label: "Enfant",
        tagline: "Looks confortables pour bouger.",
        href: resolveHref("kids", "kids"),
        items: groupedCategories.kids || [],
        collectionGroup: "kids",
      },
    ];
  }, [categories, groupedCategories]);

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="text-3xl font-semibold text-black">
              SB Store
            </Link>
            <p className="mt-5 max-w-xs text-xs leading-6 text-black/50">
              Votre plateforme multi-boutiques en Tunisie: plusieurs vendeurs,
              un catalogue commun et des vitrines faciles a explorer.
            </p>
            {!user?.data?.isAdmin && (
              <Link
                href="/contact"
                className="mt-6 inline-flex border-b border-black pb-1 text-xs font-medium uppercase tracking-[0.18em] text-black"
              >
                Nous contacter
              </Link>
            )}
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-black">
              Collections
            </h3>
            <ul className="mt-5 space-y-3 text-xs uppercase tracking-[0.14em] text-black/55">
              {footerCollections.map((collection) => (
                <li key={collection.key}>
                  <Link href={collection.href} className="transition hover:text-black">
                    {collection.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/boutiques" className="transition hover:text-black">
                  Boutiques
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition hover:text-black">
                  Tous les produits
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-black">
              Aide
            </h3>
            <ul className="mt-5 space-y-3 text-xs uppercase tracking-[0.14em] text-black/55">
              <li>
                <a href="tel:+21625413401" className="transition hover:text-black">
                  25 413 401
                </a>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-black">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-black">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-black">
              Réseaux
            </h3>
            <ul className="mt-5 space-y-3 text-xs uppercase tracking-[0.14em] text-black/55">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=100092622500797"
                  rel="noreferrer"
                  target="_blank"
                  className="transition hover:text-black"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/s_and_b.store2/s"
                  rel="noreferrer"
                  target="_blank"
                  className="transition hover:text-black"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-black/10 pt-6 text-[0.65rem] uppercase tracking-[0.16em] text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy;2026 SB Store. Tous droits reserves.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#!" className="transition hover:text-black">
              Conditions
            </a>
            <a href="#!" className="transition hover:text-black">
              Confidentialité
            </a>
            <a href="#!" className="transition hover:text-black">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
