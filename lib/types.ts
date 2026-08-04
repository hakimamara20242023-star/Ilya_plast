export interface Category {
  id: string;
  name_ar: string;
  name_fr: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  sku: string;
  category_id: string;
  name_ar: string;
  name_fr: string | null;
  volume_ml: number;
  weight_g: number;
  cap_type: string;
  cap_label_ar: string | null;
  neck_mm: number | null;
  material: string;
  units_per_box: number | null;
  min_order_qty: number;
  colors: string[] | null;
  images: string[] | null;
  variant_group: string | null;
  family_group: string | null;
  model_no: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  uses: string[] | null;
  not_suitable: string[] | null;
  use_note: string | null;
}

export type WhatsAppSource = "card" | "product_page" | "header" | "home_cta";
