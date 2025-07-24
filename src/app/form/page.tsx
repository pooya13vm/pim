// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import axios from "axios";

// type FormData = {
//   [key: string]: string;
// };

// const initialForm: FormData = {
//   sku: "",
//   cloverId: "",
//   itemName: "",
//   cost: "",
//   quantity: "",
//   stones: "",
//   stoneName: "",
//   stoneLocation: "",
//   sizeOrCarat: "",
//   color: "",
//   finish: "",
//   chakras: "",
//   jewelry: "",
//   metal: "",
//   ring: "",
//   bandSize: "",
//   cuff: "",
//   cuffSize: "",
//   pendant: "",
//   pendantSize: "",
//   chain: "",
//   chainMetal: "",
//   chainType: "",
//   chainThickness: "",
//   chainLength: "",
//   location: "",
//   beaded: "",
//   beadSize: "",
//   beadMaterial: "",
//   beadType: "",
//   strandLength: "",
//   artistName: "",
//   artistTribe: "",
//   artistLocation: "",
//   specimen: "",
//   specimenType: "",
//   specimenSize: "",
//   grade: "",
//   crystallineStructure: "",
// };

// const dropdownOptions: Record<string, string[]> = {
//   finish: ["Cut", "Faceted", "Polished", "Rough"],
//   chainType: ["Box", "Snake", "Paperclip"],
//   beadType: ["Chip", "Faceted", "Round", "Rough", "Heishi"],
//   specimenType: [
//     "Palmstone",
//     "Tumble",
//     "Rough",
//     "Point",
//     "Sphere",
//     "Carving",
//     "Geode",
//   ],
// };

// export default function FormPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [form, setForm] = useState<FormData>(initialForm);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const analyzeImage = async () => {
//       const imageName = searchParams.get("imageName");
//       if (!imageName) return setLoading(false);

//       try {
//         const response = await axios.post("/api/classify", { imageName });
//         const data = response.data;
//         setForm((prev) => ({
//           ...prev,
//           ...data.fields,
//           chakras: data.chakra_matches?.join(", ") || "",
//         }));
//       } catch (err) {
//         console.error("❌ Error analyzing image", err);
//         alert("Failed to analyze image");
//       } finally {
//         setLoading(false);
//       }
//     };

//     analyzeImage();
//   }, [searchParams]);

//   const handleChange = (key: string, value: string) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSave = async () => {
//     try {
//       await axios.post("/api/save", form);
//       router.push("/csv");
//     } catch (err) {
//       console.error("Error saving CSV:", err);
//       alert("Failed to save CSV");
//     }
//   };

//   const renderField = (key: string, value: string) => {
//     const isJewelry = form.jewelry === "Yes";
//     const isSpecimen = form.specimen === "Yes";

//     const jewelryFields = [
//       "metal",
//       "ring",
//       "bandSize",
//       "cuff",
//       "cuffSize",
//       "pendant",
//       "pendantSize",
//       "chain",
//       "chainMetal",
//       "chainType",
//       "chainThickness",
//       "chainLength",
//       "location",
//       "beaded",
//       "beadSize",
//       "beadMaterial",
//       "beadType",
//       "strandLength",
//     ];

//     const specimenFields = [
//       "specimenType",
//       "specimenSize",
//       "grade",
//       "crystallineStructure",
//     ];

//     if (!isJewelry && jewelryFields.includes(key)) return null;
//     if (!isSpecimen && specimenFields.includes(key)) return null;

//     if (key === "jewelry" || key === "specimen") {
//       return (
//         <div key={key}>
//           <label className="block font-medium mt-4 mb-1">
//             {key === "jewelry" ? "Jewelry?" : "Specimen?"}
//           </label>
//           <div className="flex gap-4">
//             <label>
//               <input
//                 type="radio"
//                 value="Yes"
//                 checked={value === "Yes"}
//                 onChange={() => handleChange(key, "Yes")}
//               />{" "}
//               Yes
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 value="No"
//                 checked={value === "No"}
//                 onChange={() => handleChange(key, "No")}
//               />{" "}
//               No
//             </label>
//           </div>
//         </div>
//       );
//     }

//     if (dropdownOptions[key]) {
//       return (
//         <div key={key} className="mb-4">
//           <label className="block font-medium mb-1">
//             {key.replace(/([A-Z])/g, " $1")}
//           </label>
//           <select
//             value={value}
//             onChange={(e) => handleChange(key, e.target.value)}
//             className="border px-3 py-2 rounded w-full"
//           >
//             <option value="">Select...</option>
//             {dropdownOptions[key].map((opt) => (
//               <option key={opt} value={opt}>
//                 {opt}
//               </option>
//             ))}
//           </select>
//         </div>
//       );
//     }

//     return (
//       <div key={key} className="mb-4">
//         <label className="block font-medium mb-1">
//           {key.replace(/([A-Z])/g, " $1")}
//         </label>
//         <input
//           type="text"
//           value={value}
//           onChange={(e) => handleChange(key, e.target.value)}
//           className="border px-3 py-2 rounded w-full"
//         />
//       </div>
//     );
//   };

//   if (loading)
//     return <div className="p-6 text-center text-lg">Analyzing image...</div>;

//   return (
//     <main className="max-w-3xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Form</h1>
//       <form className="grid gap-4">
//         {Object.entries(form).map(([key, value]) => renderField(key, value))}
//         <button
//           type="button"
//           onClick={handleSave}
//           className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
//         >
//           Save to CSV
//         </button>
//       </form>
//     </main>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import formSchema from "./full_form_schema.json";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const initialValues: FormData = {};
    schema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        initialValues[field.name] = "";
      });
    });
    setFormData(initialValues);
  }, []);

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

  //   const exportToCSV = () => {
  //     const headers = schema.sections.flatMap((section) =>
  //       section.fields.map((field) => field.label)
  //     );
  //     const keys = schema.sections.flatMap((section) =>
  //       section.fields.map((field) => field.name)
  //     );
  //     const values = keys.map((key) => formData[key] || "");

  //     const csvContent = [headers.join(","), values.join(",")].join("\n");

  //     const blob = new Blob([`\uFEFF${csvContent}`], {
  //       type: "text/csv;charset=utf-8;",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "export.csv");
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   };

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const renderField = (field: Field) => {
    const commonClasses = "border rounded px-3 py-2 w-full";

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
        <input
          type="file"
          className={commonClasses}
          onChange={(e) =>
            handleChange(field.name, e.target.files?.[0]?.name || "")
          }
        />
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
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form</h1>
      <form className="space-y-6">
        {schema.sections.map((section) => {
          if (!checkConditions(section.conditions)) return null;

          return (
            <div key={section.name} className="border rounded-lg shadow">
              <button
                type="button"
                onClick={() => toggleSection(section.name)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-700 hover:bg-gray-800 text-left font-semibold rounded-lg"
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
          {/* <button
            type="button"
            onClick={exportToCSV}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Export to CSV
          </button> */}
        </div>
      </form>
    </main>
  );
}
