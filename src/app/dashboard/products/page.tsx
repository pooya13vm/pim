"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
type Product = {
  id: string;
  SKU: string;
  Product_Name: string;
  Category: string;
  MainImage: string | null;
  created_at: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  /** ✅ دریافت محصولات از API */
  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /** ✅ هندل حذف محصول */
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Product deleted successfully");
        fetchProducts(); // دوباره محصولات رو بگیر
      } else {
        alert("❌ Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ An error occurred");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500 text-lg">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="p-6 text-gray-500 text-lg">No products found.</div>;
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => router.push("/dashboard/products/add")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
        >
          + Add New
        </button>
      </div>
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left">
                SKU
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Name
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Image
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Category
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Created
              </th>
              <th className="px-4 py-2 border border-gray-300 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                {/* SKU */}
                <td className="px-4 py-2 border border-gray-300">
                  {product.SKU || "-"}
                </td>
                {/* Name */}
                <td className="px-4 py-2 border border-gray-300">
                  {product.Product_Name || "-"}
                </td>
                {/* Image */}
                <td className="px-4 py-2 border border-gray-300">
                  {product.MainImage ? (
                    <Image
                      src={product.MainImage}
                      alt={product.Product_Name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Img</span>
                  )}
                </td>
                {/* Category */}
                <td className="px-4 py-2 border border-gray-300">
                  {product.Category || "-"}
                </td>
                {/* Created */}
                <td className="px-4 py-2 border border-gray-300 text-gray-500 text-sm">
                  {product.created_at
                    ? new Date(product.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                {/* Actions */}
                <td className="px-4 py-2 border border-gray-300 text-center">
                  <div className="flex justify-center gap-3">
                    {/* Edit Button */}
                    <button
                      onClick={() =>
                        router.push(`/dashboard/products/${product.id}`)
                      }
                      className="p-2 rounded-full hover:bg-gray-200 transition"
                      title="Edit"
                    >
                      <Pencil size={18} className="text-gray-600" />
                    </button>

                    {/* Delete Button */}
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 transition"
                      title="Delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
