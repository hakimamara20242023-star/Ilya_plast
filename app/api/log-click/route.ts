import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface LogClickBody {
  sku?: string;
  category_id?: string;
  source?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LogClickBody;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("whatsapp_clicks").insert({
      sku: body.sku ?? null,
      category_id: body.category_id ?? null,
      source: body.source ?? null,
      utm_source: body.utm_source ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
    });

    if (error) console.error("log-click: insert failed", error);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("log-click: failed to log click", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
