"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Menu, Home, Settings, Box, FileEdit } from "lucide-react"; // آیکون‌ها

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/dashboard", icon: <Home size={18} /> },

    { name: "Products", href: "/dashboard/products", icon: <Box size={18} /> },
    {
      name: "Edit Form",
      href: "/dashboard/form-editor",
      icon: <FileEdit size={18} />, // یا هر آیکونی که مناسب هست
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">
          PIM
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 transition ${
                    pathname === item.href
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-2xl  font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Save
            </button> */}
            {/* <div className="w-10 h-10 rounded-full bg-gray-300"></div> */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
