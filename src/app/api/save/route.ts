import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { error } = await supabase.from("items").insert([
      {
        ...data,
        blob_url: data.blob_url || null,
      },
    ]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
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
