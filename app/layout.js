import { Montserrat } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Header from "@/components/Header";
import ContextProvider from "@/Context/Context";
import Footer from "@/components/Footer";
import { ProductContextProvider } from "@/Context/CreateProduct";
import { Toaster } from "react-hot-toast";
import CartProvider from "@/Context/CartProvider";
import CompareProvider from "@/Context/CompareProvider";

const inter = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "SB Store Tunisie - Marketplace multi-boutiques",
  description:
    "Plateforme multi-boutiques en Tunisie pour decouvrir plusieurs vendeurs, comparer les produits et commander en TND.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <NextTopLoader color="#000" height={4} />
        <ContextProvider>
          <ProductContextProvider>
            <CompareProvider>
              <CartProvider>
                <Header />
                <Toaster />
                {children}
                <Footer />
              </CartProvider>
            </CompareProvider>
          </ProductContextProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
