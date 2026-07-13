"use client";
import Header from "./Header";
import { useContext, useState, useEffect } from "react";
import { Context } from "@/Context/Context";
import { usePathname, useRouter } from "next/navigation";
import AdminProvider from "@/Context/AdminProvider";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const { user } = useContext(Context);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    setIsLoading(false);

    const canAccessDashboard =
      user?.data?.isAdmin || user?.data?.role === "admin" || user?.data?.role === "vendor";

    if (!canAccessDashboard) {
      router.replace("/");
      return;
    }

    const isVendor = user?.data?.role === "vendor";
    const vendorVendorId = user?.data?.vendorId?._id || user?.data?.vendorId;

    if (isVendor) {
      const vendorHome =
        vendorVendorId && pathname === "/dashboard/vendors"
          ? `/dashboard/vendors/${vendorVendorId}`
          : "/dashboard";
      const isRestrictedVendorPage =
        pathname === "/dashboard/users" ||
        pathname === "/dashboard/categories" ||
        pathname === "/dashboard/vendors" ||
        (pathname.startsWith("/dashboard/vendors/") &&
          vendorVendorId &&
          !pathname.startsWith(`/dashboard/vendors/${vendorVendorId}`));

      if (isRestrictedVendorPage) {
        router.replace(vendorHome);
        return;
      }
    }
  }, [user, router, pathname]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const canAccessDashboard =
    user?.data?.isAdmin || user?.data?.role === "admin" || user?.data?.role === "vendor";

  if (!canAccessDashboard) {
    return null;
  }

  return (
    <AdminProvider>
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
};

export default Layout;
