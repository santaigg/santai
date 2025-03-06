export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      spectre_player: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      spectre_player_account: {
        Row: {
          id: string
          player_id: string
          provider_type: string
          account_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          player_id: string
          provider_type: string
          account_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          provider_type?: string
          account_id?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      spectre_player_stats: {
        Row: {
          id: string
          player_id: string
          mmr: number | null
          rank: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          player_id: string
          mmr?: number | null
          rank?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          mmr?: number | null
          rank?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      // Add more tables as needed
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
  }
} 