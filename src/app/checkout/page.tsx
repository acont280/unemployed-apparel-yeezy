"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [email, setEmail] = useState("");
  const [shippingCost, setShippingCost] = useState(499);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = totalPrice;
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingCost,
          discountAmount: 0,
          discountCode: "",
          customerEmail: email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-14 min-h-screen flex flex-col items-center justify-center">
        <p className="font-mono text-xs text-muted tracking-widest">YOUR BAG IS EMPTY</p>
        <Link href="/" className="mt-6 font-mono text-[10px] tracking-[0.3em] text-muted hover:text-ink transition-colors">CONTINUE SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-lg mx-auto px-6 sm:px-10 py-10">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="font-mono text-[10px] tracking-[0.3em] text-muted hover:text-ink transition-colors">BACK</Link>
          <h1 className="font-mono text-xs tracking-[0.3em]">CHECKOUT</h1>
        </div>

        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">ORDER SUMMARY</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="w-14 h-14 relative bg-faint flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs truncate">{item.title}</p>
                  <p className="font-mono text-[10px] text-muted">{item.variantTitle} x {item.quantity}</p>
                </div>
                <p className="font-mono text-xs">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">EMAIL</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
            className="w-full bg-transparent border border-faint px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-ink" />
        </div>

        <div className="mb-6 pb-6 border-b border-faint">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">SHIPPING</p>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer p-3 border border-faint has-[:checked]:border-ink transition-colors">
              <div className="flex items-center gap-3">
                <input type="radio" name="shipping" checked={shippingCost === 499} onChange={() => setShippingCost(499)} className="accent-black" />
                <div>
                  <p className="font-mono text-xs">STANDARD</p>
                  <p className="font-mono text-[10px] text-muted">5-12 business days</p>
                </div>
              </div>
              <span className="font-mono text-xs">$4.99</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 border border-faint has-[:checked]:border-ink transition-colors">
              <div className="flex items-center gap-3">
                <input type="radio" name="shipping" checked={shippingCost === 1299} onChange={() => setShippingCost(1299)} className="accent-black" />
                <div>
                  <p className="font-mono text-xs">EXPRESS</p>
                  <p className="font-mono text-[10px] text-muted">2-5 business days</p>
                </div>
              </div>
              <span className="font-mono text-xs">$12.99</span>
            </label>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <div className="flex justify-between">
            <span className="font-mono text-[10px] tracking-wider text-muted">SUBTOTAL</span>
            <span className="font-mono text-xs">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-[10px] tracking-wider text-muted">SHIPPING</span>
            <span className="font-mono text-xs">{formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-[10px] tracking-wider text-muted">TAX</span>
            <span className="font-mono text-xs text-muted">Calculated at checkout</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-faint">
            <span className="font-mono text-xs font-bold">TOTAL</span>
            <span className="font-mono text-sm font-bold">{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p className="font-mono text-[10px] text-red-600 mb-4">{error}</p>}

        <button onClick={handleCheckout} disabled={loading}
          className="w-full bg-ink text-surface font-mono text-xs tracking-[0.3em] py-4 hover:bg-black transition-colors disabled:opacity-50">
          {loading ? "REDIRECTING TO STRIPE..." : "PAY NOW"}
        </button>

        <p className="font-mono text-[10px] text-muted text-center mt-4">Secure payment via Stripe. Shipping address collected at checkout.</p>
        <div className="h-20" />
      </div>
    </div>
  );
}
