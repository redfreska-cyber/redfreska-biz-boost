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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          codigo_referido: string | null
          correo: string | null
          estado: string | null
          fecha_registro: string
          id: string
          nombre: string
          premio_id: string | null
          restaurante_id: string
          telefono: string | null
        }
        Insert: {
          codigo_referido?: string | null
          correo?: string | null
          estado?: string | null
          fecha_registro?: string
          id?: string
          nombre: string
          premio_id?: string | null
          restaurante_id: string
          telefono?: string | null
        }
        Update: {
          codigo_referido?: string | null
          correo?: string | null
          estado?: string | null
          fecha_registro?: string
          id?: string
          nombre?: string
          premio_id?: string | null
          restaurante_id?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_premio_id_fkey"
            columns: ["premio_id"]
            isOneToOne: false
            referencedRelation: "premios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversiones: {
        Row: {
          cliente_id: string
          codigo_referente: string | null
          dni_referido: string | null
          estado: string | null
          fecha_conversion: string
          id: string
          referido_id: string | null
          registrar_consumo: boolean | null
          restaurante_id: string
        }
        Insert: {
          cliente_id: string
          codigo_referente?: string | null
          dni_referido?: string | null
          estado?: string | null
          fecha_conversion?: string
          id?: string
          referido_id?: string | null
          registrar_consumo?: boolean | null
          restaurante_id: string
        }
        Update: {
          cliente_id?: string
          codigo_referente?: string | null
          dni_referido?: string | null
          estado?: string | null
          fecha_conversion?: string
          id?: string
          referido_id?: string | null
          registrar_consumo?: boolean | null
          restaurante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversiones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversiones_referido_id_fkey"
            columns: ["referido_id"]
            isOneToOne: false
            referencedRelation: "referidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversiones_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          caracteristicas: Json | null
          created_at: string
          descripcion: string | null
          id: string
          is_active: boolean
          moneda: string
          nombre: string
          precio_mensual: number
        }
        Insert: {
          caracteristicas?: Json | null
          created_at?: string
          descripcion?: string | null
          id?: string
          is_active?: boolean
          moneda?: string
          nombre: string
          precio_mensual: number
        }
        Update: {
          caracteristicas?: Json | null
          created_at?: string
          descripcion?: string | null
          id?: string
          is_active?: boolean
          moneda?: string
          nombre?: string
          precio_mensual?: number
        }
        Relationships: []
      }
      premios: {
        Row: {
          created_at: string
          descripcion: string
          detalle_premio: string | null
          id: string
          imagen_url: string | null
          is_active: boolean
          monto_minimo_consumo: number | null
          orden: number
          restaurante_id: string
          tipo_premio: string
          umbral: number
        }
        Insert: {
          created_at?: string
          descripcion: string
          detalle_premio?: string | null
          id?: string
          imagen_url?: string | null
          is_active?: boolean
          monto_minimo_consumo?: number | null
          orden?: number
          restaurante_id: string
          tipo_premio: string
          umbral: number
        }
        Update: {
          created_at?: string
          descripcion?: string
          detalle_premio?: string | null
          id?: string
          imagen_url?: string | null
          is_active?: boolean
          monto_minimo_consumo?: number | null
          orden?: number
          restaurante_id?: string
          tipo_premio?: string
          umbral?: number
        }
        Relationships: [
          {
            foreignKeyName: "premios_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      referidos: {
        Row: {
          cliente_owner_id: string
          cliente_referido_id: string | null
          codigo_referido: string
          consumo_realizado: boolean | null
          created_at: string
          dni_referido: string | null
          fecha_registro: string | null
          id: string
          restaurante_id: string
        }
        Insert: {
          cliente_owner_id: string
          cliente_referido_id?: string | null
          codigo_referido: string
          consumo_realizado?: boolean | null
          created_at?: string
          dni_referido?: string | null
          fecha_registro?: string | null
          id?: string
          restaurante_id: string
        }
        Update: {
          cliente_owner_id?: string
          cliente_referido_id?: string | null
          codigo_referido?: string
          consumo_realizado?: boolean | null
          created_at?: string
          dni_referido?: string | null
          fecha_registro?: string | null
          id?: string
          restaurante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referidos_cliente_owner_id_fkey"
            columns: ["cliente_owner_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referidos_cliente_referido_id_fkey"
            columns: ["cliente_referido_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referidos_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurantes: {
        Row: {
          contrasena_hash: string | null
          correo: string | null
          correo_contacto: string | null
          created_at: string
          direccion: string | null
          estado_suscripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          plan_actual: string | null
          ruc: string | null
          slug: string | null
          telefono: string | null
        }
        Insert: {
          contrasena_hash?: string | null
          correo?: string | null
          correo_contacto?: string | null
          created_at?: string
          direccion?: string | null
          estado_suscripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          plan_actual?: string | null
          ruc?: string | null
          slug?: string | null
          telefono?: string | null
        }
        Update: {
          contrasena_hash?: string | null
          correo?: string | null
          correo_contacto?: string | null
          created_at?: string
          direccion?: string | null
          estado_suscripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          plan_actual?: string | null
          ruc?: string | null
          slug?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          created_at: string
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          monto_pagado: number | null
          restaurante_id: string
        }
        Insert: {
          created_at?: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          monto_pagado?: number | null
          restaurante_id: string
        }
        Update: {
          created_at?: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          monto_pagado?: number | null
          restaurante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          ip_address: string | null
          log_type: Database["public"]["Enums"]["log_type"]
          metadata: Json | null
          restaurante_id: string | null
          severity: string | null
          title: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string | null
          log_type: Database["public"]["Enums"]["log_type"]
          metadata?: Json | null
          restaurante_id?: string | null
          severity?: string | null
          title: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string | null
          log_type?: Database["public"]["Enums"]["log_type"]
          metadata?: Json | null
          restaurante_id?: string | null
          severity?: string | null
          title?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          restaurante_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurante_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurante_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          correo: string | null
          created_at: string
          estado: string | null
          id: string
          nombre: string
          restaurante_id: string
          rol: string | null
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nombre: string
          restaurante_id: string
          rol?: string | null
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          nombre?: string
          restaurante_id?: string
          rol?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_generales: {
        Row: {
          contrasena: string
          correo: string
          created_at: string | null
          estado: string | null
          id: string
          nombre: string
          restaurante_id: string | null
          rol: string | null
        }
        Insert: {
          contrasena: string
          correo: string
          created_at?: string | null
          estado?: string | null
          id?: string
          nombre: string
          restaurante_id?: string | null
          rol?: string | null
        }
        Update: {
          contrasena?: string
          correo?: string
          created_at?: string | null
          estado?: string | null
          id?: string
          nombre?: string
          restaurante_id?: string | null
          rol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_generales_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      validaciones: {
        Row: {
          cliente_id: string
          conversiones_realizadas: number | null
          fecha_validacion: string
          id: string
          motivo: string | null
          premio_id: string | null
          validado: boolean | null
        }
        Insert: {
          cliente_id: string
          conversiones_realizadas?: number | null
          fecha_validacion?: string
          id?: string
          motivo?: string | null
          premio_id?: string | null
          validado?: boolean | null
        }
        Update: {
          cliente_id?: string
          conversiones_realizadas?: number | null
          fecha_validacion?: string
          id?: string
          motivo?: string | null
          premio_id?: string | null
          validado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "validaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validaciones_premio_id_fkey"
            columns: ["premio_id"]
            isOneToOne: false
            referencedRelation: "premios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_system_log: {
        Args: {
          p_description?: string
          p_ip_address?: string
          p_log_type: Database["public"]["Enums"]["log_type"]
          p_metadata?: Json
          p_restaurante_id?: string
          p_severity?: string
          p_title: string
          p_user_agent?: string
          p_user_email?: string
          p_user_id?: string
        }
        Returns: string
      }
      get_user_restaurante_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "empleado" | "superadmin"
      log_type:
        | "auth_login"
        | "auth_logout"
        | "auth_failed"
        | "restaurant_created"
        | "restaurant_updated"
        | "restaurant_suspended"
        | "restaurant_reactivated"
        | "user_created"
        | "user_updated"
        | "user_role_changed"
        | "user_deleted"
        | "subscription_created"
        | "subscription_updated"
        | "subscription_cancelled"
        | "payment_received"
        | "payment_failed"
        | "plan_created"
        | "plan_updated"
        | "config_updated"
        | "report_generated"
        | "data_exported"
        | "system_maintenance"
        | "security_alert"
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
      app_role: ["admin", "empleado", "superadmin"],
      log_type: [
        "auth_login",
        "auth_logout",
        "auth_failed",
        "restaurant_created",
        "restaurant_updated",
        "restaurant_suspended",
        "restaurant_reactivated",
        "user_created",
        "user_updated",
        "user_role_changed",
        "user_deleted",
        "subscription_created",
        "subscription_updated",
        "subscription_cancelled",
        "payment_received",
        "payment_failed",
        "plan_created",
        "plan_updated",
        "config_updated",
        "report_generated",
        "data_exported",
        "system_maintenance",
        "security_alert",
      ],
    },
  },
} as const
