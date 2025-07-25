"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import formSchema from "./full_form_schema.json";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "react-select";

interface Field {
  name: string;
  label: string;
  type: "text" | "select" | "radio" | "file" | "imageUpload";
  options?: string[];
  dependsOn?: string;
  optionsMap?: Record<string, string[]>;
  multiple?: boolean;
  //   conditions?: Record<string, string>;
  showIfIncludes?: Record<string, string[]>;
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

  // Initialize form fields
  useEffect(() => {
    const initialValues: FormData = {};
    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        initialValues[field.name] = "";
      });
    });
    setFormData(initialValues);
  }, []);

  // If imageName from HomePage, set it
  useEffect(() => {
    const imageName = searchParams.get("imageName");
    if (imageName) {
      setFormData((prev) => ({
        ...prev,
        Main_Image_File_Name: imageName,
      }));
    }
  }, [searchParams]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => {
      if (name === "Category") {
        return { ...prev, Category: value, Subcategory: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const checkConditions = (conditions?: Record<string, string>) => {
    if (!conditions) return true;
    return Object.entries(conditions).every(
      ([key, val]) => formData[key] === val
    );
  };

  const checkShowIfIncludes = (conditions?: Record<string, string[]>) => {
    if (!conditions) return true;
    return Object.entries(conditions).every(([key, values]) => {
      const selectedValues = formData[key]?.split(",") || [];
      return values.some((val) => selectedValues.includes(val));
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/save", formData);
      alert("✅ Form saved successfully!");
      router.push("/");
    } catch (err) {
      console.error("Error saving form:", err);
      alert("❌ Failed to save form.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const renderField = (field: Field) => {
    const commonClasses = "border rounded px-3 py-2 w-full";

    // Handle select (single or multi)
    if (field.type === "select") {
      let options: string[] = [];

      if (field.dependsOn && field.optionsMap) {
        const parentValue = formData[field.dependsOn];
        options = parentValue ? field.optionsMap[parentValue] || [] : [];
      } else {
        options = field.options || [];
      }

      // React Select for multi-select
      if (field.multiple) {
        const selectOptions = options.map((opt) => ({
          value: opt,
          label: opt,
        }));

        const handleMultiSelect = (selectedOptions: any) => {
          const values = selectedOptions
            ? selectedOptions.map((o: any) => o.value)
            : [];
          handleChange(field.name, values.join(",")); // Save as CSV
        };

        return (
          <Select
            isMulti
            options={selectOptions}
            value={
              formData[field.name]
                ? formData[field.name]
                    .split(",")
                    .map((val) => ({ value: val, label: val }))
                : []
            }
            onChange={handleMultiSelect}
            className="text-black"
          />
        );
      }

      // Normal single select
      return (
        <select
          className={commonClasses}
          value={formData[field.name]}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={field.dependsOn ? !formData[field.dependsOn] : false}
        >
          <option value="">Select...</option>
          {options.map((opt, index) => (
            <option key={`${opt}-${index}`} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // File upload
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
            <p className="text-sm text-gray-400 mt-1">
              Selected: {formData[field.name]}
            </p>
          )}
        </>
      );
    }

    // Default text input
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
    <main className="max-w-6xl mx-auto p-6min-h-screen mt-4">
      <h1 className="text-2xl font-bold mb-6">Goods import form</h1>
      <form className="space-y-6">
        {schema.sections.map((section) => {
          if (!checkConditions(section.conditions)) return null;

          return (
            <div
              key={section.name}
              className="border border-gray-700 rounded-lg shadow"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.name)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-left font-semibold rounded-lg"
              >
                {section.name}
                <span>
                  {expandedSections.includes(section.name) ? "−" : "+"}
                </span>
              </button>
              {expandedSections.includes(section.name) && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => {
                    // if (!checkConditions(field.conditions)) return null;
                    if (!checkShowIfIncludes(field.showIfIncludes)) return null;

                    return (
                      <div key={field.name}>
                        <label className="block font-medium mb-1">
                          {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    );
                  })}
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
