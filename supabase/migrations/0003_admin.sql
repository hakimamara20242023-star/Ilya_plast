-- Admin dashboard: soft-delete column, authenticated (logged-in admin) RLS,
-- and the product photo storage bucket used by the admin uploader.
--
-- Two Supabase Auth users (the developer + the business owner) are created
-- manually in the Supabase dashboard (Authentication -> Users) — there is no
-- signup page. Both are full admins; there are no separate roles.

alter table products add column if not exists deleted_at timestamptz;

-- The public site's existing policies are scoped `to anon` only. A logged-in
-- admin's requests run as the `authenticated` role, which needs its own
-- policies to read/write anything (drafts, hidden products, analytics).
create policy "authenticated read all products" on products
  for select to authenticated using (true);

create policy "authenticated insert products" on products
  for insert to authenticated with check (true);

create policy "authenticated update products" on products
  for update to authenticated using (true) with check (true);

create policy "authenticated read categories" on categories
  for select to authenticated using (true);

create policy "authenticated read whatsapp clicks" on whatsapp_clicks
  for select to authenticated using (true);

create policy "authenticated read product views" on product_views
  for select to authenticated using (true);

-- Product photos: bucket renamed from 'product-images' to 'products', with
-- the admin uploader's full/thumb naming convention. The old bucket was
-- never populated; Supabase blocks direct SQL deletes on storage.buckets
-- (must go through the Storage API/dashboard), so it's left orphaned —
-- harmless, and nothing in the app references it anymore.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;

create policy "public read products bucket" on storage.objects
  for select using (bucket_id = 'products');

create policy "authenticated write products bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'products');

create policy "authenticated update products bucket" on storage.objects
  for update to authenticated using (bucket_id = 'products');

create policy "authenticated delete products bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'products');
