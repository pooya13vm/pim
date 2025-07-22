import { NextResponse } from "next/server";
import { writeFile, appendFile, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

const FILE_PATH = path.join(process.cwd(), "public", "items.csv");

function objectToCSVRow(data: Record<string, string>): string {
  const values = Object.values(data).map(
    (val) => `"${val?.replace(/"/g, '""') || ""}"`
  );
  return values.join(",") + "\n";
}

export async function POST(req: Request) {
  try {
    const formData = await req.json();

    const row = objectToCSVRow(formData);

    try {
      await access(FILE_PATH, constants.F_OK);
    } catch {
      const header = Object.keys(formData).join(",") + "\n";
      await writeFile(FILE_PATH, header);
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
