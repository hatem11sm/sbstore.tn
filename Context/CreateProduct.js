"use client";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const ProductContext = createContext();

export const ProductContextProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [uploading, setUploading] = useState(false);
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

      const res = await axios.post("/api/product", {
        name: name,
        price: price,
        description: description,
        category: category,
        mainImage: media,
      });

      router.push("/products");
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setFile(null);
      setMedia("");
      toast.success("Product created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create product");
      console.log(error);
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
        file,
        setFile,
        media,
        products,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
