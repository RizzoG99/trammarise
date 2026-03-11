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
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'free' | 'pro';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          credits_balance: number;
          minutes_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'free' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          credits_balance?: number;
          minutes_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'free' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          credits_balance?: number;
          minutes_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          chat_history: unknown;
          ai_config: unknown;
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
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          audio_name?: string;
          file_size_bytes?: number;
          audio_url?: string | null;
          duration_seconds?: number | null;
          language?: string;
          content_type?: string;
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
        Relationships: [];
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
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          event_type?: 'transcription' | 'summarization' | 'chat';
          audio_duration_seconds?: number | null;
          transcript_chars?: number | null;
          message_chars?: number | null;
          credits_consumed?: number;
          minutes_consumed?: number;
          provider?: string;
          model?: string | null;
          billing_period?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: 'purchase' | 'deduction' | 'refund' | 'bonus';
          credits_amount: number;
          balance_after: number;
          stripe_payment_intent_id: string | null;
          amount_paid_cents: number | null;
          usage_event_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: 'purchase' | 'deduction' | 'refund' | 'bonus';
          credits_amount: number;
          balance_after: number;
          stripe_payment_intent_id?: string | null;
          amount_paid_cents?: number | null;
          usage_event_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: 'purchase' | 'deduction' | 'refund' | 'bonus';
          credits_amount?: number;
          balance_after?: number;
          stripe_payment_intent_id?: string | null;
          amount_paid_cents?: number | null;
          usage_event_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          openai_api_key_encrypted: string | null;
          onboarding_use_case: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          openai_api_key_encrypted?: string | null;
          onboarding_use_case?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          openai_api_key_encrypted?: string | null;
          onboarding_use_case?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_minutes_used: {
        Args: { sub_id: string; minutes: number };
        Returns: void;
      };
      add_credits: {
        Args: {
          sub_id: string;
          credits: number;
          stripe_payment_intent_id: string;
          amount_paid_cents: number;
          p_description: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}
