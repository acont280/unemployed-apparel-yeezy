"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/printify";
import { formatPrice } from "@/lib/utils";

export function HomeCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrent(index);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") scrollTo(current + 1);
      if (e.key === "ArrowLeft") scrollTo(current - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current]);

  const scrollTo = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    if (index < 0 || index >= products.length) return;
    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
  };

  return (
    <div className="relative h-[calc(100vh-56px)]">
      <div ref={scrollRef} className="flex h-full overflow-x-auto snap-container hide-scrollbar">
        {products.map((product, i) => (
          <Link key={product.id} href={"/products/" + product.id}
            className="snap-item flex-shrink-0 w-screen h-full relative flex items-center justify-center group">
            <div className="relative w-[55vw] h-[55vh] sm:w-[40vw] sm:h-[65vh]">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.title} fill
                  className="object-contain group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  sizes="55vw" priority={i < 2} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-mono text-xs text-muted">NO IMAGE</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-12 left-0 right-0 flex justify-between items-end px-8 sm:px-16">
              <p className="font-mono text-xs sm:text-sm tracking-[0.2em] text-ink">{product.title.toUpperCase()}</p>
              <p className="font-mono text-xs sm:text-sm text-ink">{formatPrice(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
      {products.length > 1 && current > 0 && (
        <button onClick={() => scrollTo(current - 1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-2xl text-muted hover:text-ink transition-colors">&larr;</button>
      )}
      {products.length > 1 && current < products.length - 1 && (
        <button onClick={() => scrollTo(current + 1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-2xl text-muted hover:text-ink transition-colors">&rarr;</button>
      )}
      {products.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {products.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)}
              className={"w-1.5 h-1.5 rounded-full transition-all duration-300 " + (i === current ? "bg-ink w-6" : "bg-ink/20")} />
          ))}
        </div>
      )}
    </div>
  );
}
