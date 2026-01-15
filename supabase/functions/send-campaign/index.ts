import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  subject: string;
  template: 'promotional' | 'newsletter' | 'announcement';
  content: {
    headline: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
    imageUrl?: string;
  };
  testEmail?: string; // If provided, only send to this email
}

const generateEmailTemplate = (template: string, content: CampaignRequest['content']) => {
  const baseStyles = `
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #FAF9F6; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #1A1A1A; padding: 40px 30px; text-align: center; }
    .logo { font-family: 'Georgia', serif; font-size: 28px; color: #fff; letter-spacing: 3px; margin: 0; }
    .content { padding: 50px 40px; }
    .headline { font-family: 'Georgia', serif; font-size: 32px; color: #1A1A1A; margin: 0 0 20px; line-height: 1.3; }
    .body-text { font-size: 16px; color: #666; line-height: 1.7; margin: 0 0 30px; }
    .cta-button { display: inline-block; background: #1A1A1A; color: #fff !important; padding: 16px 40px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-radius: 30px; }
    .hero-image { width: 100%; height: auto; display: block; }
    .footer { background: #f5f5f5; padding: 30px; text-align: center; font-size: 12px; color: #999; }
    .unsubscribe { color: #999; text-decoration: underline; }
  `;

  let heroSection = '';
  if (content.imageUrl) {
    heroSection = `<img src="${content.imageUrl}" alt="Campaign" class="hero-image" />`;
  }

  let ctaSection = '';
  if (content.ctaText && content.ctaUrl) {
    ctaSection = `
      <p style="text-align: center; margin-top: 30px;">
        <a href="${content.ctaUrl}" class="cta-button">${content.ctaText}</a>
      </p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">WOODZIRE</h1>
        </div>
        ${heroSection}
        <div class="content">
          <h2 class="headline">${content.headline}</h2>
          <p class="body-text">${content.body.replace(/\n/g, '<br/>')}</p>
          ${ctaSection}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Woodzire. All rights reserved.</p>
          <p>Handcrafted with passion in India.</p>
          <p><a href="{{unsubscribe_url}}" class="unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subject, template, content, testEmail }: CampaignRequest = await req.json();

    const html = generateEmailTemplate(template, content);

    let recipients: string[] = [];

    if (testEmail) {
      // Test mode - send only to specified email
      recipients = [testEmail];
    } else {
      // Fetch subscribers based on template type
      let prefsQuery = supabase.from('email_preferences').select('user_email');
      
      if (template === 'promotional') {
        prefsQuery = prefsQuery.eq('promotional_emails', true);
      } else if (template === 'newsletter') {
        prefsQuery = prefsQuery.eq('newsletter', true);
      }
      
      const { data: subscribers, error } = await prefsQuery;
      
      if (error) throw error;
      
      recipients = subscribers?.map(s => s.user_email) || [];
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No subscribers found for this campaign type' 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails in batches
    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      for (const email of batch) {
        try {
          await resend.emails.send({
            from: "Woodzire <hello@woodzire.in>",
            to: [email],
            subject: subject,
            html: html.replace('{{unsubscribe_url}}', `${supabaseUrl.replace('.supabase.co', '')}/email-preferences`),
          });
          sentCount++;
        } catch (err: any) {
          errors.push(`Failed to send to ${email}: ${err.message}`);
        }
      }
    }

    console.log(`Campaign sent: ${sentCount}/${recipients.length} emails delivered`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        totalRecipients: recipients.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
