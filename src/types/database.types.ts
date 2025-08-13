export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: number
          created_at: string
          room_id: string | null
          start_date: string | null
          end_date: string | null
          guests: number | null
          total_price: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          room_id?: string | null
          start_date?: string | null
          end_date?: string | null
          guests?: number | null
          total_price?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          room_id?: string | null
          start_date?: string | null
          end_date?: string | null
          guests?: number | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          beds: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image: string | null
          name: string | null
          occupancy: number | null
          price: number | null
          size: string | null
          villa_id: number | null
        }
        Insert: {
          beds?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id: string
          image?: string | null
          name?: string | null
          occupancy?: number | null
          price?: number | null
          size?: string | null
          villa_id?: number | null
        }
        Update: {
          beds?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          name?: string | null
          occupancy?: number | null
          price?: number | null
          size?: string | null
          villa_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villas: {
        Row: {
          amenities: Json | null
          created_at: string | null
          description: string | null
          id: number
          images: string[] | null
          location: string | null
          name: string | null
          rating: number | null
          reviews: number | null
        }
        Insert: {
          amenities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          location?: string | null
          name?: string | null
          rating?: number | null
          reviews?: number | null
        }
        Update: {
          amenities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          location?: string | null
          name?: string | null
          rating?: number | null
          reviews?: number | null
        }
        Relationships: []
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never