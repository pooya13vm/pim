"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import formSchema from "./full_form_schema.json";
import { useRouter, useSearchParams } from "next/navigation";

interface Field {
  name: string;
  label: string;
  type: "text" | "select" | "radio" | "file" | "imageUpload";
  options?: string[];
  required?: boolean;
}

interface Section {
  name: string;
  conditions?: Record<string, string>;
  fields: Field[];
}

interface FormSchema {
  sections: Section[];
}

type FormData = Record<string, string>;

const schema = formSchema as FormSchema;

export default function DynamicFormPage() {
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialValues: FormData = {};
    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        initialValues[field.name] = "";
      });
    });
    setFormData(initialValues);
  }, []);

  useEffect(() => {
    const imageName = searchParams.get("imageName");
    if (imageName) {
      setFormData((prev) => ({
        ...prev,
        Main_Image_File_Name: imageName, // نام دقیق فیلد در JSON Schema
      }));
    }
  }, [searchParams]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkConditions = (conditions?: Record<string, string>) => {
    if (!conditions) return true;
    return Object.entries(conditions).every(
      ([key, val]) => formData[key] === val
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/save", formData);
      alert("✅ Form saved successfully!");
    } catch (err) {
      console.error("Error saving form:", err);
      alert("❌ Failed to save form.");
    } finally {
      setLoading(false);
      router.push("/");
    }
  };

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };
  const categoryToSubcategories: Record<string, string[]> = {
    Jewelry: [
      "Bracelets",
      "Rings",
      "Necklaces",
      "Earrings",
      "Pendants",
      "Custom Jewelry",
      "Engraved Jewelry",
      "Children’s Jewelry",
      "Men’s Jewelry",
      "Women's Jewelry",
    ],
    Crystals: [
      "Tumbled Stones",
      "Raw Specimens",
      "Crystal Clusters",
      "Polished",
      "Fetishes",
    ],
    Fossils: [
      "Ammonites",
      "Orthoceras",
      "Trilobites",
      "Megalodon (Teeth / Shards)",
      "Fossil Jewelry",
    ],
    Art: ["Paintings", "Pottery", "Textile Art", "Beadwork", "Sculptures"],
    // ...add the rest accordingly
  };

  const renderField = (field: Field) => {
    const commonClasses = "border rounded px-3 py-2 w-full";

    if (field.name === "Subcategory") {
      const selectedCategory = formData["Category"];
      const options = categoryToSubcategories[selectedCategory] || [];
      const isDisabled = !selectedCategory;

      return (
        <select
          className={commonClasses}
          value={formData[field.name]}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={isDisabled}
        >
          <option value="">Select a subcategory...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <select
          className={commonClasses}
          value={formData[field.name]}
          onChange={(e) => handleChange(field.name, e.target.value)}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "radio" && field.options) {
      return (
        <div className="flex gap-4">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={formData[field.name] === opt}
                onChange={() => handleChange(field.name, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "imageUpload" || field.type === "file") {
      return (
        <>
          <input
            type="file"
            className={commonClasses}
            onChange={(e) =>
              handleChange(field.name, e.target.files?.[0]?.name || "")
            }
          />
          {formData[field.name] && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {formData[field.name]}
            </p>
          )}
        </>
      );
    }

    return (
      <input
        type="text"
        className={commonClasses}
        value={formData[field.name]}
        onChange={(e) => handleChange(field.name, e.target.value)}
      />
    );
  };

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white mt-4 rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Form</h1>
      <form className="space-y-6">
        {schema.sections.map((section) => {
          if (!checkConditions(section.conditions)) return null;

          return (
            <div key={section.name} className="border rounded-lg shadow">
              <button
                type="button"
                onClick={() => toggleSection(section.name)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-150 text-left font-semibold rounded-lg"
              >
                {section.name}
                <span>
                  {expandedSections.includes(section.name) ? "−" : "+"}
                </span>
              </button>
              {expandedSections.includes(section.name) && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block font-medium mb-1">
                        {field.label}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Form"}
          </button>
        </div>
      </form>
    </main>
  );
}
