import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface LogViewBody {
  product_id?: string;
  sku?: string;
  category_id?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LogViewBody;
    if (!body.sku) {
      return NextResponse.json({ ok: false, error: "missing sku" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("product_views").insert({
      product_id: body.product_id ?? null,
      sku: body.sku,
      category_id: body.category_id ?? null,
      utm_source: body.utm_source ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
    });

    if (error) console.error("log-view: insert failed", error);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("log-view: failed to log view", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
