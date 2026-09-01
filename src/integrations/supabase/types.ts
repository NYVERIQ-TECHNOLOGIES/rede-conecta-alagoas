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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          difference: number | null
          id: string
          notes: string | null
          opened_at: string
          opening_amount: number
          operator_id: string | null
          store_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          difference?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_amount?: number
          operator_id?: string | null
          store_id: string
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          difference?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_amount?: number
          operator_id?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_settlements: {
        Row: {
          adjustments: number
          commission_amount: number
          cooperative_id: string
          created_at: string
          due_date: string | null
          gross_amount: number
          id: string
          net_amount: number
          paid_at: string | null
          period_end: string
          period_start: string
          receipt_url: string | null
          returns_amount: number
          status: Database["public"]["Enums"]["settlement_status"]
        }
        Insert: {
          adjustments?: number
          commission_amount?: number
          cooperative_id: string
          created_at?: string
          due_date?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          period_end: string
          period_start: string
          receipt_url?: string | null
          returns_amount?: number
          status?: Database["public"]["Enums"]["settlement_status"]
        }
        Update: {
          adjustments?: number
          commission_amount?: number
          cooperative_id?: string
          created_at?: string
          due_date?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          period_end?: string
          period_start?: string
          receipt_url?: string | null
          returns_amount?: number
          status?: Database["public"]["Enums"]["settlement_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_settlements_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperatives: {
        Row: {
          city: string
          cnpj: string | null
          commission_rate: number
          created_at: string
          description: string | null
          email: string | null
          families_reached: number | null
          history: string | null
          id: string
          is_demo: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          region: string | null
          responsible_name: string | null
          social_links: string | null
          status: Database["public"]["Enums"]["entity_status"]
        }
        Insert: {
          city: string
          cnpj?: string | null
          commission_rate?: number
          created_at?: string
          description?: string | null
          email?: string | null
          families_reached?: number | null
          history?: string | null
          id?: string
          is_demo?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          region?: string | null
          responsible_name?: string | null
          social_links?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
        }
        Update: {
          city?: string
          cnpj?: string | null
          commission_rate?: number
          created_at?: string
          description?: string | null
          email?: string | null
          families_reached?: number | null
          history?: string | null
          id?: string
          is_demo?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string | null
          responsible_name?: string | null
          social_links?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
        }
        Relationships: []
      }
      inventories: {
        Row: {
          batch_id: string | null
          critical_quantity: number
          id: string
          min_quantity: number
          product_id: string
          quantity: number
          store_id: string
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          critical_quantity?: number
          id?: string
          min_quantity?: number
          product_id: string
          quantity?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          critical_quantity?: number
          id?: string
          min_quantity?: number
          product_id?: string
          quantity?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventories_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          created_at: string
          created_by: string | null
          document: string | null
          document_url: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          store_id: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          store_id: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          store_id?: string
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          batch_code: string
          created_at: string
          expires_at: string | null
          id: string
          produced_at: string | null
          product_id: string
        }
        Insert: {
          batch_code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          produced_at?: string | null
          product_id: string
        }
        Update: {
          batch_code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          produced_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          emoji: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          emoji?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          emoji?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_losses: {
        Row: {
          batch_id: string | null
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          quantity: number
          reason: string | null
          store_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          store_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_losses_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_losses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_losses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          city: string | null
          cooperative_id: string
          cost: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_demo: boolean
          name: string
          origin: string | null
          price: number
          status: Database["public"]["Enums"]["entity_status"]
          unit: string
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          cooperative_id: string
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_demo?: boolean
          name: string
          origin?: string | null
          price?: number
          status?: Database["public"]["Enums"]["entity_status"]
          unit?: string
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          city?: string | null
          cooperative_id?: string
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_demo?: boolean
          name?: string
          origin?: string | null
          price?: number
          status?: Database["public"]["Enums"]["entity_status"]
          unit?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cooperative_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          store_id: string | null
        }
        Insert: {
          cooperative_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          store_id?: string | null
        }
        Update: {
          cooperative_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          batch_id: string | null
          commission_rate: number
          cooperative_id: string
          id: string
          net_amount: number
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          commission_rate?: number
          cooperative_id: string
          id?: string
          net_amount?: number
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          commission_rate?: number
          cooperative_id?: string
          id?: string
          net_amount?: number
          product_id?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cancelled_reason: string | null
          cash_register_id: string | null
          code: number
          created_at: string
          discount: number
          id: string
          is_demo: boolean
          operator_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["sale_status"]
          store_id: string
          total: number
        }
        Insert: {
          cancelled_reason?: string | null
          cash_register_id?: string | null
          code?: number
          created_at?: string
          discount?: number
          id?: string
          is_demo?: boolean
          operator_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          store_id: string
          total?: number
        }
        Update: {
          cancelled_reason?: string | null
          cash_register_id?: string | null
          code?: number
          created_at?: string
          discount?: number
          id?: string
          is_demo?: boolean
          operator_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          store_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          approved_by: string | null
          batch_id: string | null
          created_at: string
          from_store_id: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          requested_by: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          to_store_id: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          batch_id?: string | null
          created_at?: string
          from_store_id: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_store_id: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          batch_id?: string | null
          created_at?: string
          from_store_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          is_demo: boolean
          manager_name: string | null
          name: string
          opening_hours: string | null
          status: Database["public"]["Enums"]["entity_status"]
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          is_demo?: boolean
          manager_name?: string | null
          name: string
          opening_hours?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          manager_name?: string | null
          name?: string
          opening_hours?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_transfer: { Args: { _transfer_id: string }; Returns: undefined }
      current_cooperative_id: { Args: never; Returns: string }
      current_store_id: { Args: never; Returns: string }
      generate_settlement: {
        Args: { _cooperative_id: string; _end: string; _start: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      register_entry: {
        Args: {
          _batch_code: string
          _document: string
          _expires_at: string
          _produced_at: string
          _product_id: string
          _quantity: number
          _store_id: string
        }
        Returns: string
      }
      register_sale: {
        Args: {
          _discount: number
          _items: Json
          _payment_method: Database["public"]["Enums"]["payment_method"]
          _store_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "gerente" | "operador" | "cooperativa" | "consulta"
      entity_status: "ativa" | "pendente" | "inativa"
      movement_type:
        | "entrada"
        | "venda"
        | "transferencia_saida"
        | "transferencia_entrada"
        | "perda"
        | "ajuste"
        | "cancelamento"
      payment_method: "pix" | "dinheiro" | "debito" | "credito"
      sale_status: "concluida" | "cancelada"
      settlement_status: "aguardando" | "repassado" | "cancelado"
      transfer_status:
        | "solicitada"
        | "aprovada"
        | "separacao"
        | "enviada"
        | "recebida"
        | "cancelada"
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
      app_role: ["admin", "gerente", "operador", "cooperativa", "consulta"],
      entity_status: ["ativa", "pendente", "inativa"],
      movement_type: [
        "entrada",
        "venda",
        "transferencia_saida",
        "transferencia_entrada",
        "perda",
        "ajuste",
        "cancelamento",
      ],
      payment_method: ["pix", "dinheiro", "debito", "credito"],
      sale_status: ["concluida", "cancelada"],
      settlement_status: ["aguardando", "repassado", "cancelado"],
      transfer_status: [
        "solicitada",
        "aprovada",
        "separacao",
        "enviada",
        "recebida",
        "cancelada",
      ],
    },
  },
} as const
