import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";
import { createOrder } from "@/lib/printify";
import { sendOrderConfirmation } from "@/lib/email";
import Stripe from "stripe";

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
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Parse order items from metadata
      const items = JSON.parse(session.metadata?.items || "[]");
      const discountCode = session.metadata?.discountCode || "";
      const discountAmount = parseInt(session.metadata?.discountAmount || "0");

      // Get shipping details from Stripe
      const shipping = session.shipping_details;
      const customerEmail =
        session.customer_details?.email || session.customer_email || "";
      const customerName = session.customer_details?.name || "Customer";

      // Generate order ID
      const orderId = `UA-${Date.now().toString(36).toUpperCase()}`;

      // 1. Save order to Supabase
      const supabase = createServerClient();
      const { error: dbError } = await supabase.from("orders").insert({
        order_id: orderId,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items,
        subtotal: session.amount_subtotal,
        shipping_cost: session.total_details?.amount_shipping || 0,
        tax: session.total_details?.amount_tax || 0,
        discount_code: discountCode,
        discount_amount: discountAmount,
        total: session.amount_total,
        shipping_address: shipping?.address
          ? {
              name: shipping.name,
              address1: shipping.address.line1,
              address2: shipping.address.line2,
              city: shipping.address.city,
              region: shipping.address.state,
              zip: shipping.address.postal_code,
              country: shipping.address.country,
            }
          : null,
        status: "paid",
      });

      if (dbError) {
        console.error("Failed to save order to Supabase:", dbError);
      }

      // 2. Send order to Printify
      if (shipping?.address) {
        try {
          const printifyLineItems = items.map(
            (item: { productId: string; variantId: number; quantity: number }) => ({
              product_id: item.productId,
              variant_id: item.variantId,
              quantity: item.quantity,
            })
          );

          const nameParts = (shipping.name || "Customer").split(" ");
          const firstName = nameParts[0] || "Customer";
          const lastName = nameParts.slice(1).join(" ") || "";

          await createOrder(orderId, printifyLineItems, {
            first_name: firstName,
            last_name: lastName,
            email: customerEmail,
            country: shipping.address.country || "US",
            region: shipping.address.state || "",
            address1: shipping.address.line1 || "",
            address2: shipping.address.line2 || "",
            city: shipping.address.city || "",
            zip: shipping.address.postal_code || "",
          });

          // Update order status in Supabase
          await supabase
            .from("orders")
            .update({ status: "sent_to_printify" })
            .eq("order_id", orderId);

          console.log(`Order ${orderId} sent to Printify`);
        } catch (printifyError) {
          console.error("Failed to send order to Printify:", printifyError);
          await supabase
            .from("orders")
            .update({ status: "printify_failed" })
            .eq("order_id", orderId);
        }
      }

      // 3. Send confirmation email
      try {
        // Fetch line item details from Stripe for the email
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );

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
        console.error("Failed to send confirmation email:", emailError);
      }

      console.log(`Order ${orderId} processed successfully`);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
