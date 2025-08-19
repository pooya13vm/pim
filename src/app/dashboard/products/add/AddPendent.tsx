"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import schemaJson from "@/app/schemas/form.json";
import type { Step2Schema, Step2Field } from "@/app/schemas/types";

const schema: Step2Schema = schemaJson as Step2Schema;
const DRAFT_KEY = "productDraft";

type PendantStone = { stone: string; color: string; carat: string };
type Pendant = {
  metal: string;
  height?: string;
  width?: string;
  stones: PendantStone[];
};

export default function AddPendantPage() {
  const router = useRouter();

  // --- گارد: باید از Step2 آمده باشیم
  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) router.replace("/dashboard/products/add");
  }, [router]);

  // --- گزینه‌ها از اسکیما
  const allFields: Step2Field[] = useMemo(
    () => schema.groups.flatMap((g) => g.fields as Step2Field[]),
    []
  );
  const metalOptions =
    allFields.find((f) => f.name === "chainMetal")?.options ?? [];
  const stoneOptions = allFields.find((f) => f.name === "stone")?.options ?? [];
  const colorOptions =
    allFields.find((f) => f.name === "stoneColor")?.options ?? [];

  // --- state
  const [metal, setMetal] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [stones, setStones] = useState<PendantStone[]>([
    { stone: "", color: "", carat: "" },
  ]);

  const addStone = () =>
    setStones((prev) => [...prev, { stone: "", color: "", carat: "" }]);

  const removeStone = (idx: number) =>
    setStones((prev) => prev.filter((_, i) => i !== idx));

  const updateStone = (idx: number, key: keyof PendantStone, value: string) =>
    setStones((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s))
    );

  const canSave =
    metal.trim() !== "" &&
    stones.length > 0 &&
    stones.every((s) => s.stone && s.color); // قیرات اختیاری

  const onSave = () => {
    if (!canSave) return;

    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const draft = raw ? JSON.parse(raw) : {};
      const prevStep2 = draft.step2 || {};
      const prevPendants: Pendant[] = prevStep2.pendants || [];

      const newPendant: Pendant = {
        metal,
        height: height.trim(),
        width: width.trim(),
        stones,
      };

      const nextStep2 = {
        ...prevStep2,
        pendants: [...prevPendants, newPendant],
      };

      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          ...draft,
          step: 2,
          updatedAt: Date.now(),
          step2: nextStep2,
        })
      );

      router.replace("/dashboard/products/add/StepTwo");
    } catch {
      router.replace("/dashboard/products/add/StepTwo");
    }
  };

  return (
    <main className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* pendant metal */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pendant metal
          </label>
          <select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            className="w-full h-10 border rounded px-3"
          >
            <option value=""></option>
            {metalOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </section>

        {/* dimensions */}
        <section className="md:col-span-2">
          <div className="mb-2 text-base font-semibold text-gray-800">
            Pendant dimensions
          </div>
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                H
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-32 h-10 border rounded pl-3 pr-10 bg-white"
                  placeholder="—"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                  mm
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                W
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-32 h-10 border rounded pl-3 pr-10 bg-white"
                  placeholder="—"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                  mm
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stones repeater */}
      <div className="mt-10 space-y-6">
        {stones.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-end gap-4 border rounded p-4"
          >
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Stone
              </label>
              <select
                value={row.stone}
                onChange={(e) => updateStone(idx, "stone", e.target.value)}
                className="w-full h-10 border rounded px-3 bg-white"
              >
                <option value=""></option>
                {stoneOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Stone color
              </label>
              <select
                value={row.color}
                onChange={(e) => updateStone(idx, "color", e.target.value)}
                className="w-full h-10 border rounded px-3 bg-white"
              >
                <option value=""></option>
                {colorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Carat
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={row.carat}
                  onChange={(e) => updateStone(idx, "carat", e.target.value)}
                  className="w-full h-10 border rounded pl-3 pr-10 bg-white"
                  placeholder="—"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                  ct
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeStone(idx)}
                className="h-10 px-3 border rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addStone}
          className="text-sm text-blue-600 hover:underline"
        >
          + add stone
        </button>
      </div>

      {/* هیدن‌کردن اسپینرهای number برای یکدست‌شدن ورودی‌ها */}
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </main>
  );
}
