"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { AdminContext } from "@/Context/AdminProvider";

const statusSteps = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const paymentStatusOptions = ["pending", "awaiting_payment", "paid", "failed", "refunded"];
const paymentStatusLabels = {
  pending: "Paiement à la livraison",
  awaiting_payment: "En attente de paiement",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/30",
  processing:
    "bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/30",
  shipped:
    "bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/30",
  delivered:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/30",
  cancelled:
    "bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/30",
  default: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const OrderDetails = ({ params }) => {
  const { totalOrders, setTotalOrders } = useContext(AdminContext);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const orderTotalValue = useMemo(() => {
    if (!order) return 0;
    return typeof order.total === "number"
      ? order.total
      : Number.parseFloat(order.total) || 0;
  }, [order]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${params.id}`);
        setOrder(data.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (status) => {
    if (!order || isUpdating) return;
    try {
      setIsUpdating(true);
      const response = await axios.put(`/api/order/${order._id}`, { status });
      if (response.data.status === 200) {
        const updatedOrder = { ...order, status };
        setOrder(updatedOrder);
        if (Array.isArray(totalOrders)) {
          setTotalOrders(
            totalOrders.map((item) =>
              item._id === updatedOrder._id ? updatedOrder : item
            )
          );
        }
        toast.success("Order status updated");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    if (!order || isUpdating) return;
    try {
      setIsUpdating(true);
      const response = await axios.put(`/api/order/${order._id}`, {
        paymentStatus,
      });
      if (response.data.status === 200) {
        const updatedOrder = { ...order, paymentStatus };
        setOrder(updatedOrder);
        if (Array.isArray(totalOrders)) {
          setTotalOrders(
            totalOrders.map((item) =>
              item._id === updatedOrder._id ? updatedOrder : item
            )
          );
        }
        toast.success("Payment status updated");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    const index = statusSteps.findIndex((step) => step.key === order.status);
    return index === -1 ? 0 : index;
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          We couldn&apos;t find that order. It may have been removed.
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-600"
          >
            Orders
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {order.orderNumber || `Order #${order._id.slice(-6).toUpperCase()}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })} ·{" "}
            {format(new Date(order.createdAt), "EEEE, MMM d · HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              statusStyles[order.status] ?? statusStyles.default
            }`}
          >
            {order.status}
          </span>
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-600 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {statusSteps.map((step) => (
              <option key={step.key} value={step.key}>
                {step.label}
              </option>
            ))}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

  <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Overview
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-900/95 p-5 text-white shadow-lg shadow-slate-900/40">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Total
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {orderTotalValue.toFixed(2)} Dt
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Items
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {order.items?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500">
                  {order.items
                    ?.map((item) => item.name)
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(", ") || "No products"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Payment
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 capitalize">
                  {paymentStatusLabels[order.paymentStatus] ?? "Non défini"}
                </p>
                <p className="text-xs text-slate-500">
                  {order.paymentMethod === "online"
                    ? "Paiement en ligne"
                    : "Paiement à la livraison"}
                </p>
                <select
                  value={order.paymentStatus || "pending"}
                  disabled={isUpdating}
                  onChange={(event) => handlePaymentStatusChange(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {paymentStatusLabels[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Fulfilment progress
              </h3>
              {order.status === "cancelled" ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  This order has been cancelled. No further fulfilment actions
                  are required.
                </div>
              ) : (
                <ol className="mt-4 flex w-full items-start justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    return (
                      <li
                        key={step.key}
                        className="flex flex-1 flex-col items-center text-center"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                            isCompleted
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                          {step.label}
                        </p>
                        {index < statusSteps.length - 1 && (
                          <span
                            className={`mt-3 h-[2px] w-full max-w-[120px] ${
                              index < currentStepIndex
                                ? "bg-emerald-500"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Items
            </h2>
            <div className="mt-4 space-y-4">
              {order.items?.map((item) => {
                const quantity = Number(item.quantity ?? 0);
                const unitPrice =
                  typeof item.price === "number"
                    ? item.price
                    : Number.parseFloat(item.price) || 0;
                const itemTotal = quantity * unitPrice;

                return (
                  <div
                    key={`${item._id}-${item.size}`}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white shadow-inner">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Size {item.size ?? "N/A"} · {quantity} pcs
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-900">
                      {itemTotal.toFixed(2)} Dt
                      <p className="text-xs font-medium text-slate-500">
                        {unitPrice.toFixed(2)} Dt / unit
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">
                  Sous-total {Number(order.subtotal || 0).toFixed(2)} Dt
                </p>
                <p className="text-sm text-slate-500">
                  Livraison {Number(order.shippingFee || 0).toFixed(2)} Dt
                </p>
                <p className="text-sm text-slate-500">
                  Remise -{Number(order.discount || 0).toFixed(2)} Dt
                </p>
                <span className="text-2xl font-semibold text-slate-900">
                  {orderTotalValue.toFixed(2)} Dt
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Répartition boutiques
            </h2>
            <div className="mt-4 space-y-4">
              {(order.vendorBreakdown?.length
                ? order.vendorBreakdown
                : [
                    {
                      vendorName: "SB Store",
                      itemCount:
                        order.items?.reduce(
                          (total, item) => total + Number(item.quantity || 0),
                          0
                        ) || 0,
                      subtotal: orderTotalValue,
                    },
                  ]
              ).map((vendor) => (
                <div
                  key={`${vendor.vendorSlug || vendor.vendorName}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {vendor.vendorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vendor.itemCount} article(s)
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {Number(vendor.subtotal || 0).toFixed(2)} Dt
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Customer
            </h2>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Full name
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {order.customer?.fullName ?? "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Phone
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {order.customer?.phoneNumber ?? "Not provided"}
                </p>
              </div>
              {order.customer?.email && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {order.customer.email}
                  </p>
                </div>
              )}
              {order.promo?.code && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Promo
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {order.promo.code} · -{Number(order.discount || 0).toFixed(2)} Dt
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Shipping address
                </p>
                <p className="mt-1 leading-relaxed text-slate-900">
                  {order.shippingAddress ?? "No address provided"}
                </p>
              </div>
              {order.customer?.description && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Notes
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-900">
                    {order.customer.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-indigo-50/70 p-6 shadow-lg shadow-indigo-200/40">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
              Quick actions
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-indigo-900">
              <li className="rounded-2xl bg-white/60 px-4 py-3">
                Send a confirmation message once the status changes.
              </li>
              <li className="rounded-2xl bg-white/60 px-4 py-3">
                Double-check the address before dispatching shipments.
              </li>
              <li className="rounded-2xl bg-white/60 px-4 py-3">
                Update payment status when funds are confirmed.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
