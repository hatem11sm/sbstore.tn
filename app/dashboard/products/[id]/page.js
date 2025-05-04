"use client";
import { ProductContext } from "@/Context/CreateProduct";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SInglePRoductSkeleton from "../../SInglePRoductSkeleton";

const Product = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  const subcategoryMap = {
    Men: ["T-Shirts", "Shirts", "Pants", "Jackets", "Shoes"],
    Women: ["Dresses", "Tops", "Skirts", "Jeans", "Heels"],
    Kids: ["Boys", "Girls", "Infants"],
    Accessories: ["Sunglasses", "Watches", "Wallets", "Belts", "Bags"]
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${id}`);
        setProduct(res.data.data);
        setSelectedSubcategory(res.data.data.subcategory);
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
    if (product?.category) {
      setAvailableSubcategories(subcategoryMap[product.category] || []);
    }
  }, [product?.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "category") {
      setAvailableSubcategories(subcategoryMap[value] || []);
      setSelectedSubcategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/product/${id}`, {
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        subcategory: selectedSubcategory,
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
            name="category"
            id="category"
            className="w-full border border-gray-300 p-2 rounded-md mt-2"
            placeholder="Select category"
            required
            value={product?.category}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Select category
            </option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Accessories">Accessories</option>
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
            required
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!product?.category}
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
