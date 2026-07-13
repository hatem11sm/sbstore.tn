"use client";

import { ProductContext } from "@/Context/CreateProduct";
import { vendorTemplates } from "@/utils/vendorStorefront";
import axios from "axios";
import Link from "next/link";
import { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";

const VendorsPage = () => {
  const { vendors, refreshVendors } = useContext(ProductContext);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    shortDescription: "",
    contactName: "",
    phone: "",
    whatsapp: "",
    city: "",
    description: "",
    logo: "",
    banner: "",
    template: "minimal",
    accentColor: "#16181b",
    shippingPolicy: "",
    returnPolicy: "",
    createVendorAccount: true,
    accountName: "",
    accountEmail: "",
    accountPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onboardingSteps = useMemo(
    () => [
      "Créer la boutique et son identité.",
      "Générer l’accès vendeur en une seule action.",
      "Partager les identifiants pour que le vendeur ajoute ses produits et gère ses commandes.",
    ],
    []
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const vendorPayload = {
        name: formData.name,
        tagline: formData.tagline,
        shortDescription: formData.shortDescription,
        contactName: formData.contactName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        city: formData.city,
        description: formData.description,
        logo: formData.logo,
        banner: formData.banner,
        template: formData.template,
        accentColor: formData.accentColor,
        shippingPolicy: formData.shippingPolicy,
        returnPolicy: formData.returnPolicy,
      };

      const res = await axios.post("/api/vendors", vendorPayload);
      const createdVendor = res.data?.data;

      if (
        formData.createVendorAccount &&
        formData.accountName &&
        formData.accountEmail &&
        formData.accountPassword
      ) {
        await axios.post("/api/vendor-accounts", {
          vendorId: createdVendor._id,
          name: formData.accountName,
          email: formData.accountEmail,
          password: formData.accountPassword,
        });
      }

      toast.success(
        formData.createVendorAccount
          ? "Boutique et accès vendeur créés"
          : res.data?.message || "Boutique créée"
      );
      setFormData({
        name: "",
        tagline: "",
        shortDescription: "",
        contactName: "",
        phone: "",
        whatsapp: "",
        city: "",
        description: "",
        logo: "",
        banner: "",
        template: "minimal",
        accentColor: "#16181b",
        shippingPolicy: "",
        returnPolicy: "",
        createVendorAccount: true,
        accountName: "",
        accountEmail: "",
        accountPassword: "",
      });
      refreshVendors();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Impossible de créer cette boutique"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const seed = Math.random().toString(36).slice(2, 8);
    setFormData((prev) => ({
      ...prev,
      accountPassword: `Sb-${seed}-2026`,
    }));
  };

  return (
    <main className="w-full space-y-6 p-4">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Marketplace
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Boutiques et fournisseurs
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Ajoutez les boutiques qui vendent sur la plateforme. Chaque produit
          pourra ensuite être rattaché à son fournisseur.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Nouvelle boutique
          </h2>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Nom de la boutique
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Ex: SB Store"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Slogan
                <input
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Ex: Une boutique, un style, une ambiance"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Résumé vitrine
                <input
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Visible sur les cartes et pages boutique"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Responsable
              <input
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Nom du contact"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Téléphone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="25 413 401"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Ville
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Tunis"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                WhatsApp
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="+216 25 413 401"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Template boutique
                <select
                  name="template"
                  value={formData.template}
                  onChange={handleChange}
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
                Couleur principale
                <input
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="#16181b"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Logo (URL)
                <input
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Bannière (URL)
              <input
                name="banner"
                value={formData.banner}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="https://..."
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Spécialité, conditions, délais..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Livraison
                <textarea
                  name="shippingPolicy"
                  rows={3}
                  value={formData.shippingPolicy}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Délais, zones et conditions"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Retour / échange
                <textarea
                  name="returnPolicy"
                  rows={3}
                  value={formData.returnPolicy}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Politique d'échange ou retour"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="createVendorAccount"
                  checked={formData.createVendorAccount}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Créer aussi l’accès vendeur
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Le vendeur pourra se connecter, gérer ses produits et suivre
                    ses commandes.
                  </p>
                </div>
              </label>

              {formData.createVendorAccount ? (
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Nom du compte vendeur
                    <input
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      placeholder="Ex: Responsable Maison Atlas"
                      required={formData.createVendorAccount}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Email vendeur
                    <input
                      type="email"
                      name="accountEmail"
                      value={formData.accountEmail}
                      onChange={handleChange}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      placeholder="vendeur@boutique.tn"
                      required={formData.createVendorAccount}
                    />
                  </label>

                  <div className="grid gap-2 text-sm font-medium text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <span>Mot de passe temporaire</span>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-900"
                      >
                        Générer
                      </button>
                    </div>
                    <input
                      name="accountPassword"
                      value={formData.accountPassword}
                      onChange={handleChange}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                      placeholder="Mot de passe de premier accès"
                      required={formData.createVendorAccount}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Création..."
              : formData.createVendorAccount
                ? "Créer la boutique et l’accès vendeur"
                : "Créer la boutique"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Onboarding vendeur
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                3 étapes
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Boutiques actives
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {vendors.length} boutique(s)
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {vendors.length ? (
                vendors.map((vendor) => (
                  <article
                    key={vendor._id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {vendor.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {vendor.city || "Ville non renseignée"}
                          {vendor.template ? ` • ${vendor.template}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {vendor.status === "active" ? "Active" : "En pause"}
                      </span>
                    </div>
                    {vendor.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {vendor.description}
                      </p>
                    ) : null}
                    {vendor.tagline ? (
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        {vendor.tagline}
                      </p>
                    ) : null}
                    <Link
                      href={`/dashboard/vendors/${vendor._id}`}
                      className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-slate-900"
                    >
                      Ouvrir la vue boutique
                    </Link>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Aucune boutique pour le moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VendorsPage;
