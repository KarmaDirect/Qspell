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
