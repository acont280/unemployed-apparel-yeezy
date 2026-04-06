"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (sessionId && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, clearCart, cleared]);

  return (
    <div className="pt-14 min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-ink text-surface flex items-center justify-center mx-auto mb-6 font-mono text-lg">
          ✓
        </div>
        <h1 className="font-mono text-sm tracking-[0.2em] mb-4">
          ORDER CONFIRMED
        </h1>
        <p className="text-xs text-muted leading-relaxed mb-2">
          Thank you for your order. You will receive a confirmation email
          shortly with your order details and tracking information.
        </p>
        <p className="font-mono text-[10px] text-muted mb-8">
          Estimated delivery: 5-12 business days
        </p>
        <Link
          href="/"
          className="inline-block bg-ink text-surface font-mono text-[10px] tracking-[0.3em] px-8 py-3 hover:bg-black transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
