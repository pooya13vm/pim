"use client";

import { useState, useEffect } from "react";
import formSchema from "./full_form_schema.json";
import { useRouter } from "next/navigation";
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
interface DynamicFormProps {
  mode: "add" | "edit";
  product?: any; // فقط وقتی mode=edit هست
}

interface FormSchema {
  sections: Section[];
}

type FormData = Record<string, string | string[]>; // string for single, string[] for multi
type PreviewFiles = Record<string, string[]>; // for local previews

interface OptionType {
  value: string;
  label: string;
}

const schema = formSchema as FormSchema;

export default function DynamicFormContent({
  mode,
  product,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [previewFiles, setPreviewFiles] = useState<PreviewFiles>({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (!schema) return;

    const initialValues: FormData = {};

    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        let value: string | string[] = "";

        if (mode === "edit" && product) {
          value = product[field.name] || "";
          if (field.multiple && typeof value === "string") {
            value = value.split(",").map((v: string) => v.trim());
          }
        } else {
          value = field.multiple ? [] : "";
        }

        initialValues[field.name] = value;
      });
    });

    setFormData(initialValues);
  }, [mode, product]);

  /** ✅ تغییر مقدار فیلد */
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => {
      if (name === "Category") {
        return { ...prev, Category: value, Subcategory: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  /** ✅ بررسی شرایط نمایش سکشن */
  const checkConditions = (conditions?: Record<string, string>) => {
    if (!conditions) return true;
    return Object.entries(conditions).every(
      ([key, val]) => formData[key] === val
    );
  };

  /** ✅ بررسی نمایش فیلد بر اساس انتخاب‌های قبلی */
  const checkShowIfIncludes = (conditions?: Record<string, string[]>) => {
    if (!conditions) return true;
    return Object.entries(conditions).every(([key, values]) => {
      const selectedValues = Array.isArray(formData[key])
        ? (formData[key] as string[])
        : (formData[key] as string).split(",");
      return values.some((val) => selectedValues.includes(val));
    });
  };

  /** ✅ آپلود فایل به سرور */
  const uploadFile = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    const json = await res.json();
    if (json.url) return json.url;
    throw new Error("Upload failed");
  };

  const handleFileChange = async (
    fieldName: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const isMultiple = schema.sections
      .flatMap((section) => section.fields)
      .find((f) => f.name === fieldName)?.multiple;

    setPreviewFiles((prev) => {
      const currentPreviews = prev[fieldName] || [];
      const newPreviews = [...currentPreviews];
      for (const file of Array.from(files)) {
        newPreviews.push(URL.createObjectURL(file));
      }
      return { ...prev, [fieldName]: newPreviews };
    });

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const uploadedUrl = await uploadFile(file);
      uploadedUrls.push(uploadedUrl);
    }

    setFormData((prev) => {
      if (isMultiple) {
        const currentUrls = Array.isArray(prev[fieldName])
          ? (prev[fieldName] as string[])
          : [];
        return { ...prev, [fieldName]: [...currentUrls, ...uploadedUrls] };
      } else {
        return { ...prev, [fieldName]: uploadedUrls[0] };
      }
    });
  };

  /** ✅ MultiSelect Handler */
  const handleMultiSelect = (
    name: string,
    selected: MultiValue<OptionType>
  ) => {
    const values = selected.map((o) => o.value);
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  /** ✅ رندر فیلدهای فرم */
  const renderField = (field: Field) => {
    const commonClasses = "border rounded px-3 py-2 w-full bg-white";

    /** ✅ SELECT Field */
    if (field.type === "select") {
      let options: string[] = [];

      if (field.dependsOn && field.optionsMap) {
        const parentValue = formData[field.dependsOn] as string;
        options = parentValue ? field.optionsMap[parentValue] || [] : [];
      } else {
        options = field.options || [];
      }

      if (field.multiple) {
        return (
          <Select
            isMulti
            options={options.map((opt) => ({ value: opt, label: opt }))}
            value={
              Array.isArray(formData[field.name])
                ? (formData[field.name] as string[]).map((val) => ({
                    value: val,
                    label: val,
                  }))
                : []
            }
            onChange={(selected) => handleMultiSelect(field.name, selected)}
            className="text-black"
          />
        );
      }

      return (
        <select
          className={commonClasses}
          value={formData[field.name] as string}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={
            field.dependsOn ? !(formData[field.dependsOn] as string) : false
          }
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

    /** ✅ FILE Upload Field */
    if (field.type === "file" || field.type === "imageUpload") {
      const isMultiple = field.multiple || false;

      const handleRemoveFile = (index?: number) => {
        setPreviewFiles((prev) => {
          const updatedPreviews = [...(prev[field.name] || [])];
          if (index !== undefined) {
            updatedPreviews.splice(index, 1);
          } else {
            updatedPreviews.splice(0, 1);
          }
          return { ...prev, [field.name]: updatedPreviews };
        });

        setFormData((prev) => {
          if (isMultiple) {
            const updatedUrls = Array.isArray(prev[field.name])
              ? [...(prev[field.name] as string[])]
              : [];
            if (index !== undefined) {
              updatedUrls.splice(index, 1);
            }
            return { ...prev, [field.name]: updatedUrls };
          } else {
            return { ...prev, [field.name]: "" };
          }
        });
      };

      return (
        <>
          <button
            type="button"
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition ${
              !isMultiple &&
              previewFiles[field.name] &&
              previewFiles[field.name].length > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              document.getElementById(`${field.name}-file`)?.click()
            }
            disabled={
              !isMultiple &&
              previewFiles[field.name] &&
              previewFiles[field.name].length > 0
            }
          >
            {field.name.toLowerCase().includes("video")
              ? "Upload Video"
              : "Upload Image"}
          </button>

          <input
            id={`${field.name}-file`}
            type="file"
            className="hidden"
            accept={
              field.name.toLowerCase().includes("video") ? "video/*" : "image/*"
            }
            multiple={isMultiple}
            onChange={(e) => handleFileChange(field.name, e.target.files)}
          />

          {previewFiles[field.name] && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previewFiles[field.name].map((src, idx) => {
                const isVideo = field.name.toLowerCase().includes("video");
                return (
                  <div
                    key={idx}
                    className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow"
                  >
                    {isVideo ? (
                      <video
                        src={src}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
    }

    /** ✅ TEXT Input */
    return (
      <input
        type="text"
        className={commonClasses}
        value={formData[field.name] as string}
        onChange={(e) => handleChange(field.name, e.target.value)}
      />
    );
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const normalizedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(",") : value,
        ])
      );

      let res;
      if (mode === "add") {
        res = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedData),
        });
      } else {
        res = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedData),
        });
      }

      const json = await res.json();
      if (json.success) {
        alert("✅ Saved");
      } else {
        alert("❌ Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     // ✅ آرایه‌ها را به رشته تبدیل می‌کنیم
  //     const normalizedData = Object.fromEntries(
  //       Object.entries(formData).map(([key, value]) => [
  //         key,
  //         Array.isArray(value) ? value.join(",") : value,
  //       ])
  //     );

  //     console.log("Final Data (Normalized):", normalizedData);

  //     const res = await fetch("/api/save", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(normalizedData),
  //     });

  //     const json = await res.json();
  //     if (json.success) {
  //       alert("✅ Saved");
  //     } else {
  //       console.error("Save Error:", json.error);
  //       alert("❌ Failed to save");
  //     }
  //   } catch (err) {
  //     console.error("Unexpected Error:", err);
  //     alert("❌ Unexpected error occurred");
  //   } finally {
  //     setLoading(false);
  //     router.push("/");
  //   }
  // };

  return (
    <main className="max-w-6xl mx-auto p-6 min-h-screen mt-4">
      <h1 className="text-2xl font-bold mb-6">Product Information</h1>
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
                onClick={() =>
                  setExpandedSections((prev) =>
                    prev.includes(section.name)
                      ? prev.filter((s) => s !== section.name)
                      : [...prev, section.name]
                  )
                }
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </main>
  );
}
