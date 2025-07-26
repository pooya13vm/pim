"use client";

import { useState, useEffect } from "react";
import formSchema from "./full_form_schema.json";
import { useSearchParams } from "next/navigation";
import Select, { MultiValue } from "react-select";

interface Field {
  name: string;
  label: string;
  type: "text" | "select" | "file" | "imageUpload";
  options?: string[];
  dependsOn?: string;
  optionsMap?: Record<string, string[]>;
  multiple?: boolean;
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

interface OptionType {
  value: string;
  label: string;
}

const schema = formSchema as FormSchema;

export default function DynamicFormContent() {
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const searchParams = useSearchParams();

  // ✅ مقداردهی اولیه برای همه فیلدها
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
    const imageUrl = searchParams.get("imageUrl");
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        Main_Image_File_Name: imageUrl,
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

  const uploadFile = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    console.log("Uploading file:", file.name); // ✅ لاگ اول
    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    const json = await res.json();
    console.log("Upload response:", json); // ✅ لاگ دوم
    if (json.url) return json.url;
    throw new Error("Upload failed");
  };

  const handleFileChange = async (
    fieldName: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    if (fieldName === "Gallery_Image_File_Names") {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      setFormData((prev) => {
        const updated = { ...prev, [fieldName]: urls.join(",") };
        console.log("Updated formData (Gallery):", updated); // ✅
        return updated;
      });
    } else {
      const url = await uploadFile(files[0]);
      setFormData((prev) => {
        const updated = { ...prev, [fieldName]: url };
        console.log("Updated formData (Single):", updated); // ✅
        return updated;
      });
    }
  };

  // ✅ ذخیره فرم (فقط داده، بدون آپلود)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("Final data to save:", formData);
      const saveRes = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const saveJson = await saveRes.json();
      if (saveJson.success) {
        alert("✅ Data saved successfully!");
      } else {
        alert(`❌ Failed to save: ${saveJson.error}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Unexpected error occurred");
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
    const commonClasses = "border rounded px-3 py-2 w-full bg-white";

    if (field.type === "select") {
      let options: string[] = [];

      if (field.dependsOn && field.optionsMap) {
        const parentValue = formData[field.dependsOn];
        options = parentValue ? field.optionsMap[parentValue] || [] : [];
      } else {
        options = field.options || [];
      }

      if (field.multiple) {
        const selectOptions = options.map((opt) => ({
          value: opt,
          label: opt,
        }));

        const handleMultiSelect = (selectedOptions: MultiValue<OptionType>) => {
          const values = selectedOptions
            ? selectedOptions.map((o) => o.value)
            : [];
          handleChange(field.name, values.join(","));
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

    // ✅ برای فیلدهای فایل: آپلود همزمان و Preview
    if (field.type === "imageUpload" || field.type === "file") {
      return (
        <>
          <input
            type="file"
            className={commonClasses}
            name={field.name}
            multiple={field.multiple}
            onChange={(e) => handleFileChange(field.name, e.target.files)}
          />
          {formData[field.name] && (
            <div className="mt-2">
              {field.name === "Gallery_Image_File_Names" ? (
                formData[field.name]
                  .split(",")
                  .map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preview"
                      className="w-16 h-16 rounded mr-2 inline-block"
                    />
                  ))
              ) : (
                <img
                  src={formData[field.name]}
                  alt="Preview"
                  className="w-16 h-16 rounded"
                />
              )}
            </div>
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
    <main className="max-w-6xl mx-auto p-6 min-h-screen mt-4">
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
        <div className="flex gap-4 mt-4 mb-5">
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
