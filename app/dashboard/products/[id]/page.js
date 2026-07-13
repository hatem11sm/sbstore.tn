"use client";
import { Context } from "@/Context/Context";
import { ProductContext } from "@/Context/CreateProduct";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SInglePRoductSkeleton from "../../SInglePRoductSkeleton";
import {
  buildCategoryKey,
  parseCategoryKey,
  normalizeCollectionGroup,
} from "@/utils/categoryPaths";

const Product = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { categories, vendors } = useContext(ProductContext);
  const { user } = useContext(Context);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const isVendorUser = user?.data?.role === "vendor";
  const scopedVendorId = user?.data?.vendorId?._id || user?.data?.vendorId || "";
  const availableVendors = isVendorUser
    ? vendors.filter((vendor) => vendor._id === scopedVendorId)
    : vendors;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${id}`);
        const productData = res.data.data;
        setProduct({
          ...productData,
          categorySlug: productData.categorySlug,
          categoryCollectionGroup:
            productData.categoryCollectionGroup || "woman",
          vendorId:
            productData.vendorId?._id ||
            productData.vendorId ||
            "",
        });
        setSelectedSubcategory(productData.subcategory || "");
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to fetch product");
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (
      isVendorUser &&
      scopedVendorId &&
      product?.vendorId &&
      String(product.vendorId) !== String(scopedVendorId)
    ) {
      router.replace("/dashboard/products");
    }
  }, [isVendorUser, scopedVendorId, product?.vendorId, router]);

  useEffect(() => {
    if (!product?.categorySlug) {
      setAvailableSubcategories([]);
      return;
    }
    const matchedCategory = categories.find(
      (item) =>
        item.slug === product.categorySlug &&
        normalizeCollectionGroup(item.collectionGroup) ===
          normalizeCollectionGroup(product.categoryCollectionGroup)
    );
    const subs = matchedCategory?.subcategories || [];
    setAvailableSubcategories(subs);
    if (selectedSubcategory && !subs.includes(selectedSubcategory)) {
      setSelectedSubcategory("");
    }
  }, [
    product?.categorySlug,
    product?.categoryCollectionGroup,
    categories,
    selectedSubcategory,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoryComposite") {
      const { slug: nextSlug, collectionGroup } = parseCategoryKey(value);
      const matchedCategory = categories.find(
        (item) =>
          item.slug === nextSlug &&
          normalizeCollectionGroup(item.collectionGroup) === collectionGroup
      );
      setProduct((prev) => ({
        ...prev,
        categorySlug: nextSlug,
        categoryCollectionGroup: collectionGroup,
        category: matchedCategory?.name || prev?.category || "",
      }));
      setSelectedSubcategory("");
      return;
    }
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/product/${id}`, {
        name: product.name,
        price: product.price,
        description: product.description,
        categorySlug: product.categorySlug,
        categoryCollectionGroup: product.categoryCollectionGroup,
        subcategory: selectedSubcategory,
        vendorId: product.vendorId || "",
        mainImage: product.mainImage,
      });
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    }
  };

  const DeleteProduct = async () => {
    try {
      const res = await axios.delete(`/api/product/${id}`);
      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product?.mainImage) return <SInglePRoductSkeleton />;
  return (
    <div className="w-full h-full flex items-center justify-center flex-col bg-gray-100 relative">
      <h1 className="w-full text-center my-5">
        <span className="text-2xl md:text-4xl font-bold text-gray-900">
          Edit Product OR Delete Product
        </span>
      </h1>
      <div className="flex flex-col items-center justify-center  mt-3">
        <label
          htmlFor="description"
          className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
        >
          Image:
        </label>

        <Image
          src={product?.mainImage}
          width="500"
          height="500"
          alt="product image"
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-11/12 mx-auto md:grid grid-cols-2 grid-rows-1 gap-3 mt-5  p-4"
      >
        <div className="flex flex-col items-center justify-center mt-3">
          <label
            htmlFor="name"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
          >
            Product Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full  border border-gray-300 p-2 rounded-md mt-2"
            required
            placeholder="Enter product name"
            value={product?.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center  mt-3">
          <label
            htmlFor="price"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
          >
            Price:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            className="w-full border  border-gray-300 p-2 rounded-md mt-2"
            required
            placeholder="Enter product price in Dt"
            value={product?.price}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center  mt-3">
          <label
            htmlFor="description"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
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
            value={product?.description}
            onChange={handleInputChange}
            style={{ resize: "none" }}
          ></textarea>
        </div>
        <div className="flex flex-col items-center justify-center  mt-3">
          <label
            htmlFor="category"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
          >
            Category:
          </label>
          <select
            name="categoryComposite"
            id="categoryComposite"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            placeholder="Select category"
            required
            value={
              product
                ? buildCategoryKey({
                    slug: product.categorySlug,
                    collectionGroup: product.categoryCollectionGroup,
                  })
                : ""
            }
            onChange={handleInputChange}
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
        <div className="flex flex-col items-center justify-center  mt-3">
          <label
            htmlFor="subcategory"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
          >
            Subcategory:
          </label>
          <select
            name="subcategory"
            id="subcategory"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            placeholder="Select subcategory"
            required={availableSubcategories.length > 0}
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
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
        <div className="flex flex-col items-center justify-center  mt-3">
          <label
            htmlFor="vendorId"
            className=" w-full flex items-start justify-start  text-gray-700 text-sm md:text-base font-medium"
          >
            {isVendorUser ? "Votre boutique:" : "Boutique / fournisseur:"}
          </label>
          <select
            name="vendorId"
            id="vendorId"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            value={product?.vendorId || ""}
            onChange={handleInputChange}
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
        <div className=" flex flex-col items-center justify-center  mt-3">
          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded-md"
          >
            Update Product
          </button>
        </div>
        <div className=" flex flex-col items-center justify-center  mt-3">
          <button
            type="button"
            onClick={DeleteProduct}
            className="w-full bg-red-900 text-white p-2 rounded-md mt-2"
          >
            {" "}
            Delete Product{" "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Product;
