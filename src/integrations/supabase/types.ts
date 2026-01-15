export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_items: Json
          created_at: string
          id: string
          last_reminder_sent_at: string | null
          recovered: boolean
          reminder_sent_count: number
          total_amount: number
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          cart_items: Json
          created_at?: string
          id?: string
          last_reminder_sent_at?: string | null
          recovered?: boolean
          reminder_sent_count?: number
          total_amount?: number
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          cart_items?: Json
          created_at?: string
          id?: string
          last_reminder_sent_at?: string | null
          recovered?: boolean
          reminder_sent_count?: number
          total_amount?: number
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string | null
          phone: string | null
          postal_code: string
          state: string
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code: string
          state: string
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      email_ab_tests: {
        Row: {
          completed_at: string | null
          content: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          started_at: string | null
          status: string
          template: string
          variant_a_clicks: number
          variant_a_opens: number
          variant_a_sent: number
          variant_a_subject: string
          variant_b_clicks: number
          variant_b_opens: number
          variant_b_sent: number
          variant_b_subject: string
          winner: string | null
        }
        Insert: {
          completed_at?: string | null
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: string
          template: string
          variant_a_clicks?: number
          variant_a_opens?: number
          variant_a_sent?: number
          variant_a_subject: string
          variant_b_clicks?: number
          variant_b_opens?: number
          variant_b_sent?: number
          variant_b_subject: string
          winner?: string | null
        }
        Update: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          template?: string
          variant_a_clicks?: number
          variant_a_opens?: number
          variant_a_sent?: number
          variant_a_subject?: string
          variant_b_clicks?: number
          variant_b_opens?: number
          variant_b_sent?: number
          variant_b_subject?: string
          winner?: string | null
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          recipient_email: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          sent_count: number
          subject: string
          template: string
          total_recipients: number
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          sent_count?: number
          subject: string
          template: string
          total_recipients?: number
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          sent_count?: number
          subject?: string
          template?: string
          total_recipients?: number
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          back_in_stock_alerts: boolean
          created_at: string
          id: string
          newsletter: boolean
          order_updates: boolean
          promotional_emails: boolean
          shipping_notifications: boolean
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          back_in_stock_alerts?: boolean
          created_at?: string
          id?: string
          newsletter?: boolean
          order_updates?: boolean
          promotional_emails?: boolean
          shipping_notifications?: boolean
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          back_in_stock_alerts?: boolean
          created_at?: string
          id?: string
          newsletter?: boolean
          order_updates?: boolean
          promotional_emails?: boolean
          shipping_notifications?: boolean
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_card_transactions: {
        Row: {
          amount: number
          created_at: string
          gift_card_id: string
          id: string
          order_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          gift_card_id: string
          id?: string
          order_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          gift_card_id?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_card_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          currency: string
          current_balance: number
          expires_at: string | null
          id: string
          initial_balance: number
          is_active: boolean
          is_public: boolean | null
          message: string | null
          purchaser_email: string | null
          recipient_email: string | null
          recipient_name: string | null
          usage_count: number | null
          usage_limit: number | null
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          currency?: string
          current_balance: number
          expires_at?: string | null
          id?: string
          initial_balance: number
          is_active?: boolean
          is_public?: boolean | null
          message?: string | null
          purchaser_email?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          current_balance?: number
          expires_at?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_public?: boolean | null
          message?: string | null
          purchaser_email?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          used_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          product: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          product?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          product?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          carrier_name: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          est_delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          shipping_address: Json
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number | null
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          carrier_name?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          est_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          shipping_address: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          carrier_name?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          est_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_bundles: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          care_instructions: string | null
          category: string
          compare_at_price: number | null
          created_at: string
          delivery_charge: number | null
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          estimated_delivery_days: number | null
          id: string
          images: string[] | null
          international_delivery_charge: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_made_to_order: boolean | null
          is_on_sale: boolean | null
          is_trending: boolean | null
          low_stock_threshold: number | null
          name: string
          prep_time_days: number | null
          price: number
          shipping_info: string | null
          slug: string
          stock_quantity: number
          updated_at: string
          wood_type: string | null
        }
        Insert: {
          care_instructions?: string | null
          category: string
          compare_at_price?: number | null
          created_at?: string
          delivery_charge?: number | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          estimated_delivery_days?: number | null
          id?: string
          images?: string[] | null
          international_delivery_charge?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_made_to_order?: boolean | null
          is_on_sale?: boolean | null
          is_trending?: boolean | null
          low_stock_threshold?: number | null
          name: string
          prep_time_days?: number | null
          price?: number
          shipping_info?: string | null
          slug: string
          stock_quantity?: number
          updated_at?: string
          wood_type?: string | null
        }
        Update: {
          care_instructions?: string | null
          category?: string
          compare_at_price?: number | null
          created_at?: string
          delivery_charge?: number | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          estimated_delivery_days?: number | null
          id?: string
          images?: string[] | null
          international_delivery_charge?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_made_to_order?: boolean | null
          is_on_sale?: boolean | null
          is_trending?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          prep_time_days?: number | null
          price?: number
          shipping_info?: string | null
          slug?: string
          stock_quantity?: number
          updated_at?: string
          wood_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          background_color: string | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          is_sticky: boolean
          link: string | null
          message: string
          start_date: string | null
          text_color: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_sticky?: boolean
          link?: string | null
          message: string
          start_date?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_sticky?: boolean
          link?: string | null
          message?: string
          start_date?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          is_approved: boolean
          is_featured: boolean
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_sales: {
        Row: {
          created_at: string
          discount_percentage: number
          end_date: string
          id: string
          is_active: boolean
          is_paused: boolean
          name: string
          sale_type: string
          start_date: string
          target_category: string | null
          target_product_ids: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage: number
          end_date: string
          id?: string
          is_active?: boolean
          is_paused?: boolean
          name: string
          sale_type: string
          start_date: string
          target_category?: string | null
          target_product_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          end_date?: string
          id?: string
          is_active?: boolean
          is_paused?: boolean
          name?: string
          sale_type?: string
          start_date?: string
          target_category?: string | null
          target_product_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          created_at: string
          id: string
          notified: boolean | null
          product_id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notified?: boolean | null
          product_id: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notified?: boolean | null
          product_id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          location: string | null
          name: string
          product: string | null
          rating: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          location?: string | null
          name: string
          product?: string | null
          rating?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          location?: string | null
          name?: string
          product?: string | null
          rating?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      order_status:
        | "pending"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      order_status: [
        "pending",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
