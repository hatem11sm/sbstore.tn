"use client";

import { AdminContext } from "@/Context/AdminProvider";
import { ProductContext } from "@/Context/CreateProduct";
import { calculateVendorTrustScore, getVendorTrustLabel } from "@/utils/marketplaceScore";
import { normalizeVendorForStorefront, vendorTemplates } from "@/utils/vendorStorefront";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const VendorDetailPage = () => {
  const params = useParams();
  const {
    totalProduct,
    totalOrders,
    totalUser,
    setTotalUser,
    isAdminView,
  } = useContext(AdminContext);
  const { vendors, refreshVendors } = useContext(ProductContext);
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [storefrontForm, setStorefrontForm] = useState(null);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [isSavingStorefront, setIsSavingStorefront] = useState(false);

  const vendor = useMemo(
    () => vendors.find((item) => item._id === params?.id),
    [params?.id, vendors]
  );

  const displayVendor = useMemo(
    () => normalizeVendorForStorefront(vendor || {}),
    [vendor]
  );

  const vendorProducts = useMemo(() => {
    return (totalProduct || []).filter(
      (product) =>
        product.vendorId?._id === params?.id ||
        product.vendorId === params?.id
    );
  }, [params?.id, totalProduct]);

  const vendorOrders = useMemo(() => {
    return (totalOrders || []).filter((order) =>
      (order.vendorBreakdown || []).some(
        (vendorEntry) =>
          vendorEntry.vendorId === params?.id ||
          vendorEntry.vendorId?._id === params?.id
      )
    );
  }, [params?.id, totalOrders]);

  const vendorReviewInsights = useMemo(() => {
    return {
      trustScore: calculateVendorTrustScore({
        productCount: vendorProducts.length,
        orderCount: vendorOrders.length,
        avgRating: 0,
        reviewCount: 0,
      }),
      trustLabel: getVendorTrustLabel(
        calculateVendorTrustScore({
          productCount: vendorProducts.length,
          orderCount: vendorOrders.length,
          avgRating: 0,
          reviewCount: 0,
        })
      ),
    };
  }, [vendorOrders.length, vendorProducts]);

  const aiVendorSuggestions = useMemo(() => {
    const suggestions = [];

    if (vendorProducts.length < 3) {
      suggestions.push("Ajoute plus de produits pour enrichir la vitrine de la boutique.");
    }
    if (vendorOrders.length < 2) {
      suggestions.push("Mets en avant les produits les plus forts sur la page boutique pour générer plus de commandes.");
    }
    if (!vendor.description) {
      suggestions.push("Ajoute une description boutique claire pour renforcer la confiance côté client.");
    }

    if (!suggestions.length) {
      suggestions.push("La boutique a déjà une bonne base. La prochaine étape est d'améliorer les titres et descriptions produit avec l'AI vendeur.");
    }

    return suggestions;
  }, [vendor.description, vendorOrders.length, vendorProducts.length]);

  const linkedAccounts = useMemo(() => {
    return (totalUser || []).filter(
      (user) =>
        user.role === "vendor" &&
        (user.vendorId?._id === params?.id || user.vendorId === params?.id)
    );
  }, [params?.id, totalUser]);

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setIsSubmittingAccount(true);

    try {
      const response = await axios.post("/api/vendor-accounts", {
        vendorId: params?.id,
        ...accountForm,
      });

      toast.success(response.data?.message || "Compte vendeur créé");
      setTotalUser((current) => [...(current || []), response.data.data]);
      setAccountForm({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Impossible de créer le compte vendeur"
      );
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  useEffect(() => {
    if (!vendor) return;

    setStorefrontForm({
      name: vendor.name || "",
      tagline: vendor.tagline || "",
      shortDescription: vendor.shortDescription || "",
      contactName: vendor.contactName || "",
      phone: vendor.phone || "",
      whatsapp: vendor.whatsapp || "",
      city: vendor.city || "",
      description: vendor.description || "",
      logo: vendor.logo || "",
      banner: vendor.banner || "",
      template: vendor.template || "minimal",
      accentColor: vendor.accentColor || "#16181b",
      instagram: vendor.instagram || "",
      facebook: vendor.facebook || "",
      shippingPolicy: vendor.shippingPolicy || "",
      returnPolicy: vendor.returnPolicy || "",
      status: vendor.status || "active",
    });
  }, [vendor]);

  const handleStorefrontChange = (event) => {
    const { name, value } = event.target;
    setStorefrontForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStorefront = async (event) => {
    event.preventDefault();

    if (!storefrontForm) return;

    setIsSavingStorefront(true);
    try {
      const response = await axios.put(`/api/vendors/${params?.id}`, storefrontForm);
      toast.success(response.data?.message || "Boutique mise à jour");
      await refreshVendors();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Impossible d’enregistrer cette boutique"
      );
    } finally {
      setIsSavingStorefront(false);
    }
  };

  if (!vendor || !storefrontForm) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Boutique introuvable.
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <Link
          href="/dashboard/vendors"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
        >
          Boutiques
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {displayVendor.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {displayVendor.city || "Tunisie"}
          {displayVendor.phone ? ` • ${displayVendor.phone}` : ""}
          {displayVendor.contactName ? ` • ${displayVendor.contactName}` : ""}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          {displayVendor.description || "Aucune description disponible."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {displayVendor.templateLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {displayVendor.storefrontLabel}
          </span>
          <Link
            href={`/boutiques/${displayVendor.slug}`}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            Voir la vitrine publique
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Produits
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {vendorProducts.length}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Commandes
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {vendorOrders.length}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Statut
          </p>
          <p className="mt-3 text-lg font-bold text-emerald-700">
            {vendor.status === "active" ? "Active" : "En pause"}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Score boutique
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-slate-900">
                {vendorReviewInsights.trustScore}/100
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {vendorReviewInsights.trustLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Signal qualité
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {vendorProducts.length} produit(s)
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {vendorOrders.length} commande(s)
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Ce score sert à expliquer, côté PFE et côté produit, comment la plateforme peut aider les clients à comparer les vendeurs plus vite.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            AI vendeur
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">
            Suggestions intelligentes pour améliorer la boutique
          </h2>
          <div className="mt-4 grid gap-3">
            {aiVendorSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <form
          onSubmit={handleSaveStorefront}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Storefront builder
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Configurer la mini-boutique
              </h2>
            </div>
            <button
              type="submit"
              disabled={isSavingStorefront}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingStorefront ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Nom
                <input
                  name="name"
                  value={storefrontForm.name}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Template
                <select
                  name="template"
                  value={storefrontForm.template}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                >
                  {vendorTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Slogan
                <input
                  name="tagline"
                  value={storefrontForm.tagline}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Résumé vitrine
                <input
                  name="shortDescription"
                  value={storefrontForm.shortDescription}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description complète
              <textarea
                name="description"
                rows={4}
                value={storefrontForm.description}
                onChange={handleStorefrontChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Logo (URL)
                <input
                  name="logo"
                  value={storefrontForm.logo}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Bannière (URL)
                <input
                  name="banner"
                  value={storefrontForm.banner}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Couleur principale
                <input
                  name="accentColor"
                  value={storefrontForm.accentColor}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Ville
                <input
                  name="city"
                  value={storefrontForm.city}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Téléphone
                <input
                  name="phone"
                  value={storefrontForm.phone}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                WhatsApp
                <input
                  name="whatsapp"
                  value={storefrontForm.whatsapp}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Instagram
                <input
                  name="instagram"
                  value={storefrontForm.instagram}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Facebook
                <input
                  name="facebook"
                  value={storefrontForm.facebook}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Livraison
                <textarea
                  name="shippingPolicy"
                  rows={3}
                  value={storefrontForm.shippingPolicy}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Retour / échange
                <textarea
                  name="returnPolicy"
                  rows={3}
                  value={storefrontForm.returnPolicy}
                  onChange={handleStorefrontChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>
          </div>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Vision produit
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Une boutique = un mini-site dans la marketplace
          </h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Le template choisi décide de la mise en scène publique: vitrine sobre, catalogue dense, storytelling de marque ou version promo.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              La bannière, le slogan, la couleur et les politiques logistiques transforment la boutique en mini-site cohérent sans sortir de la plateforme.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              La même base de données alimente ensuite la page publique, la recherche AI, le comparateur et les produits du vendeur.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Produits de la boutique
          </h2>
          <div className="mt-4 space-y-3">
            {vendorProducts.length ? (
              vendorProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/dashboard/products/${product._id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-slate-900"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.category}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {product.hidePrice
                      ? "Prix sur demande"
                      : `${Number(product.price || 0).toFixed(2)} Dt`}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucun produit rattaché.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Commandes liées
          </h2>
          <div className="mt-4 space-y-3">
            {vendorOrders.length ? (
              vendorOrders.map((order) => {
                const vendorEntry = (order.vendorBreakdown || []).find(
                  (entry) =>
                    entry.vendorId === params?.id ||
                    entry.vendorId?._id === params?.id
                );

                return (
                  <Link
                    key={order._id}
                    href={`/dashboard/orders/${order._id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        Commande #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customer?.fullName || "Client"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {Number(vendorEntry?.subtotal || 0).toFixed(2)} Dt
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">
                Aucune commande liée pour le moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {isAdminView && (
        <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Comptes vendeurs liés
            </h2>
            <div className="mt-4 space-y-3">
              {linkedAccounts.length ? (
                linkedAccounts.map((account) => (
                  <div
                    key={account._id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {account.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {account.email}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucun compte vendeur lié pour le moment.
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={handleCreateAccount}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Créer un accès vendeur
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Nom
                <input
                  required
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Mot de passe
                <input
                  required
                  minLength={6}
                  type="password"
                  name="password"
                  value={accountForm.password}
                  onChange={handleAccountChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmittingAccount}
              className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAccount ? "Création..." : "Créer le compte vendeur"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
};

export default VendorDetailPage;
