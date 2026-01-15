import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  name: string;
  email: string;
  phone?: string;
  product?: string;
  message: string;
}

// HTML escape function to prevent XSS attacks
const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, product, message }: InquiryRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize all user inputs to prevent HTML injection
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : null;
    const safeProduct = product ? escapeHtml(product) : null;
    const safeMessage = escapeHtml(message);

    // Save to database using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: dbError } = await supabase
      .from('inquiries')
      .insert({
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        product: safeProduct,
        message: safeMessage,
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
    } else {
      console.log("Inquiry saved to database");
    }

    // Send email to business using Resend REST API
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Woodzire Inquiries <onboarding@resend.dev>",
        to: ["ashwin@woodzire.in"],
        subject: `New Contact Form Inquiry from ${safeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #B8860B; border-bottom: 2px solid #B8860B; padding-bottom: 10px;">
              New Contact Form Submission
            </h1>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
              ${safeProduct ? `<p><strong>Product Interest:</strong> ${safeProduct}</p>` : ''}
            </div>
            
            <div style="background: #fff; padding: 20px; border-left: 4px solid #B8860B;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This inquiry was submitted via the Woodzire website contact form.
              <br>You can view and manage all inquiries in the admin dashboard.
            </p>
          </div>
        `,
      }),
    });

    if (!businessEmailResponse.ok) {
      const errorData = await businessEmailResponse.json();
      throw new Error(errorData.message || "Failed to send business email");
    }

    console.log("Business email sent successfully");

    // Send confirmation email to customer using Resend REST API
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Woodzire <onboarding@resend.dev>",
        to: [email],
        subject: "Thank you for contacting Woodzire",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #B8860B;">Thank You, ${safeName}!</h1>
            
            <p>We have received your message and our team will get back to you within 24 hours.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #B8860B;">Your Message:</h3>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Browse our collection at <a href="https://woodzire.llc" style="color: #B8860B;">woodzire.llc</a></li>
              <li>Chat with us on WhatsApp: +91-9528050221</li>
              <li>Email us directly: info@woodzire.llc</li>
            </ul>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Woodzire Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px;">
              WOODZIRE LLC<br>
              8 The Green Ste B, Dover, Delaware 19901, USA<br>
              Manufacturing: Bishnoi Sarai Nagina, Bijnor 246762, UP, India
            </p>
          </div>
        `,
      }),
    });

    if (!customerEmailResponse.ok) {
      console.error("Failed to send customer confirmation email");
    } else {
      console.log("Customer confirmation email sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-inquiry function:", error);
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