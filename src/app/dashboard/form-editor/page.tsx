"use client";

import { useState } from "react";
import schemaJson from "@/app/form/full_form_schema.json";

interface Field {
  name: string;
  label: string;
  type: string;
  multiple?: boolean;
  options?: string[];
}

interface Section {
  name: string;
  fields: Field[];
}

interface Schema {
  sections: Section[];
}

export default function FormEditorPage() {
  const [schema, setSchema] = useState<Schema>(schemaJson as Schema);
  const [selectedFieldName, setSelectedFieldName] = useState<string>("");
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState(false);

  // تمام فیلدها از همه سکشن‌ها برای Dropdown
  const allFields: Field[] = schema.sections.flatMap((section) =>
    section.fields.map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      multiple: field.multiple ?? false,
      options: field.options ?? [],
    }))
  );

  const handleSelectField = (fieldName: string) => {
    setSelectedFieldName(fieldName);
    const field = allFields.find((f) => f.name === fieldName);
    if (field) {
      setSelectedField(field);
      setSelectedType(field.type);
      setOptions(field.options ?? []);
    }
    setSuccessMessage(false);
  };
  const handleSave = async () => {
    const newSchema = { ...schema };

    newSchema.sections = newSchema.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.name === selectedFieldName) {
          const updatedField: Partial<Field> = {
            ...field,
            type: selectedType,
          };

          if (selectedType === "select" || selectedType === "multiselect") {
            updatedField.options = options;
            updatedField.multiple = selectedType === "multiselect";
          } else {
            delete updatedField.options;
            delete updatedField.multiple;
          }

          return updatedField as Field;
        }
        return field;
      }),
    }));

    setSchema(newSchema);

    try {
      await fetch("/api/save-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchema),
      });
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 2000);
    } catch (error) {
      console.error("Error saving schema:", error);
    }
  };
  //   const handleSave = async () => {
  //     const newSchema = { ...schema };
  //     newSchema.sections = newSchema.sections.map((section) => ({
  //       ...section,
  //       fields: section.fields.map((field) =>
  //         field.name === selectedFieldName
  //           ? {
  //               ...field,
  //               type: selectedType,
  //               options:
  //                 selectedType === "select" || selectedType === "multiselect"
  //                   ? options
  //                   : [],
  //               multiple: selectedType === "multiselect",
  //             }
  //           : field
  //       ),
  //     }));
  //     setSchema(newSchema);
  //     await fetch("/api/save-schema", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(newSchema),
  //     });
  //     setSuccessMessage(true);
  //     setTimeout(() => setSuccessMessage(false), 2000);
  //   };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Form Schema</h1>

      {/* پیام موفقیت */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
          Changes saved successfully!
        </div>
      )}

      {/* Dropdown انتخاب فیلد */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Field to Edit:</label>
        <select
          className="border rounded w-full px-3 py-2"
          value={selectedFieldName}
          onChange={(e) => handleSelectField(e.target.value)}
        >
          <option value="">-- Choose a Field --</option>
          {allFields.map((field, index) => (
            <option key={index} value={field.name}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* فرم ادیت فقط وقتی فیلد انتخاب شده */}
      {selectedField && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">
            Editing: {selectedField.label}
          </h2>

          {/* انتخاب نوع */}
          <label className="block mb-2">Field Type:</label>
          <select
            className="border rounded w-full px-3 py-2 mb-4"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi Select</option>
          </select>

          {/* اگر نوع select یا multiselect است */}
          {(selectedType === "select" || selectedType === "multiselect") && (
            <div className="mb-4">
              <label className="block mb-2">Options:</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 flex-1"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[i] = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                  <button
                    className="bg-red-500 text-white px-2 rounded"
                    onClick={() => removeOption(i)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={addOption}
              >
                Add Option
              </button>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
