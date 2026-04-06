"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 sm:px-10 h-14">
          {/* Logo — just text */}
          <Link href="/" className="font-mono text-xs tracking-[0.35em] text-ink">
            UNEMPLOYED
          </Link>

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="font-mono text-xs tracking-widest text-muted hover:text-ink transition-colors"
            aria-label="Open cart"
          >
            BAG{totalItems > 0 && ` (${totalItems})`}
          </button>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
