"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

type FormData = {
  [key: string]: string;
};

const initialForm: FormData = {
  sku: "",
  cloverId: "",
  itemName: "",
  cost: "",
  quantity: "",
  stones: "",
  stoneName: "",
  stoneLocation: "",
  sizeOrCarat: "",
  color: "",
  finish: "",
  chakras: "",
  jewelry: "",
  metal: "",
  ring: "",
  bandSize: "",
  cuff: "",
  cuffSize: "",
  pendant: "",
  pendantSize: "",
  chain: "",
  chainMetal: "",
  chainType: "",
  chainThickness: "",
  chainLength: "",
  location: "",
  beaded: "",
  beadSize: "",
  beadMaterial: "",
  beadType: "",
  strandLength: "",
  artistName: "",
  artistTribe: "",
  artistLocation: "",
  specimen: "",
  specimenType: "",
  specimenSize: "",
  grade: "",
  crystallineStructure: "",
};

const dropdownOptions: Record<string, string[]> = {
  finish: ["Cut", "Faceted", "Polished", "Rough"],
  chainType: ["Box", "Snake", "Paperclip"],
  beadType: ["Chip", "Faceted", "Round", "Rough", "Heishi"],
  specimenType: [
    "Palmstone",
    "Tumble",
    "Rough",
    "Point",
    "Sphere",
    "Carving",
    "Geode",
  ],
};

export default function FormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeImage = async () => {
      const imageName = searchParams.get("imageName");
      if (!imageName) return setLoading(false);

      try {
        const response = await axios.post("/api/classify", { imageName });
        const data = response.data;
        setForm((prev) => ({
          ...prev,
          ...data.fields,
          chakras: data.chakra_matches?.join(", ") || "",
        }));
      } catch (err) {
        console.error("❌ Error analyzing image", err);
        alert("Failed to analyze image");
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [searchParams]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/save", form);
      router.push("/csv");
    } catch (err) {
      console.error("Error saving CSV:", err);
      alert("Failed to save CSV");
    }
  };

  const renderField = (key: string, value: string) => {
    const isJewelry = form.jewelry === "Yes";
    const isSpecimen = form.specimen === "Yes";

    const jewelryFields = [
      "metal",
      "ring",
      "bandSize",
      "cuff",
      "cuffSize",
      "pendant",
      "pendantSize",
      "chain",
      "chainMetal",
      "chainType",
      "chainThickness",
      "chainLength",
      "location",
      "beaded",
      "beadSize",
      "beadMaterial",
      "beadType",
      "strandLength",
    ];

    const specimenFields = [
      "specimenType",
      "specimenSize",
      "grade",
      "crystallineStructure",
    ];

    if (!isJewelry && jewelryFields.includes(key)) return null;
    if (!isSpecimen && specimenFields.includes(key)) return null;

    if (key === "jewelry" || key === "specimen") {
      return (
        <div key={key}>
          <label className="block font-medium mt-4 mb-1">
            {key === "jewelry" ? "Jewelry?" : "Specimen?"}
          </label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="Yes"
                checked={value === "Yes"}
                onChange={() => handleChange(key, "Yes")}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                value="No"
                checked={value === "No"}
                onChange={() => handleChange(key, "No")}
              />{" "}
              No
            </label>
          </div>
        </div>
      );
    }

    if (dropdownOptions[key]) {
      return (
        <div key={key} className="mb-4">
          <label className="block font-medium mb-1">
            {key.replace(/([A-Z])/g, " $1")}
          </label>
          <select
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Select...</option>
            {dropdownOptions[key].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={key} className="mb-4">
        <label className="block font-medium mb-1">
          {key.replace(/([A-Z])/g, " $1")}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>
    );
  };

  if (loading)
    return <div className="p-6 text-center text-lg">Analyzing image...</div>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form</h1>
      <form className="grid gap-4">
        {Object.entries(form).map(([key, value]) => renderField(key, value))}
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Save to CSV
        </button>
      </form>
    </main>
  );
}
