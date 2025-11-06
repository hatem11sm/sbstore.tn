"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { AdminContext } from "@/Context/AdminProvider";
import TableSkeleton from "../TableSkeleton";

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

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const { totalOrders, setTotalOrders, isLoading: adminLoading, error } =
    useContext(AdminContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(totalOrders)) return [];

    return totalOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();

      if (!term) return matchesStatus;

      const haystack = [
        order._id,
        order.customer?.fullName,
        order.customer?.phoneNumber,
        order.items?.map((item) => item.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && haystack.includes(term);
    });
  }, [totalOrders, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusSummary = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [filteredOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updatingOrder) return;
    try {
      setUpdatingOrder(orderId);
      const response = await axios.put(`/api/order/${orderId}`, {
        status: newStatus,
      });

      if (response.data.status === 200) {
        const updatedOrders = totalOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setTotalOrders(updatedOrders);
        toast.success("Order status updated");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrder("");
    }
  };

  if (adminLoading && !totalOrders?.length) {
    return <TableSkeleton />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Order Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage every order. Use filters to stay laser focused.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {statusOptions.map((status) => (
              <span
                key={status}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[status] ?? statusStyles.default
                } ${statusFilter === status ? "ring-2 ring-offset-1" : ""}`}
              >
                {statusSummary[status] ?? 0} {status}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by order ID, customer or product"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{currentItems.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{filteredOrders.length}</span> matching orders
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="hidden bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 lg:grid lg:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]">
          <span>Order</span>
          <span>Customer</span>
          <span>Total</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-slate-100">
          {currentItems.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-slate-400">
              <p className="text-sm font-medium">No orders found</p>
              <p className="text-xs text-slate-400">
                Adjust your filters or check back later.
              </p>
            </div>
          ) : (
            currentItems.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-4 px-4 py-5 transition hover:bg-slate-50/70 lg:grid lg:grid-cols-[1.5fr,1fr,1fr,1fr,1fr] lg:items-center lg:gap-6 lg:px-6"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Placed on {format(new Date(order.createdAt), "MMM d, yyyy")} (
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
                    )
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {order.customer?.fullName ?? "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.customer?.phoneNumber ?? "No phone"} ·{" "}
                    {order.customer?.email ?? "No email"}
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {order.total?.toFixed ? order.total.toFixed(2) : order.total} Dt
                  <p className="text-xs font-medium text-emerald-600">
                    {order.items?.length ?? 0} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[order.status] ?? statusStyles.default
                    }`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleStatusUpdate(order._id, event.target.value)
                    }
                    disabled={updatingOrder === order._id}
                    className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium capitalize text-slate-600 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 lg:block"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
                  <Link
                    href={`/dashboard/orders/${order._id}`}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    View details
                  </Link>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleStatusUpdate(order._id, event.target.value)
                    }
                    disabled={updatingOrder === order._id}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium capitalize text-slate-600 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 lg:hidden"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex w-full items-center justify-end gap-2">
          <span className="text-xs font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-slate-900 text-white shadow"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
    </section>
  );
};

export default Orders;
