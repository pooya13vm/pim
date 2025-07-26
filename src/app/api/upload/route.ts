import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("❌ No file received");
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log("✅ Uploading file:", file.name);
    console.log(
      "✅ Using token:",
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN
        ? "Token Loaded"
        : "Token Missing"
    );

    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    });

    console.log("✅ Upload successful:", blob.url);

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
