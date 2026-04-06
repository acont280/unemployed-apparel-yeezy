import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

interface CheckoutItem {
  productId: string;
  variantId: number;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingCost, customerEmail }: {
      items: CheckoutItem[];
      shippingCost: number;
      customerEmail?: string;
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const lineItems: LineItem[] = [];

    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.variantTitle,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      });
    }

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    const sessionConfig: Record<string, unknown> = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      success_url: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002") + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002") + "/checkout",
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          }))
        ),
      },
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(
      sessionConfig as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
