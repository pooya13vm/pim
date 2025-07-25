// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";

// export async function POST(req: Request) {
//   try {
//     const data = await req.json();

//     const { error } = await supabase.from("items").insert([
//       {
//         ...data,
//         blob_url: data.blob_url || null,
//       },
//     ]);

//     if (error) {
//       console.error("Supabase Insert Error:", error.message);
//       return NextResponse.json(
//         { success: false, error: error.message },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json(
//       { success: false, error: "Unexpected error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ItemData {
  [key: string]: string | null | undefined;
  blob_url?: string | null | undefined;
}

export async function POST(req: Request) {
  try {
    const data: ItemData = await req.json();

    // اعتبارسنجی حداقلی
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    // درج داده در جدول Supabase
    const { error } = await supabase.from("items").insert([
      {
        ...data,
        blob_url: data.blob_url || null, // اگر URL وجود نداشت، مقدار null
      },
    ]);

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
