import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GiftCardEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  purchaserEmail: string;
  code: string;
  amount: number;
  message?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, purchaserEmail, code, amount, message }: GiftCardEmailRequest = await req.json();

    const recipientGreeting = recipientName ? `Dear ${recipientName}` : 'Hello';
    const personalMessage = message ? `<p style="font-style: italic; color: #666; margin: 20px 0; padding: 20px; background: #f9f9f9; border-left: 3px solid #b8860b;">"${message}"</p>` : '';

    const emailResponse = await resend.emails.send({
      from: "Woodzire <orders@woodzire.llc>",
      to: [recipientEmail],
      subject: `You've received a ${formatPrice(amount)} Woodzire Gift Card!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: #1A1A1A; margin: 0;">
                WOODZIRE
              </h1>
              <p style="color: #b8860b; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">
                HANDCRAFTED WOODEN ARTIFACTS
              </p>
            </div>

            <!-- Gift Card -->
            <div style="background: linear-gradient(135deg, #1A1A1A 0%, #333 100%); border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 30px;">
              <p style="color: #b8860b; font-size: 12px; letter-spacing: 3px; margin: 0 0 20px 0; text-transform: uppercase;">
                Gift Card
              </p>
              <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 48px; color: #fff; margin: 0;">
                ${formatPrice(amount)}
              </h2>
              <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <p style="color: #999; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px 0; text-transform: uppercase;">
                  Your Gift Card Code
                </p>
                <p style="font-family: monospace; font-size: 28px; color: #b8860b; letter-spacing: 4px; margin: 0; font-weight: bold;">
                  ${code}
                </p>
              </div>
            </div>

            <!-- Message -->
            <div style="background: #fff; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; color: #1A1A1A; margin: 0 0 15px 0;">
                ${recipientGreeting},
              </p>
              <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 15px 0;">
                Someone special has sent you a Woodzire gift card worth <strong>${formatPrice(amount)}</strong>!
              </p>
              ${personalMessage}
              <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0;">
                Use the code above at checkout to redeem your gift card. It can be used on any of our handcrafted wooden products.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://woodzire.com/shop" style="display: inline-block; background: #1A1A1A; color: #fff; text-decoration: none; padding: 16px 40px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-radius: 30px;">
                Start Shopping
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                This gift card was purchased by ${purchaserEmail}
              </p>
              <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
                Gift cards never expire and can be used on any purchase.
              </p>
              <p style="font-size: 12px; color: #999; margin: 20px 0 0 0;">
                © ${new Date().getFullYear()} Woodzire LLC. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Gift card email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending gift card email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
