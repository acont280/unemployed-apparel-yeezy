import { getProduct, getProducts } from "@/lib/printify";
import { ProductDetail } from "@/components/ProductDetail";
import { notFound } from "next/navigation";

export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    return {
      title: `${product.title} — UNEMPLOYED`,
      description: product.description.replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return { title: "UNEMPLOYED" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;

  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  return <ProductDetail product={product} />;
}
