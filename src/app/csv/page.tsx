// src/app/csv/page.tsx
"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function CSVViewPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/items.csv")
      .then((res) => {
        if (!res.ok) throw new Error("CSV not found");
        return res.text();
      })
      .then((text) => {
        const parsed = Papa.parse<string[]>(text.trim(), {
          skipEmptyLines: true,
        });
        setRows(parsed.data);
      })
      .catch(() => setError("No CSV file found."));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (rows.length === 0) return <div className="p-6">Loading CSV...</div>;

  return (
    <main className="p-6 bg-white text-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6">CSV Contents</h2>

      <a
        href="/items.csv"
        download
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download CSV
      </a>

      <div className="overflow-auto border rounded shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-gray-800 sticky top-0">
            <tr>
              {rows[0].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-100">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-2 border border-gray-300 text-sm whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
