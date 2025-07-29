"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DynamicFormContent from "@/app/form/DynamicFormContent";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-6 text-red-600">Product not found</div>;
  }

  return (
    <Suspense fallback={<div className="p-6">Loading form...</div>}>
      <DynamicFormContent mode="edit" product={product} />
    </Suspense>
  );
}
