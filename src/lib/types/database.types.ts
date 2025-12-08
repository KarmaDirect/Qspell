export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom types for complex queries
export type TournamentWithRelations = Database['public']['Tables']['tournaments']['Row'] & {
  organizer?: {
    username: string
    display_name: string | null
  }
  registrations?: Array<{ count: number }>
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          discord_username: string | null
          youtube_url: string | null
          twitch_url: string | null
          twitter_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          role: 'user' | 'admin' | 'moderator'
          is_banned: boolean
          ban_reason: string | null
          banned_until: string | null
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          discord_username?: string | null
          youtube_url?: string | null
          twitch_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          is_banned?: boolean
          ban_reason?: string | null
          banned_until?: string | null
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          discord_username?: string | null
          youtube_url?: string | null
          twitch_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          is_banned?: boolean
          ban_reason?: string | null
          banned_until?: string | null
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string | null
          target_user_id: string | null
          action_type: string
          action_details: Json | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          target_user_id?: string | null
          action_type: string
          action_details?: Json | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          target_user_id?: string | null
          action_type?: string
          action_details?: Json | null
          reason?: string | null
          created_at?: string
        }
      }
      riot_accounts: {
        Row: {
          id: string
          profile_id: string
          puuid: string
          game_name: string
          tag_line: string
          summoner_id: string | null
          account_id: string | null
          region: string
          is_primary: boolean
          verified: boolean
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          puuid: string
          game_name: string
          tag_line: string
          summoner_id?: string | null
          account_id?: string | null
          region: string
          is_primary?: boolean
          verified?: boolean
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          puuid?: string
          game_name?: string
          tag_line?: string
          summoner_id?: string | null
          account_id?: string | null
          region?: string
          is_primary?: boolean
          verified?: boolean
          last_updated?: string
          created_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          riot_account_id: string
          queue_type: string
          tier: string | null
          rank: string | null
          league_points: number | null
          wins: number | null
          losses: number | null
          champion_mastery: Json | null
          recent_performance: Json | null
          last_synced: string
        }
        Insert: {
          id?: string
          riot_account_id: string
          queue_type: string
          tier?: string | null
          rank?: string | null
          league_points?: number | null
          wins?: number | null
          losses?: number | null
          champion_mastery?: Json | null
          recent_performance?: Json | null
          last_synced?: string
        }
        Update: {
          id?: string
          riot_account_id?: string
          queue_type?: string
          tier?: string | null
          rank?: string | null
          league_points?: number | null
          wins?: number | null
          losses?: number | null
          champion_mastery?: Json | null
          recent_performance?: Json | null
          last_synced?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          banner_url: string | null
          organizer_id: string
          format: string
          game_mode: string
          team_size: number
          max_teams: number | null
          min_rank: string | null
          max_rank: string | null
          region: string[] | null
          prize_pool: string | null
          registration_start: string | null
          registration_end: string | null
          tournament_start: string | null
          tournament_end: string | null
          status: string
          rules: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          banner_url?: string | null
          organizer_id: string
          format: string
          game_mode: string
          team_size?: number
          max_teams?: number | null
          min_rank?: string | null
          max_rank?: string | null
          region?: string[] | null
          prize_pool?: string | null
          registration_start?: string | null
          registration_end?: string | null
          tournament_start?: string | null
          tournament_end?: string | null
          status?: string
          rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          banner_url?: string | null
          organizer_id?: string
          format?: string
          game_mode?: string
          team_size?: number
          max_teams?: number | null
          min_rank?: string | null
          max_rank?: string | null
          region?: string[] | null
          prize_pool?: string | null
          registration_start?: string | null
          registration_end?: string | null
          tournament_start?: string | null
          tournament_end?: string | null
          status?: string
          rules?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          tag: string
          logo_url: string | null
          captain_id: string
          description: string | null
          region: string | null
          average_rank: string | null
          looking_for_players: boolean
          recruitment_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tag: string
          logo_url?: string | null
          captain_id: string
          description?: string | null
          region?: string | null
          average_rank?: string | null
          looking_for_players?: boolean
          recruitment_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tag?: string
          logo_url?: string | null
          captain_id?: string
          description?: string | null
          region?: string | null
          average_rank?: string | null
          looking_for_players?: boolean
          recruitment_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          profile_id: string
          role: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          profile_id: string
          role?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          profile_id?: string
          role?: string | null
          joined_at?: string
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          status: string
          seed: number | null
          registered_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          status?: string
          seed?: number | null
          registered_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string
          status?: string
          seed?: number | null
          registered_at?: string
        }
      }
      tournament_matches: {
        Row: {
          id: string
          tournament_id: string
          round: number
          match_number: number | null
          team1_id: string | null
          team2_id: string | null
          winner_id: string | null
          score_team1: number
          score_team2: number
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          best_of: number
          status: string
          game_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round: number
          match_number?: number | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          score_team1?: number
          score_team2?: number
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          best_of?: number
          status?: string
          game_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round?: number
          match_number?: number | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
          score_team1?: number
          score_team2?: number
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          best_of?: number
          status?: string
          game_data?: Json | null
          created_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          description: string | null
          banner_url: string | null
          organizer_id: string
          season: number | null
          division: string | null
          format: string
          max_teams: number | null
          min_rank: string | null
          max_rank: string | null
          region: string[] | null
          season_start: string | null
          season_end: string | null
          status: string
          prizes: Json | null
          rules: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          banner_url?: string | null
          organizer_id: string
          season?: number | null
          division?: string | null
          format: string
          max_teams?: number | null
          min_rank?: string | null
          max_rank?: string | null
          region?: string[] | null
          season_start?: string | null
          season_end?: string | null
          status?: string
          prizes?: Json | null
          rules?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          banner_url?: string | null
          organizer_id?: string
          season?: number | null
          division?: string | null
          format?: string
          max_teams?: number | null
          min_rank?: string | null
          max_rank?: string | null
          region?: string[] | null
          season_start?: string | null
          season_end?: string | null
          status?: string
          prizes?: Json | null
          rules?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string | null
          message: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title?: string | null
          message?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string | null
          message?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      user_wallets: {
        Row: {
          id: string
          user_id: string
          qp_balance: number
          cash_balance: number
          total_qp_purchased: number
          total_cash_earned: number
          total_cash_withdrawn: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          qp_balance?: number
          cash_balance?: number
          total_qp_purchased?: number
          total_cash_earned?: number
          total_cash_withdrawn?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          qp_balance?: number
          cash_balance?: number
          total_qp_purchased?: number
          total_cash_earned?: number
          total_cash_withdrawn?: number
          created_at?: string
          updated_at?: string
        }
      }
      qp_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
          amount: number
          description: string | null
          reference_id: string | null
          reference_type: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
          amount: number
          description?: string | null
          reference_id?: string | null
          reference_type?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
          amount?: number
          description?: string | null
          reference_id?: string | null
          reference_type?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      cash_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'tournament_win' | 'withdrawal' | 'refund' | 'coaching_payout'
          amount: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          tournament_id: string | null
          withdrawal_request_id: string | null
          description: string | null
          metadata: Json
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'tournament_win' | 'withdrawal' | 'refund' | 'coaching_payout'
          amount: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          tournament_id?: string | null
          withdrawal_request_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'tournament_win' | 'withdrawal' | 'refund' | 'coaching_payout'
          amount?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          tournament_id?: string | null
          withdrawal_request_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          processed_at?: string | null
        }
      }
      qp_packages: {
        Row: {
          id: string
          name: string
          qp_amount: number
          price_eur: number
          bonus_qp: number
          is_active: boolean
          display_order: number
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          qp_amount: number
          price_eur: number
          bonus_qp?: number
          is_active?: boolean
          display_order?: number
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          qp_amount?: number
          price_eur?: number
          bonus_qp?: number
          is_active?: boolean
          display_order?: number
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'premium'
          price_monthly: number
          qp_monthly: number
          status: 'active' | 'cancelled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'premium'
          price_monthly?: number
          qp_monthly?: number
          status?: 'active' | 'cancelled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'premium'
          price_monthly?: number
          qp_monthly?: number
          status?: 'active' | 'cancelled' | 'expired' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_benefits: {
        Row: {
          id: string
          plan: 'premium'
          benefit_key: string
          benefit_value: Json
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan?: 'premium'
          benefit_key: string
          benefit_value: Json
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan?: 'premium'
          benefit_key?: string
          benefit_value?: Json
          description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          type: 'ai_analysis' | 'tournament_entry' | 'formation' | 'coaching_session' | 'cosmetic' | 'booster_xp'
          price_qp: number | null
          price_eur: number | null
          description: string | null
          is_available_free: boolean
          is_available_premium: boolean
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'ai_analysis' | 'tournament_entry' | 'formation' | 'coaching_session' | 'cosmetic' | 'booster_xp'
          price_qp?: number | null
          price_eur?: number | null
          description?: string | null
          is_available_free?: boolean
          is_available_premium?: boolean
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'ai_analysis' | 'tournament_entry' | 'formation' | 'coaching_session' | 'cosmetic' | 'booster_xp'
          price_qp?: number | null
          price_eur?: number | null
          description?: string | null
          is_available_free?: boolean
          is_available_premium?: boolean
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tournament_entries: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          entry_fee_qp: number
          status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
          qp_transaction_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          entry_fee_qp: number
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
          qp_transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string
          entry_fee_qp?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
          qp_transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      tournament_prize_pool: {
        Row: {
          id: string
          tournament_id: string
          total_pool: number
          distribution: Json
          paid_out: boolean
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          total_pool?: number
          distribution?: Json
          paid_out?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          total_pool?: number
          distribution?: Json
          paid_out?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      withdrawal_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          platform_fee: number
          net_amount: number
          method: 'paypal' | 'bank' | 'gift_card'
          details: Json
          status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
          admin_notes: string | null
          kyc_required: boolean
          kyc_verified: boolean
          created_at: string
          processed_at: string | null
          processed_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          platform_fee: number
          net_amount: number
          method: 'paypal' | 'bank' | 'gift_card'
          details: Json
          status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
          admin_notes?: string | null
          kyc_required?: boolean
          kyc_verified?: boolean
          created_at?: string
          processed_at?: string | null
          processed_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          platform_fee?: number
          net_amount?: number
          method?: 'paypal' | 'bank' | 'gift_card'
          details?: Json
          status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
          admin_notes?: string | null
          kyc_required?: boolean
          kyc_verified?: boolean
          created_at?: string
          processed_at?: string | null
          processed_by?: string | null
        }
      }
      formation_purchases: {
        Row: {
          id: string
          formation_id: string
          user_id: string
          price_qp: number | null
          qp_transaction_id: string | null
          is_premium_access: boolean
          purchased_at: string
        }
        Insert: {
          id?: string
          formation_id: string
          user_id: string
          price_qp?: number | null
          qp_transaction_id?: string | null
          is_premium_access?: boolean
          purchased_at?: string
        }
        Update: {
          id?: string
          formation_id?: string
          user_id?: string
          price_qp?: number | null
          qp_transaction_id?: string | null
          is_premium_access?: boolean
          purchased_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debit_qp: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
          p_description?: string | null
          p_reference_id?: string | null
          p_reference_type?: string | null
        }
        Returns: string
      }
      credit_qp: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
          p_description?: string | null
          p_reference_id?: string | null
          p_reference_type?: string | null
        }
        Returns: string
      }
      credit_cash: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: 'tournament_win' | 'withdrawal' | 'refund' | 'coaching_payout'
          p_description?: string | null
          p_tournament_id?: string | null
        }
        Returns: string
      }
      debit_cash: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: boolean
      }
      has_premium_subscription: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      calculate_qp_bonus: {
        Args: {
          p_price_eur: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
