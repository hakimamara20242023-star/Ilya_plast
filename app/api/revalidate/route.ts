import { NextRequest, NextResponse } from "next/server";
import { revalidateProduct } from "@/lib/revalidate";

export const runtime = "nodejs";

// Wire this up as a Supabase Database Webhook (insert/update on `products`)
// so edits made in Supabase Studio go live in ~2 seconds instead of waiting
// for the hourly ISR revalidation. Send header `x-revalidate-secret`.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { sku?: string; category_id?: string };
  if (!body.sku || !body.category_id) {
    return NextResponse.json({ ok: false, error: "missing sku/category_id" }, { status: 400 });
  }

  revalidateProduct({ sku: body.sku, category_id: body.category_id });
  return NextResponse.json({ ok: true });
}
