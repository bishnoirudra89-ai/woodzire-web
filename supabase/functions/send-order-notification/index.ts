import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "ashwin@woodzire.in";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  type: 'order_created' | 'status_change' | 'stock_update' | 'admin_alert' | 'order_cancelled';
  order?: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    shipping_address: {
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    tracking_number?: string;
    carrier_name?: string;
    est_delivery_date?: string;
    status?: string;
    cancellation_reason?: string;
    refund_amount?: number;
    refund_method?: string;
  };
  product?: {
    id: string;
    name: string;
    stock_quantity: number;
  };
  emails?: string[];
}

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

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const sendEmail = async (to: string[], subject: string, html: string) => {
  console.log(`Sending email to: ${to.join(', ')}, Subject: ${subject}`);
  
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
    console.error('Email send failed:', errorData);
    throw new Error(errorData.message || "Failed to send email");
  }

  console.log('Email sent successfully');
  return response.json();
};

const generateOrderCreatedEmailForCustomer = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${escapeHtml(item.product_name)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatINR(item.total_price)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7;">
      <div style="background: linear-gradient(135deg, #B8860B, #DAA520); padding: 40px 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for your purchase</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #B8860B; margin: 0 0 20px; font-size: 18px;">
            Order #${escapeHtml(order.order_number)}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #B8860B; margin-top: 20px; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>${formatINR(order.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Shipping:</span>
              <span>${formatINR(order.shipping_cost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Tax:</span>
              <span>${formatINR(order.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #B8860B;">
              <span>Total:</span>
              <span>${formatINR(order.total)}</span>
            </div>
          </div>
        </div>
        
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin: 0 0 15px;">Shipping Address</h3>
          <p style="margin: 0; color: #666; line-height: 1.6;">
            ${escapeHtml(order.customer_name)}<br>
            ${escapeHtml(order.shipping_address.street_address)}<br>
            ${escapeHtml(order.shipping_address.city)}, ${escapeHtml(order.shipping_address.state)} ${escapeHtml(order.shipping_address.postal_code)}<br>
            ${escapeHtml(order.shipping_address.country)}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
          We'll send you tracking information once your order ships.
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 Woodzire. Premium Handcrafted Woodwork.<br>
          Questions? Email us at info@woodzire.llc
        </p>
      </div>
    </div>
  `;
};

const generateOrderCreatedEmailForAdmin = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(item.product_name)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatINR(item.unit_price)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatINR(item.total_price)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #B8860B; border-bottom: 2px solid #B8860B; padding-bottom: 10px;">
        🎉 New Order Received!
      </h1>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 15px; color: #333;">Order #${escapeHtml(order.order_number)}</h2>
        <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
        ${order.customer_phone ? `<p><strong>Phone:</strong> ${escapeHtml(order.customer_phone)}</p>` : ''}
      </div>
      
      <h3>Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #B8860B; color: white;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background: #f5f5f5;">
            <td colspan="3" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 8px; text-align: right;">${formatINR(order.subtotal)}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td colspan="3" style="padding: 8px; text-align: right;"><strong>Shipping:</strong></td>
            <td style="padding: 8px; text-align: right;">${formatINR(order.shipping_cost)}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td colspan="3" style="padding: 8px; text-align: right;"><strong>Tax:</strong></td>
            <td style="padding: 8px; text-align: right;">${formatINR(order.tax)}</td>
          </tr>
          <tr style="background: #B8860B; color: white;">
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>${formatINR(order.total)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #B8860B;">
        <h4 style="margin: 0 0 10px;">Shipping Address</h4>
        <p style="margin: 0;">
          ${escapeHtml(order.shipping_address.street_address)}<br>
          ${escapeHtml(order.shipping_address.city)}, ${escapeHtml(order.shipping_address.state)} ${escapeHtml(order.shipping_address.postal_code)}<br>
          ${escapeHtml(order.shipping_address.country)}
        </p>
      </div>
    </div>
  `;
};

const generateShippedEmail = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7;">
      <div style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 40px 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">📦 Your Order Has Shipped!</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(order.customer_name)},</p>
        <p style="color: #666;">Great news! Your order <strong>#${escapeHtml(order.order_number)}</strong> is on its way.</p>
        
        ${order.tracking_number ? `
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin: 0 0 15px;">Tracking Information</h3>
          <p style="margin: 0;">
            <strong>Carrier:</strong> ${escapeHtml(order.carrier_name || 'Standard Shipping')}<br>
            <strong>Tracking Number:</strong> ${escapeHtml(order.tracking_number)}
          </p>
          ${order.est_delivery_date ? `<p><strong>Estimated Delivery:</strong> ${escapeHtml(order.est_delivery_date)}</p>` : ''}
        </div>
        ` : ''}
        
        <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin: 0 0 15px;">Shipping To</h3>
          <p style="margin: 0; color: #666; line-height: 1.6;">
            ${escapeHtml(order.shipping_address.street_address)}<br>
            ${escapeHtml(order.shipping_address.city)}, ${escapeHtml(order.shipping_address.state)} ${escapeHtml(order.shipping_address.postal_code)}<br>
            ${escapeHtml(order.shipping_address.country)}
          </p>
        </div>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 Woodzire. Premium Handcrafted Woodwork.
        </p>
      </div>
    </div>
  `;
};

const generateDeliveredEmail = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7;">
      <div style="background: linear-gradient(135deg, #4CAF50, #388E3C); padding: 40px 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">✅ Order Delivered!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your package has arrived</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(order.customer_name)},</p>
        <p style="color: #666;">Your order <strong>#${escapeHtml(order.order_number)}</strong> has been delivered!</p>
        
        <div style="background: #e8f5e9; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="font-size: 18px; color: #2e7d32; margin: 0;">
            Thank you for choosing Woodzire!<br>
            We hope you love your handcrafted woodwork.
          </p>
        </div>
        
        <p style="color: #666; text-align: center;">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 Woodzire. Premium Handcrafted Woodwork.
        </p>
      </div>
    </div>
  `;
};

const generateBackInStockEmail = (product: OrderNotificationRequest['product']) => {
  if (!product) return '';
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7;">
      <div style="background: linear-gradient(135deg, #B8860B, #DAA520); padding: 40px 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">🎉 Back In Stock!</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
          <h2 style="color: #B8860B; margin: 0 0 15px;">${escapeHtml(product.name)}</h2>
          <p style="color: #666;">The item you were waiting for is now available!</p>
          <p style="color: #333;"><strong>${product.stock_quantity}</strong> in stock</p>
          
          <a href="https://woodzire.llc/product/${product.id}" 
             style="display: inline-block; background: linear-gradient(135deg, #B8860B, #DAA520); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600;">
            Shop Now
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          You received this email because you signed up for stock notifications.
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 Woodzire. Premium Handcrafted Woodwork.
        </p>
      </div>
    </div>
  `;
};

const generateLowStockAlertEmail = (product: OrderNotificationRequest['product']) => {
  if (!product) return '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f44336; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">⚠️ Low Stock Alert</h1>
      </div>
      
      <div style="padding: 30px 20px; background: #fff;">
        <h2 style="color: #333;">${escapeHtml(product.name)}</h2>
        <p style="font-size: 18px; color: #f44336;">
          <strong>Only ${product.stock_quantity} left in stock!</strong>
        </p>
        <p style="color: #666;">
          This product has reached its low stock threshold. Consider restocking soon.
        </p>
        
        <a href="https://woodzire.llc/admin" 
           style="display: inline-block; background: #B8860B; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  `;
};

const generateCancelledEmailForCustomer = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Order Cancelled</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">We're sorry to see this order go</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(order.customer_name)},</p>
        <p style="color: #666;">Your order <strong>#${escapeHtml(order.order_number)}</strong> has been cancelled.</p>
        
        ${order.cancellation_reason ? `
        <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #991b1b; margin: 0 0 10px;">Reason for Cancellation</h3>
          <p style="color: #7f1d1d; margin: 0;">${escapeHtml(order.cancellation_reason)}</p>
        </div>
        ` : ''}
        
        ${order.refund_amount ? `
        <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin: 0 0 10px;">💰 Refund Information</h3>
          <p style="color: #047857; margin: 0;">
            <strong>Amount:</strong> ${formatINR(order.refund_amount)}<br>
            ${order.refund_method ? `<strong>Method:</strong> ${escapeHtml(order.refund_method)}<br>` : ''}
            <span style="font-size: 14px; color: #6b7280;">Refunds typically take 5-7 business days to process.</span>
          </p>
        </div>
        ` : ''}
        
        <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin: 0 0 15px;">Order Summary</h3>
          <p style="margin: 0; color: #666;">
            <strong>Order Total:</strong> ${formatINR(order.total)}<br>
            <strong>Items:</strong> ${order.items?.length || 0} item(s)
          </p>
        </div>
        
        <p style="color: #666; text-align: center; margin-top: 30px;">
          Have questions? Contact us at <a href="mailto:info@woodzire.llc" style="color: #B8860B;">info@woodzire.llc</a>
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 Woodzire. Premium Handcrafted Woodwork.
        </p>
      </div>
    </div>
  `;
};

const generateCancelledEmailForAdmin = (order: OrderNotificationRequest['order']) => {
  if (!order) return '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ef4444; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">❌ Order Cancelled</h1>
      </div>
      
      <div style="padding: 30px 20px; background: #fff;">
        <h2 style="color: #333;">Order #${escapeHtml(order.order_number)}</h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
          <p><strong>Order Total:</strong> ${formatINR(order.total)}</p>
        </div>
        
        ${order.cancellation_reason ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
          <strong>Cancellation Reason:</strong><br>
          ${escapeHtml(order.cancellation_reason)}
        </div>
        ` : ''}
        
        ${order.refund_amount ? `
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
          <strong>Refund:</strong> ${formatINR(order.refund_amount)}
          ${order.refund_method ? ` via ${escapeHtml(order.refund_method)}` : ''}
        </div>
        ` : ''}
        
        <a href="https://woodzire.llc/admin" 
           style="display: inline-block; background: #B8860B; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">
          View in Dashboard
        </a>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: OrderNotificationRequest = await req.json();
    console.log('Received notification request:', payload.type);

    switch (payload.type) {
      case 'order_created':
        if (payload.order) {
          // Send to customer
          await sendEmail(
            [payload.order.customer_email],
            `Order Confirmed - #${payload.order.order_number}`,
            generateOrderCreatedEmailForCustomer(payload.order)
          );
          
          // Send to admin
          await sendEmail(
            [ADMIN_EMAIL],
            `🎉 New Order #${payload.order.order_number} - ${formatINR(payload.order.total)}`,
            generateOrderCreatedEmailForAdmin(payload.order)
          );
        }
        break;

      case 'status_change':
        if (payload.order) {
          if (payload.order.status === 'shipped') {
            await sendEmail(
              [payload.order.customer_email],
              `Your Order Has Shipped - #${payload.order.order_number}`,
              generateShippedEmail(payload.order)
            );
          } else if (payload.order.status === 'delivered') {
            await sendEmail(
              [payload.order.customer_email],
              `Order Delivered - #${payload.order.order_number}`,
              generateDeliveredEmail(payload.order)
            );
          }
        }
        break;

      case 'stock_update':
        if (payload.product && payload.emails && payload.emails.length > 0) {
          // Send back-in-stock notifications
          for (const email of payload.emails) {
            await sendEmail(
              [email],
              `Back In Stock: ${payload.product.name}`,
              generateBackInStockEmail(payload.product)
            );
          }
        }
        break;

      case 'admin_alert':
        if (payload.product) {
          await sendEmail(
            [ADMIN_EMAIL],
            `⚠️ Low Stock Alert: ${payload.product.name}`,
            generateLowStockAlertEmail(payload.product)
          );
        }
        break;

      case 'order_cancelled':
        if (payload.order) {
          // Send cancellation notification to customer
          await sendEmail(
            [payload.order.customer_email],
            `Order Cancelled - #${payload.order.order_number}`,
            generateCancelledEmailForCustomer(payload.order)
          );
          
          // Send to admin
          await sendEmail(
            [ADMIN_EMAIL],
            `❌ Order Cancelled #${payload.order.order_number}`,
            generateCancelledEmailForAdmin(payload.order)
          );
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown notification type' }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
