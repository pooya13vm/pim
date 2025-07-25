import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN, // مطمئن شو تو Vercel تعریف شده
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
