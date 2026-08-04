-- ILYA PLAST catalog schema
-- Run against a fresh Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto;

create table categories (
  id          text primary key,        -- 'DT','MED','ALI','COS'
  name_ar     text not null,
  name_fr     text,
  icon        text,
  sort_order  int default 0
);

create table products (
  id             uuid primary key default gen_random_uuid(),
  sku            text unique not null,   -- 'DT-F-1000ml-44g'
  category_id    text references categories(id),
  name_ar        text not null,
  name_fr        text,
  volume_ml      int not null,
  weight_g       numeric not null,
  cap_type       text not null,          -- 'F','P','S2','S3','S4'
  cap_label_ar   text,                   -- 'فليب أحمر'
  neck_mm        int,
  material       text default 'PET',     -- 'PET' | 'HDPE'
  units_per_box  int,
  min_order_qty  int default 5000,
  colors         text[],
  images         text[],                 -- Cloudinary public_ids
  variant_group  text,                   -- links WEIGHTS: 'DT-F-1000ml'
  family_group   text,                   -- links VOLUMES: 'DT-F'
  sort_order     int default 0,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

create index on products (category_id, volume_ml);
create index on products (variant_group);
create index on products (family_group);

create table whatsapp_clicks (
  id           bigserial primary key,
  sku          text,
  category_id  text,
  source       text,      -- 'card' | 'product_page' | 'header' | 'home_cta'
  utm_source   text,
  utm_campaign text,
  utm_content  text,
  created_at   timestamptz default now()
);

-- Auto-generate variant_group / family_group on every insert or relevant update,
-- so Supabase Studio edits (or any future admin tool) never have to compute them by hand.
create or replace function set_product_groups()
returns trigger as $$
begin
  new.variant_group := new.category_id || '-' || new.cap_type || '-' || new.volume_ml || 'ml';
  new.family_group  := new.category_id || '-' || new.cap_type;
  return new;
end;
$$ language plpgsql;

create trigger trg_products_set_groups
before insert or update of category_id, cap_type, volume_ml on products
for each row execute function set_product_groups();

-- RLS
alter table products   enable row level security;
alter table categories enable row level security;
alter table whatsapp_clicks enable row level security;

create policy "public read products" on products
  for select to anon using (is_active = true);
create policy "public read categories" on categories
  for select to anon using (true);
create policy "public insert clicks" on whatsapp_clicks
  for insert to anon with check (true);
