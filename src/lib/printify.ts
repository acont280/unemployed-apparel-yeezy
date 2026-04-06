import { PrintifyProduct, Product, Variant, ProductOption } from "@/types/printify";

const PRINTIFY_BASE = "https://api.printify.com/v1";
const SHOP_ID = process.env.PRINTIFY_SHOP_ID!;
const TOKEN = process.env.PRINTIFY_API_TOKEN!;

async function printifyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${PRINTIFY_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "UnemployedApparel/1.0",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printify API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── Normalize a Printify product into our frontend shape ───

function normalizeProduct(p: PrintifyProduct): Product {
  const enabledVariants = p.variants.filter((v) => v.is_enabled);
  const lowestPrice = enabledVariants.length
    ? Math.min(...enabledVariants.map((v) => v.price))
    : 0;

  const images = p.images
    .filter((img) => img.is_selected_for_publishing)
    .map((img) => img.src);

  // Fallback: if no images selected for publishing, use all
  const finalImages = images.length
    ? images
    : p.images.map((img) => img.src);

  const variants: Variant[] = enabledVariants.map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku,
    price: v.price,
    isEnabled: v.is_enabled,
    isAvailable: v.is_available,
  }));

  const options: ProductOption[] = p.options.map((o) => ({
    name: o.name,
    values: o.values.map((v) => v.title),
  }));

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    tags: p.tags,
    price: lowestPrice,
    images: finalImages,
    variants,
    options,
  };
}

// ─── Public API ───

export async function getProducts(): Promise<Product[]> {
  // Printify returns paginated results; fetch all pages
  let page = 1;
  const allProducts: PrintifyProduct[] = [];

  while (true) {
    const data = await printifyFetch<{
      current_page: number;
      last_page: number;
      data: PrintifyProduct[];
    }>(`/shops/${SHOP_ID}/products.json?page=${page}`);

    allProducts.push(...data.data);

    if (data.current_page >= data.last_page) break;
    page++;
  }

  // Return all products that have enabled variants
  return allProducts
    .map(normalizeProduct)
    .filter((p) => p.variants.length > 0);
}

export async function getProduct(productId: string): Promise<Product> {
  const data = await printifyFetch<PrintifyProduct>(
    `/shops/${SHOP_ID}/products/${productId}.json`
  );
  return normalizeProduct(data);
}

export async function getProductRaw(productId: string): Promise<PrintifyProduct> {
  return printifyFetch<PrintifyProduct>(
    `/shops/${SHOP_ID}/products/${productId}.json`
  );
}

// ─── Order creation (Phase 5) ───

interface PrintifyOrderLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

interface PrintifyOrderAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export async function createOrder(
  externalId: string,
  lineItems: PrintifyOrderLineItem[],
  address: PrintifyOrderAddress
) {
  return printifyFetch(`/shops/${SHOP_ID}/orders.json`, {
    method: "POST",
    body: JSON.stringify({
      external_id: externalId,
      label: `Order ${externalId}`,
      line_items: lineItems,
      shipping_method: 1, // standard
      send_shipping_notification: true,
      address_to: address,
    }),
  });
}

// ─── Shipping cost calculation ───

export async function calculateShipping(
  lineItems: PrintifyOrderLineItem[],
  address: { country: string; region: string; zip: string }
) {
  return printifyFetch<{ standard: number; express: number; economy?: number }>(
    `/shops/${SHOP_ID}/orders/shipping.json`,
    {
      method: "POST",
      body: JSON.stringify({
        line_items: lineItems,
        address_to: {
          country: address.country,
          region: address.region,
          zip: address.zip,
        },
      }),
    }
  );
}
