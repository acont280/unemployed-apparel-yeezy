"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/printify";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const sortedVariants = [...product.variants].sort((a, b) => {
    const getSize = (title: string) => {
      const sizes = ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"];
      const parts = title.split(" / ");
      for (const p of parts) { if (sizes.includes(p.trim())) return p.trim(); }
      return parts[parts.length - 1].trim();
    };
    const aIdx = sizeOrder.indexOf(getSize(a.title));
    const bIdx = sizeOrder.indexOf(getSize(b.title));
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const [selectedVariant, setSelectedVariant] = useState(
    sortedVariants.find((v) => v.isAvailable) ?? sortedVariants[0]
  );
  const [currentImage, setCurrentImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const { addItem } = useCart();
  const imageScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = imageScrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      setCurrentImage(Math.round(container.scrollLeft / container.offsetWidth));
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToImage = (index: number) => {
    const container = imageScrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
  };

  const handleAdd = () => {
    if (!note.trim()) {
      setNoteError(true);
      return;
    }
    setNoteError(false);
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      image: product.images[0] ?? "",
      note: note.trim(),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const displaySize = (title: string) => {
    const sizes = ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"];
    const parts = title.split(" / ");
    for (const p of parts) { if (sizes.includes(p.trim())) return p.trim(); }
    return parts[0];
  };

  return (
    <div className="pt-14 min-h-screen">
      <div className="px-6 sm:px-10 py-4">
        <Link href="/" className="font-mono text-[10px] tracking-[0.3em] text-muted hover:text-ink transition-colors">BACK</Link>
      </div>
      <div className="relative">
        <div ref={imageScrollRef} className="flex overflow-x-auto snap-container hide-scrollbar">
          {product.images.length > 0 ? (
            product.images.map((img, i) => (
              <div key={i} className="snap-item flex-shrink-0 w-screen flex items-center justify-center py-4 sm:py-8" style={{ height: "60vh" }}>
                <div className="relative w-[70vw] h-full sm:w-[45vw]">
                  <Image src={img} alt={product.title} fill className="object-contain" sizes="70vw" priority={i === 0} />
                </div>
              </div>
            ))
          ) : (
            <div className="flex-shrink-0 w-screen flex items-center justify-center" style={{ height: "60vh" }}>
              <span className="font-mono text-xs text-muted">NO IMAGE</span>
            </div>
          )}
        </div>
        {product.images.length > 1 && currentImage > 0 && (
          <button onClick={() => scrollToImage(currentImage - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl text-muted hover:text-ink transition-colors">&larr;</button>
        )}
        {product.images.length > 1 && currentImage < product.images.length - 1 && (
          <button onClick={() => scrollToImage(currentImage + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xl text-muted hover:text-ink transition-colors">&rarr;</button>
        )}
        {product.images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-4">
            {product.images.map((_, i) => (
              <button key={i} onClick={() => scrollToImage(i)} className={"w-1 h-1 rounded-full transition-all duration-300 " + (i === currentImage ? "bg-ink w-4" : "bg-ink/15")} />
            ))}
          </div>
        )}
      </div>
      <div className="max-w-lg mx-auto px-6 sm:px-10 py-8 animate-slide-up">
        <div className="flex justify-between items-baseline mb-10">
          <h1 className="font-mono text-sm tracking-[0.2em]">{product.title.toUpperCase()}</h1>
          <span className="font-mono text-sm">{formatPrice(selectedVariant.price)}</span>
        </div>
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">SELECT SIZE</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-px bg-faint">
            {sortedVariants.map((v) => (
              <button key={v.id} onClick={() => v.isAvailable && setSelectedVariant(v)} disabled={!v.isAvailable}
                className={"size-btn py-3 font-mono text-xs tracking-wider " + (v.id === selectedVariant.id ? "bg-ink text-surface" : v.isAvailable ? "bg-surface text-ink hover:bg-faint" : "bg-surface text-ink/15 cursor-not-allowed line-through")}>
                {displaySize(v.title)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">ENTER YOUR CASHAPP/ZELLE/PAYPAL URL</p>
          <p className="font-mono text-[10px] text-muted mb-2">Ex: cash.app/xxxxx</p>
          <input type="text" value={note} onChange={(e) => { setNote(e.target.value); setNoteError(false); }}
            placeholder="cash.app/yourname"
            className={"w-full bg-transparent border px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-ink " + (noteError ? "border-red-500" : "border-faint")} />
          {noteError && <p className="font-mono text-[10px] text-red-500 mt-1">Required to complete your order</p>}
        </div>
        <button onClick={handleAdd} disabled={!selectedVariant.isAvailable}
          className={"w-full py-4 font-mono text-xs tracking-[0.3em] transition-all duration-200 " + (added ? "bg-ink text-surface" : selectedVariant.isAvailable ? "bg-ink text-surface hover:bg-black" : "bg-faint text-muted cursor-not-allowed")}>
          {added ? "ADDED" : selectedVariant.isAvailable ? "ADD TO BAG" : "UNAVAILABLE"}
        </button>
        <div className="mt-12 pt-8 border-t border-faint">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted mb-4">DETAILS</p>
          <div className="text-xs leading-relaxed text-ink/70" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}
