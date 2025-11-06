"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import { FaRegListAlt, FaUsers } from "react-icons/fa";
import { PiPackage } from "react-icons/pi";
import { LuShoppingBag } from "react-icons/lu";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: MdOutlineSpaceDashboard,
  },
  {
    href: "/dashboard/create",
    label: "Create Product",
    icon: HiOutlinePlusCircle,
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: FaRegListAlt,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: FaUsers,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: PiPackage,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: LuShoppingBag,
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-2xl">
      <div className="px-8 py-10 border-b border-white/10">
        <Link href="/dashboard" className="block">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            SB Store
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Admin Control
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-900/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className={`text-lg transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-8 border-t border-white/10 text-xs text-white/60">
        <p className="font-semibold text-white">
          Tip
        </p>
        <p className="mt-2 leading-relaxed">
          Stay close to your customers by keeping order statuses up to date and
          replying quickly to any special notes.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
