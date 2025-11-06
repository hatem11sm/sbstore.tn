"use client";
import Header from "./Header";
import { useContext, useState, useEffect } from "react";
import { Context } from "@/Context/Context";
import { useRouter } from "next/navigation";
import AdminProvider from "@/Context/AdminProvider";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const { user } = useContext(Context);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    setIsLoading(false);

    if (!user?.data?.isAdmin) {
      router.replace("/");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user?.data?.isAdmin) {
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
