-- Fixes weight/volume variant grouping incorrectly merging (or failing to
-- link) products that coincidentally share category+cap+volume but are
-- genuinely different products (different recipe/content). Adds an
-- explicit disambiguator instead of relying on hand-typed SKU suffixes,
-- which nothing previously read.

alter table products add column if not exists model_no int not null default 1;

-- model_no = 1 (the overwhelming common case) is omitted from both
-- generated columns, so every existing product's grouping is unaffected.
create or replace function set_product_groups()
returns trigger as $$
begin
  new.variant_group := new.category_id || '-' || new.cap_type || '-' || new.volume_ml || 'ml'
    || case when new.model_no = 1 then '' else '-' || new.model_no end;
  new.family_group := new.category_id || '-' || new.cap_type
    || case when new.model_no = 1 then '' else '-' || new.model_no end;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_set_groups on products;
create trigger trg_products_set_groups
before insert or update of category_id, cap_type, volume_ml, model_no on products
for each row execute function set_product_groups();

-- One-time backfill so existing rows reflect the new formula immediately
-- rather than waiting for their next edit (no-op in practice: every
-- existing row is model_no = 1).
update products set
  variant_group = category_id || '-' || cap_type || '-' || volume_ml || 'ml'
    || case when model_no = 1 then '' else '-' || model_no end,
  family_group = category_id || '-' || cap_type
    || case when model_no = 1 then '' else '-' || model_no end;
