// "use client";
// import { useRouter } from "next/navigation";

// export default function HomePage() {
//   const router = useRouter();

//   const handleAddItem = () => {
//     router.push("/form"); // مستقیم میره به صفحه فرم
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen px-4">
//       <div className="p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6 border border-gray-700">
//         <h1 className="text-4xl font-extrabold">CIS</h1>

//         <button
//           className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
//           onClick={handleAddItem}
//         >
//           Add a new item
//         </button>

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

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // ✅ به داشبورد ریدایرکت می‌کنه
  }, [router]);

  return null; // هیچ چیزی رندر نمی‌کنه
}
