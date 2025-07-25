// // src/app/api/save/route.ts

// import { NextResponse } from "next/server";
// import { writeFile, appendFile, access } from "fs/promises";
// import path from "path";
// import { constants } from "fs";
// import schema from "../../form/full_form_schema.json"; // JSON schema

// const FILE_PATH = path.join(process.cwd(), "public", "items.csv");

// // Extract keys and headers from schema
// interface Field {
//   name: string;
//   label: string;
// }

// interface Section {
//   fields: Field[];
// }

// const keys = (schema.sections as Section[]).flatMap((section) =>
//   section.fields.map((field) => field.name)
// );

// const headers = (schema.sections as Section[]).flatMap((section) =>
//   section.fields.map((field) => field.label)
// );

// export async function POST(req: Request) {
//   try {
//     const formData = await req.json();

//     // Build row in schema order
//     const row =
//       keys
//         .map((key) => `"${(formData[key] || "").replace(/"/g, '""')}"`)
//         .join(",") + "\n";

//     try {
//       await access(FILE_PATH, constants.F_OK);
//     } catch {
//       // If file does not exist, write headers
//       await writeFile(FILE_PATH, headers.join(",") + "\n");
//     }

//     await appendFile(FILE_PATH, row);

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Error writing to CSV:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to write to CSV" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // درج داده در جدول
    const { error } = await supabase.from("items").insert([
      {
        ...data,
        blob_url: data.blob_url || null,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
