import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartReminderRequest {
  email: string;
  cartItems: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Cart reminder function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, cartItems, totalAmount }: CartReminderRequest = await req.json();
    console.log("Sending cart reminder to:", email);

    const formatINR = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <span style="color: #666;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatINR(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Woodzire <onboarding@resend.dev>",
        to: [email],
        subject: "You left something behind! Complete your order",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f5f0;">
            <div style="max-width: 600px; margin: 0 auto; background: white;">
              <!-- Header -->
              <div style="background: #1a1a1a; padding: 30px; text-align: center;">
                <h1 style="color: #d4a574; margin: 0; font-size: 28px; letter-spacing: 2px;">WOODZIRE</h1>
                <p style="color: #888; margin: 10px 0 0 0; font-size: 12px; letter-spacing: 1px;">HANDCRAFTED WOODEN ARTIFACTS</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Did you forget something?</h2>
                
                <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                  We noticed you left some beautiful items in your cart. Your handcrafted pieces are waiting for you!
                </p>
                
                <!-- Cart Items -->
                <table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                  <thead>
                    <tr style="background: #f8f5f0;">
                      <th style="padding: 12px 16px; text-align: left; font-weight: 600;">Item</th>
                      <th style="padding: 12px 16px; text-align: right; font-weight: 600;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style="padding: 16px; font-weight: bold;">Total</td>
                      <td style="padding: 16px; text-align: right; font-weight: bold; color: #d4a574; font-size: 18px;">
                        ${formatINR(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://woodzire.com/shop" 
                     style="display: inline-block; background: #d4a574; color: #1a1a1a; padding: 16px 40px; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px; letter-spacing: 1px;">
                    COMPLETE YOUR ORDER
                  </a>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                  Each piece is handcrafted with love and may take time to create. Don't miss out!
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #1a1a1a; padding: 30px; text-align: center;">
                <p style="color: #888; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Woodzire LLC. All rights reserved.
                </p>
                <p style="color: #666; margin: 10px 0 0 0; font-size: 11px;">
                  If you didn't add these items to your cart, please ignore this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const responseData = await emailResponse.json();

    console.log("Cart reminder email sent:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending cart reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
