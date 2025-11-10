"use client";
import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { parseCategoryKey } from "@/utils/categoryPaths";

export const ProductContext = createContext();

export const ProductContextProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  const [products, setProducts] = useState([]);

  // Upload image using ImgBB API
  useEffect(() => {
    const uploadToImgBB = async () => {
      if (!file) return;

      setUploading(true);
      try {
        // Create FormData to send the image
        const formData = new FormData();
        formData.append("image", file);

        // Replace with your ImgBB API key
        const IMGBB_API_KEY = "797ca4734aaef465619db415978f2887";

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData
        );

        if (response.data && response.data.data && response.data.data.url) {
          setMedia(response.data.data.url);
          console.log("Upload complete:", response.data.data.url);
        } else {
          toast.error("Image upload failed");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Image upload failed");
      } finally {
        setUploading(false);
      }
    };

    file && uploadToImgBB();
  }, [file]);

  // Create Product
  const fetchProduct = async (e) => {
    e.preventDefault();
    try {
      if (!media) {
        toast.error("Please upload an image");
        return;
      }

      if (uploading) {
        toast.error("Please wait while image is uploading");
        return;
      }

      // Log the values being sent
      console.log("Sending values to API:", {
        name,
        price,
        description,
        category,
        subcategory,
        mainImage: media
      });

      const { slug: selectedSlug, collectionGroup: selectedGroup } =
        parseCategoryKey(category);

      if (!selectedSlug) {
        toast.error("Please pick a category");
        return;
      }

      await axios.post("/api/product", {
        name: name,
        price: price,
        description: description,
        categorySlug: selectedSlug,
        categoryCollectionGroup: selectedGroup,
        subcategory: subcategory?.trim() || "",
        mainImage: media,
      });

      router.push("/products");
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setSubcategory("");
      setFile(null);
      setMedia("");
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create product");
    }
  };

  // Get all products
  useEffect(() => {
    axios
      .get("/api/product")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      });
  }, []);

  // Get categories for product creation and navigation
  const refreshCategories = useCallback(() => {
    axios
      .get("/api/category")
      .then((res) => {
        setCategories(res.data?.data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return (
    <ProductContext.Provider
      value={{
        uploading,
        setMedia,
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
        file,
        setFile,
        media,
        products,
        categories,
        refreshCategories,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
