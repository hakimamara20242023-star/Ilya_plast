-- "Fits my product?" info on the product page — the buyer fills these
-- bottles with their own liquid, so knowing what it's suitable (and not
-- suitable) for is a bigger buying signal than any spec row.

alter table products add column if not exists uses text[] default '{}';
alter table products add column if not exists not_suitable text[] default '{}';
alter table products add column if not exists use_note text;
