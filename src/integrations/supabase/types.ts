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
      expenses: {
        Row: {
          amount_ttc: number
          attachment_name: string | null
          attachment_url: string | null
          category: string
          created_at: string
          date: string
          description: string
          id: string
          invoice_ref: string
          property_id: string
          tax_deductible: boolean
          user_id: string
        }
        Insert: {
          amount_ttc?: number
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          invoice_ref?: string
          property_id?: string
          tax_deductible?: boolean
          user_id: string
        }
        Update: {
          amount_ttc?: number
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          invoice_ref?: string
          property_id?: string
          tax_deductible?: boolean
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          acquisition_date: string
          acquisition_value: number
          address: string
          annual_property_tax: number
          created_at: string
          depreciation_building_value: number
          depreciation_building_years: number
          depreciation_furniture_value: number
          depreciation_furniture_years: number
          ical_airbnb_url: string | null
          ical_booking_url: string | null
          id: string
          monthly_copro_charges: number
          name: string
          nightly_rate: number | null
          rental_type: string
          surface: number
          tax_regime: string
          type: string
          user_id: string
        }
        Insert: {
          acquisition_date?: string
          acquisition_value?: number
          address?: string
          annual_property_tax?: number
          created_at?: string
          depreciation_building_value?: number
          depreciation_building_years?: number
          depreciation_furniture_value?: number
          depreciation_furniture_years?: number
          ical_airbnb_url?: string | null
          ical_booking_url?: string | null
          id?: string
          monthly_copro_charges?: number
          name: string
          nightly_rate?: number | null
          rental_type?: string
          surface?: number
          tax_regime?: string
          type?: string
          user_id: string
        }
        Update: {
          acquisition_date?: string
          acquisition_value?: number
          address?: string
          annual_property_tax?: number
          created_at?: string
          depreciation_building_value?: number
          depreciation_building_years?: number
          depreciation_furniture_value?: number
          depreciation_furniture_years?: number
          ical_airbnb_url?: string | null
          ical_booking_url?: string | null
          id?: string
          monthly_copro_charges?: number
          name?: string
          nightly_rate?: number | null
          rental_type?: string
          surface?: number
          tax_regime?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount_received: number
          charges: number
          created_at: string
          id: string
          month: number
          paid_date: string | null
          period_end: string
          period_start: string
          property_id: string
          rent_hc: number
          status: string
          tenant_id: string
          total: number
          user_id: string
          year: number
        }
        Insert: {
          amount_received?: number
          charges?: number
          created_at?: string
          id?: string
          month: number
          paid_date?: string | null
          period_end?: string
          period_start?: string
          property_id: string
          rent_hc?: number
          status?: string
          tenant_id: string
          total?: number
          user_id: string
          year: number
        }
        Update: {
          amount_received?: number
          charges?: number
          created_at?: string
          id?: string
          month?: number
          paid_date?: string | null
          period_end?: string
          period_start?: string
          property_id?: string
          rent_hc?: number
          status?: string
          tenant_id?: string
          total?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          check_in: string
          check_out: string
          cleaning_fees: number
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          nightly_rate: number
          nights: number
          notes: string | null
          platform: string
          platform_fees: number
          property_id: string
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string
          cleaning_fees?: number
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          nightly_rate?: number
          nights?: number
          notes?: string | null
          platform?: string
          platform_fees?: number
          property_id: string
          status?: string
          total_amount?: number
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string
          cleaning_fees?: number
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          nightly_rate?: number
          nights?: number
          notes?: string | null
          platform?: string
          platform_fees?: number
          property_id?: string
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          active_fiscal_year: number
          created_at: string
          id: string
          owner_name: string
          user_id: string
        }
        Insert: {
          active_fiscal_year?: number
          created_at?: string
          id?: string
          owner_name?: string
          user_id: string
        }
        Update: {
          active_fiscal_year?: number
          created_at?: string
          id?: string
          owner_name?: string
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          deposit: number
          email: string
          entry_date: string
          exit_date: string | null
          first_name: string
          id: string
          last_name: string
          monthly_charges: number
          monthly_rent_hc: number
          phone: string
          property_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit?: number
          email?: string
          entry_date?: string
          exit_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          monthly_charges?: number
          monthly_rent_hc?: number
          phone?: string
          property_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deposit?: number
          email?: string
          entry_date?: string
          exit_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          monthly_charges?: number
          monthly_rent_hc?: number
          phone?: string
          property_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
