"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ اتصال به Supabase (Env Variables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Item {
  id: string;
  Product_Name: string;
  Category: string;
  Status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("items")
          .select("id, Product_Name, Category, Status, created_at");

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError("Failed to load data from database");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <div className="p-6">Loading Dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // ✅ محاسبات
  const totalProducts = items.length;
  const statusCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  items.forEach((item) => {
    if (item.Status) {
      statusCounts[item.Status] = (statusCounts[item.Status] || 0) + 1;
    }
    if (item.Category) {
      categoryCounts[item.Category] = (categoryCounts[item.Category] || 0) + 1;
    }
  });

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      {/* عنوان داشبورد */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inventory Overview
      </h1>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Products
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {totalProducts}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Active Items</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {statusCounts["In Stock"] || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Out of Stock</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {statusCounts["Out of Stock"] || 0}
          </p>
        </div>
      </div>

      {/* دسته‌بندی‌ها */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Products by Category
        </h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <li
              key={cat}
              className="flex justify-between bg-gray-100 px-4 py-2 rounded"
            >
              <span>{cat}</span>
              <span className="font-bold">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* لیست آخرین محصولات */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Products
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="text-left p-2 border">Name</th>
              <th className="text-left p-2 border">Category</th>
              <th className="text-left p-2 border">Status</th>
              <th className="text-left p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {items
              .slice(-5)
              .reverse()
              .map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.Product_Name || "N/A"}</td>
                  <td className="p-2">{item.Category || "-"}</td>
                  <td className="p-2">{item.Status || "-"}</td>
                  <td className="p-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
