import { NextResponse } from "next/server";
import { writeFile, appendFile, access } from "fs/promises";
import path from "path";
import { constants } from "fs";
import schema from "../../form/full_form_schema.json"; // JSON schema

const FILE_PATH = path.join(process.cwd(), "public", "items.csv");

// Extract keys and headers from schema
const keys = schema.sections.flatMap((section: any) =>
  section.fields.map((field: any) => field.name)
);
const headers = schema.sections.flatMap((section: any) =>
  section.fields.map((field: any) => field.label)
);

export async function POST(req: Request) {
  try {
    const formData = await req.json();

    // Build row in schema order
    const row =
      keys
        .map((key) => `"${(formData[key] || "").replace(/"/g, '""')}"`)
        .join(",") + "\n";

    try {
      await access(FILE_PATH, constants.F_OK);
    } catch {
      // If file does not exist, write headers
      await writeFile(FILE_PATH, headers.join(",") + "\n");
    }

    await appendFile(FILE_PATH, row);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error writing to CSV:", err);
    return NextResponse.json(
      { success: false, error: "Failed to write to CSV" },
      { status: 500 }
    );
  }
}
