import { NextRequest, NextResponse } from "next/server";
import { calculateShipping } from "@/lib/printify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lineItems, country, region, zip } = body;

    if (!lineItems?.length || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rates = await calculateShipping(lineItems, {
      country,
      region: region || "",
      zip: zip || "",
    });

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    // Fallback to flat rate if Printify shipping calc fails
    return NextResponse.json({
      standard: 499,
      express: 1299,
    });
  }
}
