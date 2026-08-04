import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

// SHA-256 hashing helper is available for PII fields — kept ready even
// though this catalog collects none (no accounts, no forms).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sha256Hex } from "@/lib/hash";

export const runtime = "nodejs";

interface CapiRequestBody {
  event_name: string;
  event_id: string;
  sku?: string;
  source?: string;
  content_category?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CapiRequestBody;
    const { event_name, event_id, sku, source, content_category } = body;

    if (!event_name || !event_id) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }

    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!pixelId || !accessToken) {
      console.warn("meta-capi: missing NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN");
      return NextResponse.json({ ok: false, error: "not configured" }, { status: 200 });
    }

    const cookieStore = await cookies();
    const headerStore = await headers();

    const fbp = cookieStore.get("_fbp")?.value;
    const fbc = cookieStore.get("_fbc")?.value;
    const clientIp =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      undefined;
    const userAgent = headerStore.get("user-agent") || undefined;
    const referer = headerStore.get("referer") || undefined;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ilyaplast.dz";
    const eventSourceUrl = referer || (sku ? `${siteUrl}/p/${sku}` : siteUrl);

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name,
          event_id,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data: {
            fbp,
            fbc,
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: {
            content_ids: sku ? [sku] : undefined,
            content_category,
            source,
          },
        },
      ],
      access_token: accessToken,
    };

    const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("meta-capi: graph api error", res.status, errText);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // A CAPI failure must never surface to the client / block the WhatsApp redirect.
    console.error("meta-capi: failed to relay event", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
