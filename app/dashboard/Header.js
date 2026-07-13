"use client";

import { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { PiSignOut } from "react-icons/pi";
import { Context } from "@/Context/Context";
import { AdminContext } from "@/Context/AdminProvider";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/create", label: "Create Product" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/vendors", label: "Boutiques" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
];

const Header = () => {
  const { user, handleLogout } = useContext(Context);
  const { totalOrders, totalProduct, isAdminView, scopedVendor } =
    useContext(AdminContext);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.data?.name?.split(" ")?.[0] ?? "there";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const activeLabel = (
    isAdminView
      ? navItems
      : [
          { href: "/dashboard", label: "Mon activité" },
          { href: "/dashboard/create", label: "Ajouter un produit" },
          { href: "/dashboard/products", label: "Mes produits" },
          { href: "/dashboard/orders", label: "Mes commandes" },
          {
            href: scopedVendor?._id
              ? `/dashboard/vendors/${scopedVendor._id}`
              : "/dashboard/vendors",
            label: "Ma boutique",
          },
        ]
  ).find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)
    )?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            {greeting}, {firstName}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {activeLabel}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 sm:text-sm">
            <span className="rounded-full bg-slate-900/5 px-3 py-1 font-medium text-slate-700">
              {totalProduct?.length ?? 0} produit(s)
            </span>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 font-medium text-indigo-600">
              {totalOrders?.length ?? 0} commande(s)
            </span>
            {!isAdminView && scopedVendor?.name ? (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700">
                {scopedVendor.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <PiSignOut size={18} />
            Se déconnecter
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {(isAdminView
              ? navItems
              : [
                  { href: "/dashboard", label: "Mon activité" },
                  { href: "/dashboard/create", label: "Ajouter un produit" },
                  { href: "/dashboard/products", label: "Mes produits" },
                  { href: "/dashboard/orders", label: "Mes commandes" },
                  {
                    href: scopedVendor?._id
                      ? `/dashboard/vendors/${scopedVendor._id}`
                      : "/dashboard/vendors",
                    label: "Ma boutique",
                  },
                ]).map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              <PiSignOut size={18} />
              Se déconnecter
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
