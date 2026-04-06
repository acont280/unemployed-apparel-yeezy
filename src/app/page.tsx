import { getProducts } from "@/lib/printify";
import { HomeCarousel } from "@/components/HomeCarousel";

export const revalidate = 0;

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let error = false;

  try {
    products = await getProducts();
const firstId = "69d1964e86370ef9d40fc0b2";
products.sort((a, b) => (a.id === firstId ? -1 : b.id === firstId ? 1 : 0));
  } catch (e) {
    console.error("Failed to fetch products:", e);
    error = true;
    products = [];
  }

  return (
    <div className="pt-14">
      {error ? (
        <div className="h-[calc(100vh-56px)] flex items-center justify-center">
          <p className="font-mono text-xs text-muted tracking-widest">
            COULD NOT LOAD PRODUCTS
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="h-[calc(100vh-56px)] flex items-center justify-center">
          <p className="font-mono text-xs text-muted tracking-widest">
            NO PRODUCTS
          </p>
        </div>
      ) : (
        <HomeCarousel products={products} />
      )}
    </div>
  );
}
