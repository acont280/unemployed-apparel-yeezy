import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="font-mono text-xs tracking-[0.3em] text-muted">404</p>
      <Link
        href="/"
        className="mt-6 font-mono text-[10px] tracking-[0.3em] text-muted hover:text-ink transition-colors"
      >
        ← BACK
      </Link>
    </div>
  );
}
