"use client";
import { Context } from "@/Context/Context";
import { ProductContext } from "@/Context/CreateProduct";
import Image from "next/image";
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
        label: "Woman",
        tagline: "Edition curated for her wardrobe.",
        href: resolveHref("woman", "woman"),
        items: groupedCategories.woman || [],
        collectionGroup: "woman",
      },
      {
        key: "man",
        label: "Man",
        tagline: "Modern tailoring and essentials.",
        href: resolveHref("man", "man"),
        items: groupedCategories.man || [],
        collectionGroup: "man",
      },
      {
        key: "kids",
        label: "Kids",
        tagline: "Play-ready looks in motion.",
        href: resolveHref("kids", "kids"),
        items: groupedCategories.kids || [],
        collectionGroup: "kids",
      },
    ];
  }, [categories, groupedCategories]);

  return (
    <>
      {!user?.data?.isAdmin && (
        <div className="w-[97%] mx-auto my-5">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-indigo-500 p-6 shadow-lg sm:flex-row sm:justify-between">
            <strong className="text-xl text-white sm:text-xl capitalize text-center md:text-start">
              {" "}
              contact us <span className="text-[#12171D]"> now </span>
              <p className="text-xs text-white my-2 w-full text-center md:text-start ">
                for more information about our services and products, please
                visit our website{" "}
                OR click this link
              </p>
            </strong>

            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#12171D] bg-[#000000] px-8 py-3 text-white hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus:ring active:bg-white/90"
              href="/contact"
            >
              <span className="text-sm font-medium"> Lets Get Started </span>

              <svg
                className="h-5 w-5 rtl:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
      <footer className="bg-white lg:grid lg:grid-cols-5">
        <div className="relative block h-32 lg:col-span-2 lg:h-full">
          <Image
            src="/logo/logo.png"
            alt="footer"
            layout="fill"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="px-4 py-16 sm:px-6 lg:col-span-3 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,2fr]">
            <div className="space-y-10">
              <p>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {" "}
                  Call us{" "}
                </span>

                <a
                  href="tel:+21625413401"
                  className="text-2xl font-medium text-gray-900 hover:opacity-75 sm:text-3xl flex space-x-4 mt-3"
                >
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Tunisia.svg"
                    alt="phone"
                    width={40}
                    height={40}
                  />{" "}
                  <span>25 413 401</span>
                </a>
              </p>

              <ul className="mt-8 flex gap-6">
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=100092622500797"
                    rel="noreferrer"
                    target="_blank"
                    className="text-gray-700 transition hover:opacity-75"
                  >
                    <span className="sr-only">Facebook</span>

                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>

                <li>
                  <a
                    href="https://www.instagram.com/s_and_b.store2/s"
                    rel="noreferrer"
                    target="_blank"
                    className="text-gray-700 transition hover:opacity-75"
                  >
                    <span className="sr-only">Instagram</span>

                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {footerCollections.map((collection) => (
                <div key={collection.key}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={collection.href}
                      className="text-xs uppercase tracking-[0.45em] text-gray-500 hover:text-gray-900"
                    >
                      {collection.label}
                    </Link>
                    <span className="text-[0.6rem] uppercase tracking-[0.4em] text-gray-400">
                      {collection.items.length
                        ? `${collection.items.length} items`
                        : "Soon"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {collection.tagline}
                  </p>
                  {collection.items.length ? (
                    <ul className="mt-5 space-y-2 text-sm">
                      {collection.items.slice(0, 6).map((category) => (
                        <li key={category._id}>
                          <Link
                            href={buildCategoryPath(category)}
                            className="group flex items-center justify-between text-gray-700 transition hover:text-gray-900"
                          >
                            <span className="font-medium uppercase tracking-[0.2em]">
                              {category.name}
                            </span>
                            {category.subcategories?.length ? (
                              <span className="text-[0.55rem] uppercase tracking-[0.35em] text-gray-400 group-hover:text-gray-600">
                                {category.subcategories.slice(0, 2).join(" · ")}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 text-xs uppercase tracking-[0.35em] text-gray-300">
                      Add categories in admin to display here.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-12">
            <div className="sm:flex sm:items-center sm:justify-between">
              <ul className="flex flex-wrap gap-4 text-xs">
                <li>
                  <a
                    href="#!"
                    className="text-gray-500 transition hover:opacity-75"
                  >
                    {" "}
                    Terms & Conditions{" "}
                  </a>
                </li>

                <li>
                  <a
                    href="#!"
                    className="text-gray-500 transition hover:opacity-75"
                  >
                    {" "}
                    Privacy Policy{" "}
                  </a>
                </li>

                <li>
                  <a
                    href="#!"
                    className="text-gray-500 transition hover:opacity-75"
                  >
                    {" "}
                    Cookies{" "}
                  </a>
                </li>
              </ul>

              <p className="mt-8 text-xs text-gray-500 sm:mt-0">
                &copy;2025. S&B Store . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
