import { NextResponse } from "next/server";
import { getProducts } from "@/lib/printify";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
