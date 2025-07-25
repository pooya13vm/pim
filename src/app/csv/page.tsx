// "use client";
import { useEffect, useState } from "react";

export default function CSVViewPage() {
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/export")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CSV");
        return res.text();
      })
      .then((text) => {
        const parsed = text
          .trim()
          .split("\n")
          .map((line) => line.split(","));
        setRows(parsed);
      })
      .catch(() => setError("Failed to load CSV from database"));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (rows.length === 0) return <div className="p-6">Loading CSV...</div>;

  return (
    <main className="p-6 bg-white text-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Database Export (CSV)</h2>

      <a
        href="/api/export"
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
