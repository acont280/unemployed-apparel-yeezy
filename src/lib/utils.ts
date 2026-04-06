/**
 * Format cents to USD string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Strip HTML tags from Printify product descriptions
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
