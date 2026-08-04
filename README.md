# ILYA PLAST — كتالوج B2B

Mobile-first product catalog for a PET/HDPE bottle factory in Sétif, Algeria.
No cart, no checkout — every product page ends at a WhatsApp button with the
SKU already written in the message. Traffic is 100% Facebook ads → mobile.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Supabase (Postgres +
RLS + Storage for product photos) · Meta Pixel + Conversions API · Vercel.

## Setup

1. **Install deps**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then run the migrations and seed, in order:

   ```bash
   # In the Supabase SQL editor, run in order:
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_storage_and_views.sql
   supabase/migrations/0003_admin.sql
   supabase/migrations/0004_uses.sql
   supabase/migrations/0005_model_no.sql
   supabase/seed.sql
   ```

   (Or via the CLI: `supabase db push` then `psql < supabase/seed.sql`, or
   paste the files into the Studio SQL editor.) `0003` creates the public
   `products` Storage bucket, adds `deleted_at`, and adds the RLS policies
   `/admin` needs to read/write everything as a logged-in user. `0004` adds
   the "fits my product?" fields (`uses`/`not_suitable`/`use_note`). `0005`
   adds `model_no`, the disambiguator for two different products that
   coincidentally share every spec — see "Notes on the data model" below.

3. **Create the 2 admin accounts** in Supabase Dashboard → Authentication →
   Users → Add user (email + password, mark email confirmed). There's no
   signup page — this is the only way in. Both accounts are full admins,
   no separate roles.

4. **Add product photos** — either through `/admin/products/new` (the
   uploader resizes and uploads for you), or manually via Supabase Studio →
   Storage → `products`, naming objects by SKU:
   `DT-F-1000ml-44g/full.webp` + `DT-F-1000ml-44g/thumb.webp` for the first
   photo, `DT-F-1000ml-44g/2-full.webp` + `.../2-thumb.webp` for the second,
   etc. Then set `products.images` (Studio table editor) to the **full**
   paths only, e.g. `{DT-F-1000ml-44g/full.webp,DT-F-1000ml-44g/2-full.webp}`
   — thumbs are derived automatically (`lib/storage.ts`'s `toThumbPath`).
   Until a SKU has images, its pages fall back to a placeholder bottle
   illustration — the site never breaks on missing photos.

5. **Copy the env file** and fill in every value:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to get it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_WHATSAPP_PHONE` | Business WhatsApp number, digits only, country code first (e.g. `213555010203`) |
   | `NEXT_PUBLIC_META_PIXEL_ID` | Meta Events Manager → your Pixel |
   | `META_CAPI_ACCESS_TOKEN` | Meta Events Manager → Pixel → Settings → Conversions API → Generate access token |
   | `META_CAPI_TEST_EVENT_CODE` | Meta Events Manager → Test Events tab (only while testing, remove for prod) |
   | `NEXT_PUBLIC_SITE_URL` | Production domain, used in WhatsApp message links |
   | `REVALIDATE_SECRET` | Any random string — used by `/api/revalidate` |

6. **Run it**

   ```bash
   npm run dev
   ```

   Public site at `/`, admin dashboard at `/admin` (redirects to
   `/admin/login` until you sign in with one of the accounts from step 3).

## How the WhatsApp handoff works

`components/WhatsAppButton.tsx` renders a plain `<a target="_blank">` to
`https://wa.me/<phone>?text=<encoded message>` (see `lib/whatsapp.ts` for the
exact template — it includes the product's top 2 "uses" so the chat opens
with more context). On click, before the tab opens, it:

1. Fires the Meta Pixel `Lead` event client-side (`fbq('track', 'Lead', ...)`).
2. Sends the same event (same `event_id`, for de-duplication) to
   `/api/meta-capi`, which relays it server-side to Meta's Conversions API.
3. Logs the click to the `whatsapp_clicks` Supabase table via
   `/api/log-click`, tagged with the stored UTM params.

Steps 2 and 3 use `navigator.sendBeacon` (falling back to a `keepalive`
fetch, via the shared `lib/beacon.ts` helper) so they aren't cancelled if the
browser tears down the page while opening WhatsApp.

## Tracking product views & finding your best sellers

Every product page logs a view (`components/product/ProductGallery.tsx` →
`/api/log-view` → the `product_views` table) the same way WhatsApp clicks are
logged, tagged with UTM params so you can trace a view back to an ad. There's
no dashboard chart for this — query it straight from the Supabase SQL editor:

```sql
-- Raw views, most recent first
select * from product_views order by created_at desc limit 50;

-- Ranking: views, WhatsApp clicks, and click-through rate per SKU
select * from product_stats;
```

`product_stats` (defined in `0002_storage_and_views.sql`) is a view joining
`product_views` and `whatsapp_clicks` per SKU — it's what answers "which
product is best": high views + high click-through means real buying
interest, not just curiosity.

## Testing Meta Pixel events

1. Set `META_CAPI_TEST_EVENT_CODE` in `.env.local` to the code shown in
   **Meta Events Manager → your Pixel → Test Events**.
2. Run `npm run dev`, open the site, and click through: a category page
   (`ViewCategory`), change a filter and wait ~1s (`Search`), open a product
   (`ViewContent`), scroll to a weight-variant section if the product has one
   (`ViewVariants`), tap a WhatsApp button (`Lead`), tap the footer phone
   number (`Contact`).
3. Each should appear twice in Test Events — once tagged "Browser" (the
   client-side pixel) and once "Server" (the CAPI relay) — with the same
   Event ID, confirming de-duplication is wired correctly.
4. Also check the **Meta Pixel Helper** Chrome extension for the
   browser-side events, and the Network tab for `POST /api/meta-capi` and
   `POST /api/log-click` calls.
5. To verify server-side logging independently of Meta, query
   `select * from whatsapp_clicks order by created_at desc limit 20;` in the
   Supabase SQL editor after a few WhatsApp clicks.

## Admin dashboard (`/admin`)

Built for the business owner to add a product from his phone standing next
to a machine, no help needed — simple fields with Arabic help text up front,
everything else tucked behind a closed "▸ إعدادات متقدمة" section.

- **Auth**: `middleware.ts` + `lib/supabase/middleware.ts` gate every
  `/admin/*` route (redirect to `/admin/login` if not signed in). No signup
  page — accounts are created manually in the Supabase dashboard (step 3
  above). Login is a Server Action (`app/admin/login/actions.ts`); the
  dashboard layout (`app/admin/(dashboard)/layout.tsx`) double-checks the
  session server-side too.
- **`/admin`** — 30-day WhatsApp click total + top SKUs, and a "needs
  attention" box (missing photos / missing carton count / missing weight
  link) that links straight into a filtered product list.
- **`/admin/products`** — search + category/status filters over every
  product (drafts included). Row menu: تعديل (edit) · نسخ (duplicate,
  `?duplicate=<id>`) · إخفاء/إظهار (toggle `is_active` — never a hard
  delete; `deleted_at` exists in the schema for future use but nothing
  writes to it yet).
- **`/admin/products/new` / `/admin/products/[id]`** — both render
  `components/admin/ProductForm.tsx`. As you type category/cap/volume/
  weight, `sku` / `variant_group` / `family_group` regenerate live
  (`lib/admin/sku.ts`) and show which existing products already share each
  group as small chips; the real public `ProductCard` renders beside the
  form (`pointer-events-none`, so its WhatsApp button/link are inert) as a
  live "معاينة". The simple section also has tag-input fields for
  الاستعمالات (uses) / غير مناسبة لـ (not suitable) / ملاحظة تقنية (use
  note), with category-based quick-add suggestions so the owner taps
  instead of typing. Two buttons — حفظ كمسودة (`is_active=false`) / حفظ
  ونشر (`true`) — both call the `saveProduct` Server Action, which
  validates with Zod (`lib/admin/product-schema.ts`, every message in
  Arabic, duplicate SKU → "هذا المنتج موجود من قبل"), writes the row, and
  calls the same `revalidateProduct()` helper the public-site webhook uses
  — the site updates in ~2 seconds, no separate publish step.
  If a save collides with an existing product sharing every spec (same
  category/cap/volume/weight), `saveProduct` auto-retries with an
  incremented `model_no` instead of failing — see "Notes on the data
  model" below.
- **Photos**: `components/admin/ImageUploader.tsx` resizes in-browser
  (`lib/admin/resize-image.ts`: canvas + `createImageBitmap`, full ≤1200px
  webp q0.82, thumb ≤400px webp q0.80 — Supabase's own image transforms are
  a paid feature) before uploading straight from the browser to the
  `products` Storage bucket. Reordering uses move-forward/back buttons
  (44px tap targets) rather than literal drag-and-drop, since HTML5 DnD
  doesn't work reliably by touch on a phone — desktop mouse users also get
  native `draggable` as a bonus.
- **`/admin/analytics`** — WhatsApp clicks grouped by SKU / source / UTM
  campaign, 7/30/90-day range switcher. Plain tables only, no charts.

## Keeping the live site in sync with edits

Every public page uses `revalidate = 3600` (ISR), but in practice edits go
live almost immediately: every `/admin` save calls `revalidateProduct()`
directly (see above). The webhook path below is only needed if you ever
write to `products` a different way (e.g. editing a row directly in
Supabase Studio's table editor, which doesn't go through the admin app).

Wire a **Database Webhook** (Database → Webhooks) on `products` for
INSERT/UPDATE that POSTs to `https://<your-domain>/api/revalidate` with
header `x-revalidate-secret: <REVALIDATE_SECRET>` and body
`{"sku": "...", "category_id": "..."}`. The same underlying logic
(`lib/revalidate.ts`) is what both `/admin`'s Server Actions and the
`saveProduct()` helper in `app/actions.ts` call.

## Project structure

```
app/
  page.tsx                 Home
  c/[category]/page.tsx    Category grid + client-side filters
  p/[sku]/page.tsx         Product detail: gallery, uses, variants, sticky WhatsApp bar
  about/  contact/         Static pages
  api/meta-capi/route.ts   Conversions API relay
  api/log-click/route.ts   whatsapp_clicks logger
  api/log-view/route.ts    product_views logger
  api/revalidate/route.ts  Webhook target for Supabase → ISR revalidation
  admin/
    login/                 Login page (Server Action) — outside the nav layout
    (dashboard)/           Everything below shares layout.tsx (nav + session check)
      page.tsx              /admin — overview
      products/              list, new, [id], Server Actions
      analytics/              /admin/analytics
middleware.ts              Gates /admin/* — redirects to /admin/login
components/                Public UI + tracking logic
components/product/         The 10 components that make up the product detail page
components/admin/          Admin-only UI (nav, product form, image uploader, toast)
lib/                       Supabase access, WhatsApp template, variant logic,
                            Storage URL builder, Pixel helpers, beacon helper
lib/admin/                 Admin data access, Zod schema, sku/slug generation,
                            in-browser image resize
lib/supabase/               server.ts (public, anon), client.ts / server-auth.ts /
                            middleware.ts (admin, session-aware)
supabase/
  migrations/0001_init.sql               Schema, indexes, RLS, variant/family trigger
  migrations/0002_storage_and_views.sql  product-images bucket (legacy), product_views, product_stats
  migrations/0003_admin.sql              deleted_at, authenticated RLS, products Storage bucket
  migrations/0004_uses.sql               uses / not_suitable / use_note columns
  migrations/0005_model_no.sql           model_no disambiguator + updated grouping trigger
  seed.sql                               Categories + the 11 DT SKUs
```

## Notes on the data model

- `variant_group` / `family_group` are computed automatically by a Postgres
  trigger (`set_product_groups`) on insert/update — never set them by hand.
- **Weight variants** (`variant_group`): same category + cap + volume,
  different weight — "can I pay less per unit?". Shown first on the product
  page, hidden if the product has no siblings.
- **Volume family** (`family_group`): same category + cap, different
  volumes — "do you have other sizes?". Deduplicated by volume, linking to
  whichever weight variant is closest to the current product; hidden if
  fewer than 2 distinct volumes exist.
- **`model_no`** (default `1`, omitted from `sku`/`variant_group`/
  `family_group` when it's `1`): disambiguates two genuinely different
  products (different recipe/content) that happen to share every other
  spec — e.g. two vinegar products in the same bottle. Without it, they'd
  incorrectly get grouped as weight/volume variants of each other. You
  almost never need to touch this yourself — `saveProduct` bumps it
  automatically on a same-specs collision.
- **`uses` / `not_suitable` / `use_note`**: what the buyer can (and can't)
  fill this bottle with — the biggest buying signal on the page, since
  buyers fill these bottles with their own liquid. Rendered by
  `components/product/UsesSection.tsx`.

## Deploy

Push to a Git repo and import into Vercel. Add all variables from
`.env.example` in Vercel's Project Settings → Environment Variables, then
set the same Database Webhook target to your production domain.
