"use client";
import Header from "./Header";
import { useContext, useState, useEffect } from "react";
import { Context } from "@/Context/Context";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const { user } = useContext(Context);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
      if (!user?.data?.isAdmin) {
        router.push("/");
        return;
      }
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
    <div className="w-full min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
