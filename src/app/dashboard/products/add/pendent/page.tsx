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
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Add Product page{" "}
        <span className="font-normal">{schema.baseTitle} - </span>
        <span className="text-red-600 font-semibold">Add pendant</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* pendant metal */}
        <section>
          <label className="block mb-2 text-gray-800">pendant Metal</label>
          <select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            className="w-full border rounded px-3 py-2"
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
          <div className="mb-2 text-xl font-medium">Pendant Dimension</div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block mb-2 text-gray-800">H:</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-28 border rounded px-3 py-2"
                placeholder="___"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800">W:</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-28 border rounded px-3 py-2"
                placeholder="___"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Stones repeater */}
      <div className="mt-10 space-y-6">
        {stones.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px_100px] items-end gap-3 border-t pt-6"
          >
            <div>
              <label className="block mb-1 text-gray-800">Stone</label>
              <select
                value={row.stone}
                onChange={(e) => updateStone(idx, "stone", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value=""></option>
                {stoneOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-800">Stone color</label>
              <select
                value={row.color}
                onChange={(e) => updateStone(idx, "color", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value=""></option>
                {colorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-800">Carat</label>
              <input
                type="number"
                value={row.carat}
                onChange={(e) => updateStone(idx, "carat", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="enter"
              />
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() => removeStone(idx)}
                className="ml-auto border rounded px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addStone}
          className="text-blue-600 hover:underline"
        >
          + add stone
        </button>
      </div>

      {/* footer */}
      <div className="mt-10 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.replace("/dashboard/products/add/StepTwo")}
          className="px-6 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className={`px-6 py-2 rounded ${
            canSave
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Save pendant
        </button>
      </div>
    </main>
  );
}
