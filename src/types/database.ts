/**
 * Database types for Supabase
 *
 * This file should be generated from Supabase schema using:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * For now, this is a placeholder structure based on the planned schema.
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'free' | 'pro' | 'team';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          credits_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'free' | 'pro' | 'team';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          audio_name: string;
          file_size_bytes: number;
          audio_url: string | null;
          duration_seconds: number | null;
          language: string;
          content_type: string;
          processing_mode: string | null;
          noise_profile: string | null;
          selection_mode: 'full' | 'selection' | null;
          region_start: number | null;
          region_end: number | null;
          transcript: string | null;
          summary: string | null;
          chat_history: unknown; // JSONB
          ai_config: unknown; // JSONB
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          audio_name: string;
          file_size_bytes: number;
          audio_url?: string | null;
          duration_seconds?: number | null;
          language: string;
          content_type: string;
          processing_mode?: string | null;
          noise_profile?: string | null;
          selection_mode?: 'full' | 'selection' | null;
          region_start?: number | null;
          region_end?: number | null;
          transcript?: string | null;
          summary?: string | null;
          chat_history?: unknown;
          ai_config?: unknown;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      usage_events: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          event_type: 'transcription' | 'summarization' | 'chat';
          audio_duration_seconds: number | null;
          transcript_chars: number | null;
          message_chars: number | null;
          credits_consumed: number;
          minutes_consumed: number;
          provider: string;
          model: string | null;
          billing_period: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          event_type: 'transcription' | 'summarization' | 'chat';
          audio_duration_seconds?: number | null;
          transcript_chars?: number | null;
          message_chars?: number | null;
          credits_consumed?: number;
          minutes_consumed?: number;
          provider: string;
          model?: string | null;
          billing_period: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['usage_events']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
