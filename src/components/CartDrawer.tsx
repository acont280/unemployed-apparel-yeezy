"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    isOpen,
    setIsOpen,
  } = useCart();

  useEffect(() => {
    if (isOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-faint z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-faint">
          <span className="font-mono text-xs tracking-[0.3em]">BAG</span>
          <button
            onClick={() => setIsOpen(false)}
            className="font-mono text-xs text-muted hover:text-ink transition-colors"
          >
            CLOSE
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {items.length === 0 ? (
            <p className="font-mono text-xs text-muted text-center pt-20 tracking-widest">
              EMPTY
            </p>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-4">
                <div className="w-20 h-20 relative bg-faint flex-shrink-0">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs tracking-wide truncate">
                    {item.title}
                  </p>
                  <p className="font-mono text-[10px] text-muted mt-1">
                    {item.variantTitle}
                  </p>
                  <p className="font-mono text-xs mt-2">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="font-mono text-xs text-muted hover:text-ink"
                    >
                      −
                    </button>
                    <span className="font-mono text-xs">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="font-mono text-xs text-muted hover:text-ink"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto font-mono text-[10px] text-muted hover:text-ink tracking-widest"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-faint px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted">
                TOTAL
              </span>
              <span className="font-mono text-sm">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              className="w-full bg-ink text-surface font-mono text-xs tracking-[0.3em] py-4 hover:bg-black transition-colors"
              onClick={() => {
                setIsOpen(false);
                router.push("/checkout");
              }}
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
