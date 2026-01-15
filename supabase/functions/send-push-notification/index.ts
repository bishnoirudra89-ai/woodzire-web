import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  type: 'order_status_change' | 'back_in_stock' | 'promotion';
  order_id?: string;
  old_status?: string;
  new_status?: string;
  user_id?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

const getStatusMessage = (status: string, orderNumber: string): { title: string; body: string } => {
  switch (status) {
    case 'pending':
      return {
        title: 'Order Received! 🎉',
        body: `Your order #${orderNumber} has been received and is being processed.`,
      };
    case 'preparing':
      return {
        title: 'Order Being Prepared 🛠️',
        body: `Great news! We're now crafting your order #${orderNumber}.`,
      };
    case 'shipped':
      return {
        title: 'Order Shipped! 📦',
        body: `Your order #${orderNumber} is on its way to you!`,
      };
    case 'delivered':
      return {
        title: 'Order Delivered! ✅',
        body: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`,
      };
    case 'cancelled':
      return {
        title: 'Order Cancelled ❌',
        body: `Your order #${orderNumber} has been cancelled. Contact us if you have questions.`,
      };
    default:
      return {
        title: 'Order Update',
        body: `Your order #${orderNumber} status has been updated to ${status}.`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushNotificationRequest = await req.json();
    console.log("Received push notification request:", payload);

    if (payload.type === 'order_status_change' && payload.order_id) {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, user_id, customer_email, status')
        .eq('id', payload.order_id)
        .single();

      if (orderError || !order) {
        console.error('Order not found:', orderError);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const statusMessage = getStatusMessage(
        payload.new_status || order.status,
        order.order_number
      );

      // Log the notification (for debugging and future push subscription implementation)
      console.log('Push notification to send:', {
        order_id: order.id,
        user_id: order.user_id,
        title: statusMessage.title,
        body: statusMessage.body,
        status: payload.new_status || order.status,
      });

      // Also send email notification via existing function
      try {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, quantity, unit_price, total_price')
          .eq('order_id', order.id);

        await supabase.functions.invoke('send-order-notification', {
          body: {
            type: 'status_change',
            order: {
              order_number: order.order_number,
              customer_name: order.customer_email.split('@')[0],
              customer_email: order.customer_email,
              items: orderItems || [],
              subtotal: 0,
              shipping_cost: 0,
              tax: 0,
              total: 0,
              shipping_address: {},
              status: payload.new_status || order.status,
            },
          },
        });
        console.log('Email notification sent');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      // Store notification in database for in-app notifications
      // (Future enhancement: store in a notifications table)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Push notification processed',
          notification: statusMessage,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle other notification types
    if (payload.title && payload.body) {
      console.log('Custom notification:', {
        title: payload.title,
        body: payload.body,
        data: payload.data,
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Notification processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid notification request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);