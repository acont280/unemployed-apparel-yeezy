import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: { title: string; variant: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    address1: string;
    city: string;
    region: string;
    zip: string;
    country: string;
  };
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-family:monospace;font-size:13px;">${item.title} — ${item.variant}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-family:monospace;font-size:13px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-family:monospace;font-size:13px;text-align:right;">$${(item.price / 100).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:500px;margin:0 auto;font-family:-apple-system,sans-serif;color:#1a1a1a;">
      <div style="padding:32px 0;border-bottom:1px solid #eee;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.3em;color:#999;margin:0;">UNEMPLOYED APPAREL</p>
      </div>
      
      <div style="padding:24px 0;">
        <p style="font-size:14px;margin:0 0 8px;">Hi ${data.customerName},</p>
        <p style="font-size:14px;color:#666;margin:0;">Thank you for your order. Here's your confirmation.</p>
      </div>

      <div style="background:#f8f7f5;padding:16px;margin:16px 0;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.2em;color:#999;margin:0 0 4px;">ORDER ID</p>
        <p style="font-family:monospace;font-size:13px;margin:0;">${data.orderId}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1a1a1a;font-family:monospace;font-size:10px;letter-spacing:0.2em;color:#999;">ITEM</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #1a1a1a;font-family:monospace;font-size:10px;letter-spacing:0.2em;color:#999;">QTY</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #1a1a1a;font-family:monospace;font-size:10px;letter-spacing:0.2em;color:#999;">PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top:2px solid #1a1a1a;padding:12px 0;">
        <table style="width:100%;">
          <tr>
            <td style="font-family:monospace;font-size:12px;color:#999;padding:4px 0;">Subtotal</td>
            <td style="font-family:monospace;font-size:12px;text-align:right;padding:4px 0;">$${(data.subtotal / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-family:monospace;font-size:12px;color:#999;padding:4px 0;">Shipping</td>
            <td style="font-family:monospace;font-size:12px;text-align:right;padding:4px 0;">$${(data.shipping / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-family:monospace;font-size:13px;font-weight:bold;padding:8px 0 0;">Total</td>
            <td style="font-family:monospace;font-size:13px;font-weight:bold;text-align:right;padding:8px 0 0;">$${(data.total / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#f8f7f5;padding:16px;margin:16px 0;">
        <p style="font-family:monospace;font-size:10px;letter-spacing:0.2em;color:#999;margin:0 0 8px;">SHIPPING TO</p>
        <p style="font-size:13px;margin:0;line-height:1.5;">
          ${data.customerName}<br/>
          ${data.shippingAddress.address1}<br/>
          ${data.shippingAddress.city}, ${data.shippingAddress.region} ${data.shippingAddress.zip}<br/>
          ${data.shippingAddress.country}
        </p>
      </div>

      <div style="padding:24px 0;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#999;margin:0;">Estimated delivery: 5-12 business days</p>
        <p style="font-family:monospace;font-size:10px;color:#ccc;margin:16px 0 0;letter-spacing:0.2em;">UNEMPLOYED APPAREL</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Unemployed Apparel <orders@yourdomain.com>",
      to: data.customerEmail,
      subject: `Order Confirmed — ${data.orderId}`,
      html,
    });
    console.log(`Confirmation email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}
