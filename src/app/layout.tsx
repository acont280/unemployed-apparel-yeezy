import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/Header";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "UNEMPLOYED",
  description: "Apparel for the professionally idle.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-faint px-6 sm:px-10 py-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted">&copy; 2026 UNEMPLOYED APPAREL</p>
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <Link href="/shipping" className="font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink transition-colors">SHIPPING & RETURNS</Link>
                <Link href="/privacy" className="font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink transition-colors">PRIVACY</Link>
                <Link href="/terms" className="font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink transition-colors">TERMS</Link>
                <Link href="/contact" className="font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink transition-colors">CONTACT</Link>
              </nav>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
