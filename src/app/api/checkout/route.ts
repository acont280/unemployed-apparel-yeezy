import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/printify";

interface CheckoutItem {
  productId: string;
  variantId: number;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      shippingCost,
      discountAmount,
      discountCode,
      customerEmail,
    }: {
      items: CheckoutItem[];
      shippingCost: number;
      discountAmount: number;
      discountCode: string;
      customerEmail?: string;
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    // Verify prices server-side against Printify
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await getProduct(item.productId);
        const variant = product.variants.find((v) => v.id === item.variantId);
        const verifiedPrice = variant?.price ?? item.price;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title,
              description: item.variantTitle,
              images: item.image ? [item.image] : [],
              metadata: {
                productId: item.productId,
                variantId: item.variantId.toString(),
              },
            },
            unit_amount: verifiedPrice,
          },
          quantity: item.quantity,
        };
      })
    );

    // Add shipping as a line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
            images: [],
            metadata: {},
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    // Build Stripe checkout session
    const sessionParams: Record<string, unknown> = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          }))
        ),
        discountCode: discountCode || "",
        discountAmount: discountAmount?.toString() || "0",
      },
      automatic_tax: { enabled: false },
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Apply discount
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: "usd",
        duration: "once",
        name: discountCode || "Discount",
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
