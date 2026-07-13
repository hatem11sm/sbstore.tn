"use client";

import { useContext, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import {
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUser } from "react-icons/fa6";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { PiCurrencyDollarSimpleThin } from "react-icons/pi";
import Link from "next/link";
import { format } from "date-fns";
import { AdminContext } from "@/Context/AdminProvider";
import TableSkeleton from "./TableSkeleton";

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const statCards = [
  {
    key: "users",
    label: "Total users",
    icon: FaUser,
    accent: "from-sky-500/10 to-sky-500/20 text-sky-600",
  },
  {
    key: "products",
    label: "Total products",
    icon: BsFillBoxSeamFill,
    accent: "from-emerald-500/10 to-emerald-500/20 text-emerald-600",
  },
  {
    key: "orders",
    label: "Total orders",
    icon: FaShoppingCart,
    accent: "from-violet-500/10 to-violet-500/20 text-violet-600",
  },
  {
    key: "revenue",
    label: "Revenue to date",
    icon: PiCurrencyDollarSimpleThin,
    accent: "from-amber-500/10 to-amber-500/20 text-amber-600",
  },
];

const Dashboard = () => {
  const {
    totalUser,
    totalProduct,
    totalOrders,
    totalVendors,
    isLoading,
    error,
    isAdminView,
    scopedVendor,
  } = useContext(AdminContext);

  const totalRevenue = useMemo(() => {
    if (!Array.isArray(totalOrders)) return 0;
    return totalOrders.reduce((sum, order) => {
      const value =
        typeof order.total === "number"
          ? order.total
          : Number.parseFloat(order.total) || 0;
      return sum + value;
    }, 0);
  }, [totalOrders]);

  const recentOrders = useMemo(() => {
    if (!Array.isArray(totalOrders)) return [];
    return [...totalOrders]
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [totalOrders]);

  const topVendors = useMemo(() => {
    const summary = (totalOrders || []).reduce((accumulator, order) => {
      (order.vendorBreakdown || []).forEach((entry) => {
        const key = entry.vendorSlug || "sb-store";
        if (!accumulator[key]) {
          accumulator[key] = {
            name: entry.vendorName || "SB Store",
            revenue: 0,
            items: 0,
          };
        }
        accumulator[key].revenue += Number(entry.subtotal || 0);
        accumulator[key].items += Number(entry.itemCount || 0);
      });
      return accumulator;
    }, {});

    return Object.values(summary)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [totalOrders]);

  const chartData = {
    labels: isAdminView
      ? ["Clients", "Produits", "Commandes"]
      : ["Produits", "Commandes", "CA"],
    datasets: [
      {
        label: "Totaux",
        data: isAdminView
          ? [totalUser?.length || 0, totalProduct?.length || 0, totalOrders?.length || 0]
          : [totalProduct?.length || 0, totalOrders?.length || 0, Math.round(totalRevenue)],
        backgroundColor: [
          "rgba(56, 189, 248, 0.35)",
          "rgba(34, 197, 94, 0.35)",
          "rgba(139, 92, 246, 0.35)",
        ],
        borderRadius: 18,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 5 } },
    },
  };

  if (isLoading && !totalOrders?.length) {
    return <TableSkeleton />;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {(isAdminView
          ? statCards
          : statCards.filter((card) => card.key !== "users")
        ).map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "users"
              ? totalUser?.length ?? 0
              : card.key === "products"
              ? totalProduct?.length ?? 0
              : card.key === "orders"
              ? totalOrders?.length ?? 0
              : totalRevenue.toFixed(2) + " Dt";

          return (
            <div
              key={card.key}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5"
            >
              <div
                className={`inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${card.accent} px-4 py-2 text-sm font-semibold`}
              >
                <Icon />
                {card.label}
              </div>
              <p className="mt-6 text-3xl font-semibold text-slate-900">
                {card.key === "revenue" ? value : value.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Last update · {new Date().toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            {isAdminView ? "Marketplace pulse" : "Performance boutique"}
          </h2>
          <div className="mt-6 h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Vue rapide
          </h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-700">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              {totalOrders?.length ?? 0} commande(s) suivie(s).
            </li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              {totalProduct?.length ?? 0} produit(s) visible(s) pour les clients.
            </li>
            {isAdminView ? (
              <>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">
                  {totalUser?.length ?? 0} compte(s) enregistrés.
                </li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">
                  {totalVendors?.length ?? 0} boutique(s) présentes sur la plateforme.
                </li>
              </>
            ) : (
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Boutique active: {scopedVendor?.name || "Ma boutique"}.
              </li>
            )}
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              {totalRevenue.toFixed(2)} Dt de chiffre d&apos;affaires suivi.
            </li>
          </ul>
        </div>
      </div>

      {isAdminView && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Top boutiques
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Les boutiques qui génèrent le plus de chiffre d&apos;affaires.
              </p>
            </div>
            <Link
              href="/dashboard/vendors"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Gérer les boutiques
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topVendors.length ? (
              topVendors.map((vendor) => (
                <div
                  key={vendor.name}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {vendor.name}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {vendor.revenue.toFixed(2)} Dt
                  </p>
                  <p className="text-xs text-slate-500">
                    {vendor.items} article(s) vendus
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucune boutique n&apos;a encore généré de ventes.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              {isAdminView ? "Commandes récentes" : "Mes commandes récentes"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Un aperçu rapide de l&apos;activité la plus récente.
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Voir toutes les commandes
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    Aucune commande pour le moment.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="bg-white">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.customer?.fullName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {typeof order.total === "number"
                        ? order.total.toFixed(2)
                        : Number.parseFloat(order.total || 0).toFixed(2)}{" "}
                      Dt
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
