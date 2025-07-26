import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ItemData {
  [key: string]: string | null | undefined;
  blob_url?: string | null | undefined;
}

export async function POST(req: Request) {
  try {
    const data: ItemData = await req.json();
    console.log("📥 Data received by API:", data);

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("items").insert([data]);

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ API Unexpected Error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
