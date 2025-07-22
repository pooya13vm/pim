"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function HomePage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      router.push(`/form?imageName=${file.name}`); // پاس دادن نام فایل
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">GemLens</h1>
      <button className="btn" onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </button>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <button
        className="text-blue-500 underline"
        onClick={() => router.push("/csv")}
      >
        View CSV
      </button>
    </main>
  );
}
