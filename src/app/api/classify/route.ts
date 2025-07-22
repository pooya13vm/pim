import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const imageName = body.imageName;

  console.log("📦 image added", imageName);

  // داده‌ی ساختگی برای تست
  const result = {
    label: "Test Label",
    confidence: "98%",
    filename: imageName,
  };

  return NextResponse.json(result);
}
