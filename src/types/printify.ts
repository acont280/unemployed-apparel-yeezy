// ─── Printify API response types ───

export interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
  is_selected_for_publishing: boolean;
}

export interface PrintifyVariant {
  id: number;
  sku: string;
  cost: number;
  price: number;
  title: string;
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  is_printify_express_eligible?: boolean;
  options: number[];
}

export interface PrintifyOption {
  name: string;
  type: string;
  values: { id: number; title: string }[];
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: PrintifyOption[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: unknown[];
  sales_channel_properties: unknown[];
}

// ─── Normalized types for our frontend ───

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price: number; // lowest enabled variant price in cents
  images: string[]; // src URLs
  variants: Variant[];
  options: ProductOption[];
}

export interface Variant {
  id: number;
  title: string;
  sku: string;
  price: number; // cents
  isEnabled: boolean;
  isAvailable: boolean;
}

export interface ProductOption {
  name: string;
  values: string[];
}
