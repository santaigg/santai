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
      twitch_channels: {
        Row: {
          id: number
          username: string
          player_id: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string // ISO date string
          created_at: string // ISO date string
          updated_at: string // ISO date string
          auth_level: string // 'irc' or 'oauth'
        }
        Insert: {
          id?: number
          username: string
          player_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at: string | Date // ISO date string or Date object
          created_at?: string // ISO date string
          updated_at?: string // ISO date string
          auth_level?: string // 'irc' or 'oauth'
        }
        Update: {
          id?: number
          username?: string
          player_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | Date // ISO date string or Date object
          created_at?: string // ISO date string
          updated_at?: string // ISO date string
          auth_level?: string // 'irc' or 'oauth'
        }
      }
      twitch_bot_config: {
        Row: {
          id: number
          key: string
          value: string | null
          created_at: string // ISO date string
          updated_at: string // ISO date string
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
          created_at?: string // ISO date string
          updated_at?: string | Date // ISO date string or Date object
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
          created_at?: string // ISO date string
          updated_at?: string | Date // ISO date string or Date object
        }
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
  }
} 