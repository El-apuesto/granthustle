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
      profiles: {
        Row: {
          id: string
          email: string
          org_name: string
          ein_hash: string | null
          device_fingerprint: string | null
          eligibility: Json
          subscription_tier: 'free' | 'intro' | 'season_pass' | 'annual_pass'
          subscription_status: 'active' | 'cancelled' | 'expired'
          stripe_customer_id: string | null
          subscription_ends_at: string | null
          intro_converted_at: string | null
          monthly_matches_used: number
          matches_reset_at: string
          questionnaire_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          org_name: string
          ein_hash?: string | null
          device_fingerprint?: string | null
          eligibility?: Json
          subscription_tier?: 'free' | 'intro' | 'season_pass' | 'annual_pass'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          intro_converted_at?: string | null
          monthly_matches_used?: number
          matches_reset_at?: string
          questionnaire_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          org_name?: string
          ein_hash?: string | null
          device_fingerprint?: string | null
          eligibility?: Json
          subscription_tier?: 'free' | 'intro' | 'season_pass' | 'annual_pass'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          intro_converted_at?: string | null
          monthly_matches_used?: number
          matches_reset_at?: string
          questionnaire_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      grants: {
        Row: {
          id: string
          title: string
          funder_name: string
          funder_type: 'federal' | 'foundation' | 'corporate' | 'arts'
          description: string
          award_min: number
          award_max: number
          deadline: string | null
          is_rolling: boolean
          apply_url: string
          eligibility_criteria: Json
          countries: string[]
          states: string[] | null
          entity_types: string[] | null
          revenue_max: number | null
          fields: string[] | null
          demographics: string[] | null
          project_stages: string[] | null
          requires_fiscal_sponsor: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          funder_name: string
          funder_type: 'federal' | 'foundation' | 'corporate' | 'arts'
          description: string
          award_min?: number
          award_max?: number
          deadline?: string | null
          is_rolling?: boolean
          apply_url: string
          eligibility_criteria?: Json
          countries?: string[]
          states?: string[] | null
          entity_types?: string[] | null
          revenue_max?: number | null
          fields?: string[] | null
          demographics?: string[] | null
          project_stages?: string[] | null
          requires_fiscal_sponsor?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          funder_name?: string
          funder_type?: 'federal' | 'foundation' | 'corporate' | 'arts'
          description?: string
          award_min?: number
          award_max?: number
          deadline?: string | null
          is_rolling?: boolean
          apply_url?: string
          eligibility_criteria?: Json
          countries?: string[]
          states?: string[] | null
          entity_types?: string[] | null
          revenue_max?: number | null
          fields?: string[] | null
          demographics?: string[] | null
          project_stages?: string[] | null
          requires_fiscal_sponsor?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_grants: {
        Row: {
          id: string
          user_id: string
          grant_id: string
          status: 'saved' | 'in_progress' | 'submitted'
          notes: string | null
          reminder_30d: boolean
          reminder_14d: boolean
          reminder_7d: boolean
          reminder_3d: boolean
          reminder_1d: boolean
          saved_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grant_id: string
          status?: 'saved' | 'in_progress' | 'submitted'
          notes?: string | null
          reminder_30d?: boolean
          reminder_14d?: boolean
          reminder_7d?: boolean
          reminder_3d?: boolean
          reminder_1d?: boolean
          saved_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grant_id?: string
          status?: 'saved' | 'in_progress' | 'submitted'
          notes?: string | null
          reminder_30d?: boolean
          reminder_14d?: boolean
          reminder_7d?: boolean
          reminder_3d?: boolean
          reminder_1d?: boolean
          saved_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          grant_id: string
          template_type: 'federal' | 'foundation' | 'corporate' | 'arts'
          application_data: Json
          status: 'draft' | 'completed' | 'submitted'
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grant_id: string
          template_type: 'federal' | 'foundation' | 'corporate' | 'arts'
          application_data?: Json
          status?: 'draft' | 'completed' | 'submitted'
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grant_id?: string
          template_type?: 'federal' | 'foundation' | 'corporate' | 'arts'
          application_data?: Json
          status?: 'draft' | 'completed' | 'submitted'
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      abuse_log: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          ein_hash: string | null
          device_fingerprint: string | null
          stripe_card_fingerprint: string | null
          action: string
          blocked: boolean
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          ein_hash?: string | null
          device_fingerprint?: string | null
          stripe_card_fingerprint?: string | null
          action: string
          blocked?: boolean
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          ein_hash?: string | null
          device_fingerprint?: string | null
          stripe_card_fingerprint?: string | null
          action?: string
          blocked?: boolean
          reason?: string | null
          created_at?: string
        }
      }
    }
  }
}
