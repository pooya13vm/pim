// "use client";
// import { useRouter } from "next/navigation";
// import { useRef } from "react";

// export default function HomePage() {
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const uploadData = new FormData();
//     uploadData.append("file", file);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: uploadData,
//       });
//       const json = await res.json();

//       if (json.success && json.url) {
//         router.push(`/form?imageUrl=${encodeURIComponent(json.url)}`);
//       } else {
//         alert("❌ Upload failed");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("❌ Unexpected error");
//     }
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen px-4">
//       <div className="p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6 border border-gray-700">
//         <h1 className="text-4xl font-extrabold">CIS</h1>

//         <button
//           className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
//           onClick={() => fileInputRef.current?.click()}
//         >
//           Add Product
//         </button>
//         <input
//           type="file"
//           accept="image/*"
//           hidden
//           ref={fileInputRef}
//           onChange={handleImageUpload}
//         />
//         <div className="pt-4 border-t border-gray-700">
//           <button
//             className="text-blue-400 hover:text-blue-300 font-medium transition"
//             onClick={() => router.push("/csv")}
//           >
//             View CSV File
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }
"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleAddItem = () => {
    router.push("/form"); // مستقیم میره به صفحه فرم
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6 border border-gray-700">
        <h1 className="text-4xl font-extrabold">CIS</h1>

        <button
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
          onClick={handleAddItem}
        >
          Add a new item
        </button>

        <div className="pt-4 border-t border-gray-700">
          <button
            className="text-blue-400 hover:text-blue-300 font-medium transition"
            onClick={() => router.push("/csv")}
          >
            View CSV File
          </button>
        </div>
      </div>
    </main>
  );
}
