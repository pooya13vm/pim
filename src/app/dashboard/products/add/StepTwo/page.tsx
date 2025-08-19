"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import schemaJson from "@/app/schemas/form.json";
import type { Step2Schema, Step2Field } from "@/app/schemas/types";

const schema: Step2Schema = schemaJson as Step2Schema;
const DRAFT_KEY = "productDraft";

const STRAND = {
  CHAIN: "Chain",
  LEATHER: "Leather cord",
  BEADED: "Beaded",
  NONE: "None",
} as const;

type Data = Record<string, string>;
type BeadedRow = {
  stone: string;
  stoneColor: string;
  beadedFinish: string;
  beadedShape: string;
};
type PendantStone = { stone: string; color: string; carat: string };
type Pendant = {
  metal: string;
  height?: string;
  width?: string;
  stones: PendantStone[];
};
export default function Step2Page() {
  const router = useRouter();
  const [pendants, setPendants] = useState<Pendant[]>([]);
  const [data, setData] = useState<Data>({});
  const [beadedStones, setBeadedStones] = useState<BeadedRow[]>([]);

  // ---------- helpers from schema ----------
  const allFields: Step2Field[] = schema.groups.flatMap(
    (g) => g.fields as Step2Field[]
  );

  const beadedFieldNames = new Set([
    "stone",
    "stoneColor",
    "beadedFinish",
    "beadedShape",
  ]);

  const pickField = (name: string) =>
    allFields.find((f) => f.name === name) as Step2Field | undefined;

  const optionsStone = pickField("stone")?.options ?? [];
  const optionsStoneColor = pickField("stoneColor")?.options ?? [];
  const optionsFinish = pickField("beadedFinish")?.options ?? [];
  const optionsShape = pickField("beadedShape")?.options ?? [];

  // ---------- read draft (guard Step1) ----------
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) {
        router.replace("/dashboard/products/add");
        return;
      }
      const draft = JSON.parse(raw);
      if (draft.step2) setData(draft.step2);
      if (draft.step2?.beadedStones) setBeadedStones(draft.step2.beadedStones);
      if (draft.step2?.pendants) setPendants(draft.step2.pendants);
    } catch {
      router.replace("/dashboard/products/add");
    }
  }, [router]);

  // ---------- visibility ----------
  const isVisible = (f: Step2Field) => {
    // وقتی Beaded هستیم، این ۴ فیلد را با رندر اختصاصی نشان می‌دهیم
    if (data.strand === STRAND.BEADED && beadedFieldNames.has(f.name))
      return false;

    if (!f.showIf) return true;
    return Object.entries(f.showIf).every(([k, vals]) =>
      vals.includes(data[k] || "")
    );
  };

  // ---------- strand sets (برای پاکسازی وابسته‌ها) ----------
  const strandSets = useMemo(() => {
    const commonLen = ["strandLength", "strandWidth"];
    return {
      [STRAND.CHAIN]: [...commonLen, "chainType", "chainMetal"],
      [STRAND.LEATHER]: [...commonLen, "leatherColor"],
      [STRAND.BEADED]: [...commonLen], // فیلدهای مروبط به مهره‌ها را جدا مدیریت می‌کنیم
      [STRAND.NONE]: ["stone", "stoneColor"],
    } as Record<string, string[]>;
  }, []);

  const allStrandSpecificKeys = useMemo(() => {
    const s = new Set<string>();
    Object.values(strandSets).forEach((arr) => arr.forEach((k) => s.add(k)));
    // بعلاوه ۴ فیلد سنگ برای حالت None (چون در Beaded اختصاصی رندر می‌شوند)
    ["stone", "stoneColor"].forEach((k) => s.add(k));
    return s;
  }, [strandSets]);

  const persist = (
    nextData: Data,
    nextBeaded: BeadedRow[],
    nextPendants: Pendant[] = pendants
  ) => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const draft = raw ? JSON.parse(raw) : {};
      const prevStep2 = draft.step2 || {};
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          ...draft,
          step: 2,
          updatedAt: Date.now(),
          step2: {
            ...prevStep2,
            ...nextData,
            beadedStones: nextBeaded,
            pendants: nextPendants,
          },
        })
      );
    } catch {}
  };

  // ---------- setField ----------
  const setField = (name: string, value: string) => {
    setData((prev) => {
      let next: Data = { ...prev, [name]: value };

      // type تغییر کرد
      if (name === "type" && value !== "necklace") {
        next = { type: value };
        // پاکسازی ردیف‌های مهره هم
        if (beadedStones.length) {
          setBeadedStones([]);
          persist({ type: value }, []);
        } else {
          persist({ type: value }, []);
        }
        return next;
      }

      // strand تغییر کرد
      if (name === "strand") {
        const keep = new Set<string>([
          "type",
          "strand",
          ...(strandSets[value] || []),
        ]);
        for (const key of Array.from(allStrandSpecificKeys)) {
          if (!keep.has(key)) delete next[key];
        }

        // ورود به Beaded → اگر لیست خالی است یک ردیف بساز
        if (value === STRAND.BEADED && beadedStones.length === 0) {
          const one: BeadedRow = {
            stone: "",
            stoneColor: "",
            beadedFinish: "",
            beadedShape: "",
          };
          setBeadedStones([one]);
          persist(next, [one]);
          return next;
        }

        // خروج از Beaded → لیست را پاک کن
        if (value !== STRAND.BEADED && beadedStones.length) {
          setBeadedStones([]);
          persist(next, []);
          return next;
        }
      }

      persist(next, beadedStones);
      return next;
    });
  };

  // ---------- beaded rows handlers ----------
  const addBeadedRow = () => {
    const one: BeadedRow = {
      stone: "",
      stoneColor: "",
      beadedFinish: "",
      beadedShape: "",
    };
    const next = [...beadedStones, one];
    setBeadedStones(next);
    persist(data, next);
  };

  const removeBeadedRow = (idx: number) => {
    const next = beadedStones.filter((_, i) => i !== idx);
    setBeadedStones(next);
    persist(data, next);
  };

  const updateBeadedRow = (
    idx: number,
    key: keyof BeadedRow,
    value: string
  ) => {
    const next = beadedStones.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    );
    setBeadedStones(next);
    persist(data, next);
  };

  // ---------- validation ----------
  const baseRequiredOk = () =>
    allFields
      .filter(
        (f: Step2Field) =>
          isVisible(f) && // این خودش Beaded fields را در حالت Beaded حذف می‌کند
          f.requiredWhenVisible
      )
      .every((f: Step2Field) => (data[f.name] || "").trim() !== "");

  const beadedOk =
    data.strand !== STRAND.BEADED ||
    (beadedStones.length > 0 &&
      beadedStones.every(
        (r) => r.stone && r.stoneColor && r.beadedFinish && r.beadedShape
      ));

  const canNext = baseRequiredOk() && beadedOk;

  // ---------- title ----------
  const strandTitle = data.strand ? ` - ${data.strand}` : "";

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Add Product page{" "}
        {/* <span className="font-normal">
          {schema.baseTitle}
          {strandTitle}
        </span> */}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {schema.groups.map((group, gi) => (
          <section key={gi} className="space-y-6">
            {(group.fields as Step2Field[]).map((f: Step2Field) => {
              if (!isVisible(f)) return null;
              return (
                <div key={f.name} className="flex items-center gap-4">
                  {/* label */}
                  <label className="w-40 shrink-0 text-gray-800">
                    {f.label}
                  </label>

                  {/* control */}
                  {f.type === "select" ? (
                    <select
                      value={data[f.name] || ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      className="flex-1 h-10 border rounded px-3 py-2 bg-white"
                    >
                      <option value=""></option>
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "number" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={data[f.name] || ""}
                        onChange={(e) => setField(f.name, e.target.value)}
                        className="h-10 w-32 border rounded px-3 py-2 bg-white"
                      />
                      {f.suffix ? (
                        <span className="text-gray-700">{f.suffix}</span>
                      ) : null}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={data[f.name] || ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      className="flex-1 h-10 border rounded px-3 py-2 bg-white"
                    />
                  )}
                </div>
              );
            })}

            {/* ---------- Beaded rows UI ---------- */}
            {data.strand === STRAND.BEADED && (
              <div className="space-y-3">
                {beadedStones.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                  >
                    {/* Stone */}
                    <div>
                      <label className="block mb-1 text-gray-800">Stone</label>
                      <select
                        value={row.stone}
                        onChange={(e) =>
                          updateBeadedRow(idx, "stone", e.target.value)
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value=""></option>
                        {optionsStone.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stone color */}
                    <div>
                      <label className="block mb-1 text-gray-800">
                        Stone color
                      </label>
                      <select
                        value={row.stoneColor}
                        onChange={(e) =>
                          updateBeadedRow(idx, "stoneColor", e.target.value)
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value=""></option>
                        {optionsStoneColor.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Finish */}
                    <div>
                      <label className="block mb-1 text-gray-800">
                        Beaded Finish
                      </label>
                      <select
                        value={row.beadedFinish}
                        onChange={(e) =>
                          updateBeadedRow(idx, "beadedFinish", e.target.value)
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value=""></option>
                        {optionsFinish.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shape + remove */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block mb-1 text-gray-800">
                          Beaded Shape
                        </label>
                        <select
                          value={row.beadedShape}
                          onChange={(e) =>
                            updateBeadedRow(idx, "beadedShape", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value=""></option>
                          {optionsShape.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeBeadedRow(idx)}
                        className="self-end border rounded px-3 py-2 hover:bg-gray-50"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBeadedRow}
                  className="text-blue-600 hover:underline"
                >
                  + add beaded stone
                </button>
              </div>
            )}
            {pendants.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-medium mb-3">Pendants</h2>
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Metal</th>
                        <th className="text-left p-2">Dimension (H×W)</th>
                        <th className="text-left p-2">Stones</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendants.map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{p.metal || "—"}</td>
                          <td className="p-2">
                            {(p.height || "—") + " × " + (p.width || "—")}
                          </td>
                          <td className="p-2">
                            {p.stones.map((s, idx) => {
                              const label = `${s.stone || "?"}${
                                s.carat ? ` (${s.carat})` : ""
                              } - ${s.color || "?"}`;
                              return (
                                <span key={idx} className="inline-block mr-2">
                                  {label}
                                </span>
                              );
                            })}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const next = pendants.filter((_, j) => j !== i);
                                setPendants(next);
                                persist(data, beadedStones, next);
                              }}
                              className="border rounded px-3 py-1 hover:bg-gray-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* دکمه‌ی add pendant همیشه */}
            <div className="pt-2">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => router.push("/dashboard/products/add/pendent")}
              >
                + add pendant
              </button>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard/products/add")}
          className="px-6 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => {
            alert("Step 2 collected (UI only).");
            // router.push("/dashboard/products/add/step-3")
          }}
          className={`px-6 py-2 rounded ${
            canNext
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </main>
  );
}
