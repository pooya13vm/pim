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
      router.push(`/form?imageName=${file.name}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">📷 GemLens</h1>

        <button
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
          onClick={() => fileInputRef.current?.click()}
        >
          افزودن آیتم جدید
        </button>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        <div className="pt-4 border-t border-gray-200">
          <button
            className="text-blue-600 hover:text-blue-800 font-medium transition"
            onClick={() => router.push("/csv")}
          >
            مشاهده فایل CSV
          </button>
        </div>
      </div>
    </main>
  );
}
