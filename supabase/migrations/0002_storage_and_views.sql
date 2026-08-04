-- Product photo storage (replaces Cloudinary) + view/click analytics.

-- Storage: one public bucket for product photos, named by SKU
-- (e.g. 'DT-F-1000ml-44g/1.jpg'). products.images stores these object paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select to anon using (bucket_id = 'product-images');

-- Product page views — same shape/RLS pattern as whatsapp_clicks, so the
-- funnel (views -> clicks) can be queried together.
create table product_views (
  id           bigserial primary key,
  product_id   uuid references products(id),
  sku          text not null,
  category_id  text,
  utm_source   text,
  utm_campaign text,
  utm_content  text,
  created_at   timestamptz default now()
);

create index on product_views (sku);
create index on product_views (created_at);

alter table product_views enable row level security;

create policy "public insert views" on product_views
  for insert to anon with check (true);

-- "Which product is best" — views + WhatsApp click-through per SKU, queryable
-- straight from Supabase Studio (Table Editor lists views alongside tables).
create or replace view product_stats as
select
  p.sku,
  p.name_ar,
  p.category_id,
  count(distinct pv.id) as views,
  count(distinct wc.id) as whatsapp_clicks,
  round(
    count(distinct wc.id)::numeric
    / nullif(count(distinct pv.id), 0) * 100, 1
  ) as click_through_rate_pct
from products p
left join product_views pv on pv.sku = p.sku
left join whatsapp_clicks wc on wc.sku = p.sku
group by p.sku, p.name_ar, p.category_id
order by views desc;
