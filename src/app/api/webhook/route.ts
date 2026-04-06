import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";
import { createOrder } from "@/lib/printify";
import { sendOrderConfirmation } from "@/lib/email";
import Stripe from "stripe";

interface OrderItem {
  productId: string;
  variantId: number;
  quantity: number;
  note?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook sig error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const items: OrderItem[] = JSON.parse(session.metadata?.items || "[]");
      const shipping = session.shipping_details;
      const customerEmail = session.customer_details?.email || "";
      const customerName = session.customer_details?.name || "Customer";
      const orderId = "UA-" + Date.now().toString(36).toUpperCase();

      const supabase = createServerClient();
      await supabase.from("orders").insert({
        order_id: orderId,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items,
        subtotal: session.amount_subtotal || 0,
        shipping_cost: session.total_details?.amount_shipping || 0,
        tax: session.total_details?.amount_tax || 0,
        total: session.amount_total || 0,
        shipping_address: shipping?.address ? {
          name: shipping.name,
          address1: shipping.address.line1,
          address2: shipping.address.line2,
          city: shipping.address.city,
          region: shipping.address.state,
          zip: shipping.address.postal_code,
          country: shipping.address.country,
        } : null,
        status: "paid",
      });

      if (shipping?.address) {
        try {
          const printifyItems = items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
          }));

          const nameParts = (shipping.name || "Customer").split(" ");

          await createOrder(orderId, printifyItems, {
            first_name: nameParts[0] || "Customer",
            last_name: nameParts.slice(1).join(" ") || "",
            email: customerEmail,
            country: shipping.address.country || "US",
            region: shipping.address.state || "",
            address1: shipping.address.line1 || "",
            address2: shipping.address.line2 || "",
            city: shipping.address.city || "",
            zip: shipping.address.postal_code || "",
          });

          await supabase
            .from("orders")
            .update({ status: "sent_to_printify" })
            .eq("order_id", orderId);
        } catch (printifyError) {
          console.error("Printify error:", printifyError);
          await supabase
            .from("orders")
            .update({ status: "printify_failed" })
            .eq("order_id", orderId);
        }
      }

      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const emailItems = lineItems.data
          .filter((li) => li.description !== "Shipping")
          .map((li) => ({
            title: li.description || "Item",
            variant: "",
            quantity: li.quantity || 1,
            price: li.amount_total || 0,
          }));

        await sendOrderConfirmation({
          customerEmail,
          customerName,
          orderId,
          items: emailItems,
          subtotal: session.amount_subtotal || 0,
          shipping: session.total_details?.amount_shipping || 0,
          total: session.amount_total || 0,
          shippingAddress: {
            address1: shipping?.address?.line1 || "",
            city: shipping?.address?.city || "",
            region: shipping?.address?.state || "",
            zip: shipping?.address?.postal_code || "",
            country: shipping?.address?.country || "",
          },
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      console.log("Order " + orderId + " processed");
    } catch (error) {
      console.error("Webhook processing error:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
