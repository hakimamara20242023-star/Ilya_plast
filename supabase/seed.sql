-- Seed data for ILYA PLAST catalog.
-- Run after 0001_init.sql. variant_group / family_group are filled by the
-- trg_products_set_groups trigger — do not set them by hand.

insert into categories (id, name_ar, name_fr, icon, sort_order) values
  ('DT',  'منظفات', 'Détergents',  '🧴', 1),
  ('MED', 'طبي',    'Médical',     '🏥', 2),
  ('ALI', 'غذائي',  'Alimentaire', '🍶', 3),
  ('COS', 'تجميل',  'Cosmétique',  '💄', 4),
  ('VEN', 'خل',  'vinaigre',  '🫙', 5)
on conflict (id) do nothing;

-- DT (منظفات) — 11 real SKUs.
-- Weight variants (same volume, different weight, same cap): the 1000ml/F trio.
-- Volume family (same cap, different volumes): F (1L/2L/3L) and S4 (3L/5L) and P (400ml/500ml).
insert into products
  (sku, category_id, name_ar, name_fr, volume_ml, weight_g, cap_type, cap_label_ar, neck_mm, material, units_per_box, colors, images, sort_order)
values
  ('DT-F-1000ml-38g',  'DT', 'قارورة منظفات فليب 1 لتر',       'Bidon détergent bouchon flip 1L',  1000, 38, 'F',  'سدادة فليب',      28, 'PET', 48,  array['شفاف'], array[]::text[], 10),
  ('DT-F-1000ml-44g',  'DT', 'قارورة منظفات فليب 1 لتر',       'Bidon détergent bouchon flip 1L',  1000, 44, 'F',  'سدادة فليب',      28, 'PET', 48,  array['شفاف'], array[]::text[], 11),
  ('DT-F-1000ml-50g',  'DT', 'قارورة منظفات فليب 1 لتر',       'Bidon détergent bouchon flip 1L',  1000, 50, 'F',  'سدادة فليب',      28, 'PET', 48,  array['شفاف'], array[]::text[], 12),
  ('DT-F-2000ml-85g',  'DT', 'قارورة منظفات فليب 2 لتر',       'Bidon détergent bouchon flip 2L',  2000, 85, 'F',  'سدادة فليب',      28, 'PET', 24,  array['شفاف'], array[]::text[], 20),
  ('DT-F-3000ml-95g',  'DT', 'قارورة منظفات فليب 3 لتر',       'Bidon détergent bouchon flip 3L',  3000, 95, 'F',  'سدادة فليب',      32, 'PET', 16,  array['شفاف'], array[]::text[], 30),
  ('DT-P-400ml-28g',   'DT', 'قارورة منظفات بيستوليه 400 مل',  'Bidon détergent pistolet 400ml',   400,  28, 'P',  'بيستوليه',        24, 'PET', 100, array['شفاف'], array[]::text[], 40),
  ('DT-P-500ml-28g',   'DT', 'قارورة منظفات بومبة 500 مل',     'Bidon détergent pompe 500ml',      500,  28, 'P',  'بومبة',           24, 'PET', 80,  array['شفاف'], array[]::text[], 41),
  ('DT-S2-1000ml-28g', 'DT', 'قارورة منظفات سدادة عادية 1 لتر','Bidon détergent bouchon simple 1L',1000, 28, 'S2', 'سدادة عادية',     28, 'PET', 48,  array['شفاف'], array[]::text[], 50),
  ('DT-S3-1250ml-50g', 'DT', 'قارورة منظفات سدادة عادية 1.25 لتر','Bidon détergent bouchon simple 1.25L',1250, 50, 'S3', 'سدادة عادية', 28, 'PET', 40,  array['شفاف'], array[]::text[], 51),
  ('DT-S4-3000ml-85g', 'DT', 'قارورة منظفات سدادة عادية 3 لتر','Bidon détergent bouchon simple 3L',3000, 85, 'S4', 'سدادة عادية',     32, 'PET', 16,  array['شفاف'], array[]::text[], 60),
  ('DT-S4-5000ml-95g', 'DT', 'قارورة منظفات سدادة عادية 5 لتر','Bidon détergent bouchon simple 5L',5000, 95, 'S4', 'سدادة عادية',     38, 'PET', 8,   array['شفاف'], array[]::text[], 61)
on conflict (sku) do nothing;

-- "Fits my product?" info — what each bottle is (and isn't) suited for.
-- All 11 DT SKUs are PET, so they share the same not_suitable/use_note.
update products set
  not_suitable = array['المذيبات القوية', 'الأحماض المركزة'],
  use_note = 'للجافيل المركز ننصح بقوارير HDPE'
where category_id = 'DT';

update products set uses = array['🪟 منظف زجاج', '🧽 منظف متعدد الاستعمالات', '🚗 منظف داخلية السيارة']
  where sku = 'DT-P-400ml-28g';
update products set uses = array['🖐️ صابون سائل لليدين', '🧼 جل مطهر', '🧴 شامبو']
  where sku = 'DT-P-500ml-28g';
update products set uses = array['🧴 سائل أطباق', '🧹 منظف أرضيات']
  where sku = 'DT-F-1000ml-38g';
update products set uses = array['🧴 سائل غسل الأطباق', '🧹 منظف الأرضيات', '🪟 منظف الزجاج']
  where sku = 'DT-F-1000ml-44g';
update products set uses = array['🧴 سائل أطباق', '🧹 منظف أرضيات']
  where sku = 'DT-F-1000ml-50g';
update products set uses = array['💧 جافيل مخفف', '🧽 منظف عام']
  where sku = 'DT-S2-1000ml-28g';
update products set uses = array['🧴 سائل أطباق', '🧹 منظف أرضيات']
  where sku = 'DT-S3-1250ml-50g';
update products set uses = array['🧹 منظف أرضيات', '🧽 منظف متعدد الاستعمالات']
  where sku = 'DT-F-2000ml-85g';
update products set uses = array['🧹 منظف أرضيات', '💧 جافيل مخفف']
  where sku = 'DT-F-3000ml-95g';
update products set uses = array['🧹 منظف أرضيات', '💧 جافيل', '🏭 استعمال مهني']
  where sku = 'DT-S4-3000ml-85g';
update products set uses = array['💧 جافيل', '🧹 منظف أرضيات', '🏨 فنادق ومطاعم']
  where sku = 'DT-S4-5000ml-95g';
