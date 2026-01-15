import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  giftCardDiscount?: number;
  total: number;
  createdAt: string;
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const sendEmail = async (to: string[], subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Woodzire <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send email");
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Invoice function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InvoiceRequest = await req.json();
    console.log("Generating invoice for order:", data.orderNumber);

    const orderDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatINR(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatINR(item.totalPrice)}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8f5f0;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: #1a1a1a; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #d4a574; margin: 0; font-size: 28px; letter-spacing: 2px;">WOODZIRE</h1>
              <p style="color: #888; margin: 5px 0 0 0; font-size: 12px;">HANDCRAFTED WOODEN ARTIFACTS</p>
            </div>
            <div style="text-align: right;">
              <h2 style="color: white; margin: 0; font-size: 24px;">INVOICE</h2>
              <p style="color: #888; margin: 5px 0 0 0; font-size: 14px;">${data.orderNumber}</p>
            </div>
          </div>
          
          <!-- Info Section -->
          <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <h3 style="color: #d4a574; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Bill To</h3>
              <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${data.customerName}</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">${data.customerEmail}</p>
              ${data.customerPhone ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${data.customerPhone}</p>` : ''}
            </div>
            <div>
              <h3 style="color: #d4a574; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Ship To</h3>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                ${data.shippingAddress.street_address}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
                ${data.shippingAddress.country}
              </p>
            </div>
          </div>
          
          <div style="padding: 0 30px;">
            <div style="background: #f8f5f0; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
              <span style="color: #666; font-size: 14px;">Order Date:</span>
              <span style="color: #1a1a1a; font-weight: 600; margin-left: 10px;">${orderDate}</span>
            </div>
          </div>
          
          <!-- Items Table -->
          <div style="padding: 0 30px 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #1a1a1a;">
                  <th style="padding: 15px 12px; text-align: left; color: white; font-size: 13px;">Item</th>
                  <th style="padding: 15px 12px; text-align: center; color: white; font-size: 13px;">Qty</th>
                  <th style="padding: 15px 12px; text-align: right; color: white; font-size: 13px;">Unit Price</th>
                  <th style="padding: 15px 12px; text-align: right; color: white; font-size: 13px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <!-- Totals -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #1a1a1a;">
              <div style="display: flex; justify-content: flex-end;">
                <table style="width: 300px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                    <td style="padding: 8px 0; text-align: right;">${formatINR(data.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right;">${formatINR(data.shippingCost)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Tax (GST 18%):</td>
                    <td style="padding: 8px 0; text-align: right;">${formatINR(data.tax)}</td>
                  </tr>
                  ${data.giftCardDiscount ? `
                  <tr>
                    <td style="padding: 8px 0; color: #22c55e;">Gift Card Discount:</td>
                    <td style="padding: 8px 0; text-align: right; color: #22c55e;">-${formatINR(data.giftCardDiscount)}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #d4a574;">
                    <td style="padding: 15px 0; font-weight: bold; font-size: 18px;">Total Paid:</td>
                    <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #d4a574;">
                      ${formatINR(data.total)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f5f0; padding: 30px; text-align: center;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
              Thank you for choosing Woodzire!
            </p>
            <p style="color: #888; margin: 0; font-size: 12px;">
              For any queries, contact us at info@woodzire.llc | +91-9528050221
            </p>
          </div>
          
          <!-- Company Info -->
          <div style="background: #1a1a1a; padding: 20px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 11px;">
              WOODZIRE LLC | 8 The Green Ste B, Dover, DE 19901, USA<br>
              Manufacturing: Bishnoi Sarai Nagina, Bijnor 246762, UP, India
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to customer
    const customerEmailResult = await sendEmail(
      [data.customerEmail],
      `Invoice for Order ${data.orderNumber} - Woodzire`,
      invoiceHtml
    );
    console.log("Invoice sent to customer:", customerEmailResult);

    // Send to admin
    const adminEmailResult = await sendEmail(
      ["ashwin@woodzire.in"],
      `[New Order] ${data.orderNumber} - ${formatINR(data.total)}`,
      invoiceHtml
    );
    console.log("Invoice sent to admin:", adminEmailResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);