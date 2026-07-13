"use client";

import { Context } from "@/Context/Context";
import { ProductContext } from "@/Context/CreateProduct";
import { buildVendorAiSuggestions } from "@/utils/vendorAiSuggestions";
import Image from "next/image";
import { useContext, useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  buildCategoryKey,
  parseCategoryKey,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";

const Form = () => {
  const {
    fetchProduct,
    name,
    setName,
    price,
    setPrice,
    description,
    setDescription,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    setFile,
    media,
    uploading,
    categories,
    vendors,
    vendorId,
    setVendorId,
  } = useContext(ProductContext);
  const { user } = useContext(Context);
  const isVendorUser = user?.data?.role === "vendor";
  const scopedVendorId = user?.data?.vendorId?._id || user?.data?.vendorId || "";
  const availableVendors = isVendorUser
    ? vendors.filter((vendor) => vendor._id === scopedVendorId)
    : vendors;

  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const selectedVendorMeta = useMemo(
    () =>
      availableVendors.find(
        (vendor) => String(vendor._id) === String(vendorId || scopedVendorId)
      ),
    [availableVendors, scopedVendorId, vendorId]
  );
  const selectedCategoryMeta = useMemo(() => {
    const { slug: selectedSlug, collectionGroup } = parseCategoryKey(category);
    return categories.find(
      (item) =>
        item.slug === selectedSlug &&
        normalizeCollectionGroup(item.collectionGroup) === collectionGroup
    );
  }, [categories, category]);

  useEffect(() => {
    if (isVendorUser && scopedVendorId && vendorId !== scopedVendorId) {
      setVendorId(scopedVendorId);
    }
  }, [isVendorUser, scopedVendorId, setVendorId, vendorId]);

  useEffect(() => {
    const { slug: selectedSlug, collectionGroup } = parseCategoryKey(category);
    const selectedCategory = categories.find(
      (item) =>
        item.slug === selectedSlug &&
        normalizeCollectionGroup(item.collectionGroup) === collectionGroup
    );
    const subcategories = selectedCategory?.subcategories || [];
    setAvailableSubcategories(subcategories);
    if (subcategory && !subcategories.includes(subcategory)) {
      setSubcategory("");
    }
  }, [category, categories, setSubcategory, subcategory]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    switch (e.target.name) {
      case "name":
        setName(e.target.value);
        break;
      case "price":
        setPrice(e.target.value);
        break;
      case "description":
        setDescription(e.target.value);
        break;
      case "category":
        setCategory(e.target.value);
        break;
      case "subcategory":
        setSubcategory(e.target.value);
        break;
      case "vendorId":
        setVendorId(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!name || !price || !description || !category || !media) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (availableSubcategories.length > 0 && !subcategory) {
      toast.error("Please select a valid subcategory for the chosen category");
      return;
    }

    fetchProduct(e);
  };

  const generateAiSuggestions = () => {
    const suggestions = buildVendorAiSuggestions({
      name,
      description,
      categoryLabel: selectedCategoryMeta?.name || "",
      collectionGroup: selectedCategoryMeta?.collectionGroup || "woman",
      subcategory,
      vendorLabel: selectedVendorMeta?.name || "SB Store",
      city: selectedVendorMeta?.city || "",
      price,
    });

    setAiSuggestions(suggestions);
  };

  return (
    <div className="w-full h-full flex items-center justify-center flex-col bg-gray-100 relative">
      <h1 className="w-full text-center my-5">
        <span className="text-2xl md:text-4xl font-bold text-gray-900">
          Create a new product
        </span>
      </h1>
      <div className="w-full lg:w-11/12 mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              AI vendeur avancé
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Améliore la fiche produit avant publication
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Génère une meilleure description, un titre plus vendeur, des tags utiles et un score qualité pour convaincre plus vite.
            </p>
          </div>
          <button
            type="button"
            onClick={generateAiSuggestions}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Générer avec l&apos;AI
          </button>
        </div>

        {aiSuggestions ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr,1fr]">
            <div className="grid gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Titre suggéré
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {aiSuggestions.titleSuggestion}
                </p>
                <button
                  type="button"
                  onClick={() => setName(aiSuggestions.titleSuggestion)}
                  className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900"
                >
                  Utiliser ce titre
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Description suggérée
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {aiSuggestions.descriptionSuggestion}
                </p>
                <button
                  type="button"
                  onClick={() => setDescription(aiSuggestions.descriptionSuggestion)}
                  className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900"
                >
                  Utiliser la description
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Score qualité fiche
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {aiSuggestions.qualityScore}/100
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Tags suggérés
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {aiSuggestions.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Prix conseillé premium
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {aiSuggestions.recommendedPrice
                    ? `${aiSuggestions.recommendedPrice} Dt`
                    : "Ajoute un prix actuel pour recevoir une suggestion"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Recommandations
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {aiSuggestions.recommendations.map((recommendation) => (
                    <li key={recommendation}>- {recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-11/12 mx-auto md:grid grid-cols-2 grid-rows-1 gap-3 mt-5 p-4"
      >
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="name"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Product Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            required
            placeholder="Enter product name"
            value={name}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="price"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Price:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            required
            placeholder="Enter product price in Dt"
            value={price}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="description"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Description:
          </label>
          <textarea
            type="text"
            id="description"
            name="description"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            required
            placeholder="Enter product description"
            rows="4"
            cols="50"
            value={description}
            onChange={handleChange}
            style={{ resize: "none" }}
          ></textarea>
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="category"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Category:
          </label>
          <select
            name="category"
            id="category"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            placeholder="Select category"
            required
            value={category}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((item) => (
              <option key={item._id} value={buildCategoryKey(item)}>
                {item.name} · {item.collectionGroup?.toUpperCase() || "WOMAN"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="subcategory"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Subcategory:
          </label>
          <select
            name="subcategory"
            id="subcategory"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            placeholder="Select subcategory"
            required={availableSubcategories.length > 0}
            value={subcategory}
            onChange={handleChange}
            disabled={!availableSubcategories.length}
          >
            <option value="" disabled>
              Select subcategory
            </option>
            {availableSubcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="vendorId"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            {isVendorUser ? "Votre boutique:" : "Boutique / fournisseur:"}
          </label>
          <select
            name="vendorId"
            id="vendorId"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            value={vendorId}
            onChange={handleChange}
            disabled={isVendorUser}
          >
            {!isVendorUser && <option value="">SB Store (par defaut)</option>}
            {availableVendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
                {vendor.city ? ` · ${vendor.city}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="image"
            className="w-full flex items-start justify-start text-gray-700 text-sm md:text-base font-medium"
          >
            Image:
          </label>
          {!media ? (
            uploading ? (
              <div className="w-full">
                <span className="w-full h-32 flex items-center justify-center text-gray-600 font-semibold">
                  please wait while image is uploading....
                </span>
              </div>
            ) : (
              <div
                className="w-full"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                  <span className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="font-medium text-gray-600">
                      Drop image to Attach, or
                      <span className="text-green-600 mx-1 underline">
                        browse
                      </span>
                    </span>
                  </span>
                  <input
                    type="file"
                    name="image"
                    className="hidden"
                    required
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>
            )
          ) : (
            <Image src={media} width="500" height="500" alt="product image" />
          )}
        </div>

        <div className="flex flex-col items-center justify-center mt-3">
          {uploading ||
          !name ||
          !category ||
          (availableSubcategories.length > 0 && !subcategory) ||
          !media ||
          !description ||
          !price ? (
            <button
              type="submit"
              disabled
              className="opacity-50 relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-medium tracking-tighter text-white bg-gray-800 rounded-lg group"
            >
              <span className="relative">Create Product</span>
            </button>
          ) : (
            <button
              type="submit"
              className="relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-medium tracking-tighter text-white bg-gray-800 rounded-lg group"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative">Create Product</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
