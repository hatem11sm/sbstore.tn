"use client";
import { ProductContext } from "@/Context/CreateProduct";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { normalizeCollectionGroup } from "@/utils/categoryPaths";

const initialFormState = {
  name: "",
  description: "",
  image: "",
  subcategories: "",
  collectionGroup: "woman",
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCategoryRef, setEditingCategoryRef] = useState(null);
  const { refreshCategories } = useContext(ProductContext);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/category");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizedSubcategories = useMemo(() => {
    if (!formState.subcategories.trim()) {
      return [];
    }
    return formState.subcategories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [formState.subcategories]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      image: formState.image.trim(),
      subcategories: normalizedSubcategories,
      collectionGroup: formState.collectionGroup,
    };

    try {
      setIsSubmitting(true);
      if (editingCategoryRef) {
        await axios.put(
          `/api/category/${editingCategoryRef.collectionGroup}/${editingCategoryRef.slug}`,
          payload
        );
        toast.success("Category updated");
      } else {
        await axios.post("/api/category", payload);
        toast.success("Category created");
      }
      await fetchCategories();
      refreshCategories();
      setFormState(initialFormState);
      setEditingCategoryRef(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      const message =
        error.response?.data?.message || "Failed to save category";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setFormState({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      subcategories: (category.subcategories || []).join(", "),
      collectionGroup: category.collectionGroup || "woman",
    });
    setEditingCategoryRef({
      slug: category.slug,
      collectionGroup: normalizeCollectionGroup(category.collectionGroup),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (category) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await axios.delete(
        `/api/category/${normalizeCollectionGroup(category.collectionGroup)}/${category.slug}`
      );
      toast.success("Category deleted");
      await fetchCategories();
      refreshCategories();
      if (
        editingCategoryRef &&
        editingCategoryRef.slug === category.slug &&
        editingCategoryRef.collectionGroup ===
          normalizeCollectionGroup(category.collectionGroup)
      ) {
        setEditingCategoryRef(null);
        setFormState(initialFormState);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      const message =
        error.response?.data?.message ||
        "Unable to delete category. Remove products first.";
      toast.error(message);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryRef(null);
    setFormState(initialFormState);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {editingCategoryRef ? "Edit Category" : "Create Category"}
            </h1>
            <p className="text-sm text-gray-500">
              Manage the categories available when creating products.
            </p>
          </div>
          {editingCategoryRef && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="e.g. Men"
              required
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="collectionGroup"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Collection Group
            </label>
            <select
              id="collectionGroup"
              name="collectionGroup"
              value={formState.collectionGroup}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 uppercase"
            >
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="kids">Kids</option>
            </select>
            <span className="text-xs text-gray-400 mt-1">
              Determines which mega-menu bucket this category belongs to.
            </span>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="image"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Hero Image URL
            </label>
            <input
              id="image"
              name="image"
              value={formState.image}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="https://..."
            />
            <span className="text-xs text-gray-400 mt-1">
              Displayed on the category landing page. Leave blank for default.
            </span>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formState.description}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
              placeholder="Short summary for merchandising and SEO."
            />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label
              htmlFor="subcategories"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Subcategories
            </label>
            <input
              id="subcategories"
              name="subcategories"
              value={formState.subcategories}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Comma separated e.g. T-Shirts, Jackets, Shoes"
            />
            <span className="text-xs text-gray-400 mt-1">
              These options will be available when assigning a subcategory to a
              product.
            </span>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-60"
            >
              {isSubmitting
                ? editingCategoryRef
                  ? "Updating..."
                  : "Creating..."
                : editingCategoryRef
                ? "Update Category"
                : "Create Category"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Categories ({categories.length})
          </h2>
          <button
            onClick={fetchCategories}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
            type="button"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No categories yet. Create your first one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategories
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 uppercase tracking-[0.2em] text-xs">
                      {category.collectionGroup || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {category.subcategories?.length
                        ? category.subcategories.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;
