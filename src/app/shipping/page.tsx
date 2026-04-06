export const metadata = { title: "Shipping and Returns — Unemployed Apparel" };

export default function ShippingPage() {
  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-lg mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-mono text-sm tracking-[0.2em] mb-8">SHIPPING AND RETURNS</h1>
        <div className="space-y-6 text-xs leading-relaxed text-ink/70">
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">PRODUCTION TIME</h2><p>All items are custom printed to order. Production typically takes 2-3 business days.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">SHIPPING OPTIONS</h2><p>Standard Shipping: 5-12 business days after production, $4.99. Express Shipping: 2-5 business days after production, $12.99.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">ORDER TRACKING</h2><p>Once your order ships, you will receive a shipping confirmation email with a tracking number.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">SHIPPING DESTINATIONS</h2><p>We currently ship to the United States, Canada, United Kingdom, and Australia.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">RETURNS AND EXCHANGES</h2><p>Because every item is custom printed specifically for your order, all sales are final. We do not accept returns or exchanges. Please double-check your size and personalization details before purchasing.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">DAMAGED OR DEFECTIVE ITEMS</h2><p>If you receive a damaged or defective item, contact us within 7 days of delivery at support@officialunemployedapparel.com with your order number and photos. We will reprint and reship or issue a refund at our discretion.</p></div>
          <div><h2 className="font-mono text-[10px] tracking-[0.3em] text-ink mb-2">CONTACT</h2><p>For shipping questions, reach us at support@officialunemployedapparel.com.</p></div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}
