import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Context {
  params: {
    id: string;
  };
}

// ✅ GET محصول با ID
export async function GET(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ✅ PUT محصول (آپدیت)
export async function PUT(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("items")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ✅ DELETE محصول
export async function DELETE(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
