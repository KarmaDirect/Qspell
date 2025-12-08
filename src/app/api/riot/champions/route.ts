import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getTopChampions, type RiotRegion } from '@/lib/riot-api/client'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']
type PlayerStats = Database['public']['Tables']['player_stats']['Row']

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const riotAccountId = searchParams.get('riotAccountId')

    if (!riotAccountId) {
      return NextResponse.json({ error: 'Riot account ID required' }, { status: 400 })
    }

    // Fetch riot account
    const { data: riotAccount, error: accountError } = await supabase
      .from('riot_accounts')
      .select('*')
      .eq('id', riotAccountId)
      .eq('profile_id', user.id)
      .single() as { data: RiotAccount | null; error: any }

    if (accountError || !riotAccount) {
      return NextResponse.json({ error: 'Riot account not found' }, { status: 404 })
    }

    if (!riotAccount.puuid || !riotAccount.region) {
      return NextResponse.json({ error: 'Invalid riot account data' }, { status: 400 })
    }

    // Try cached mastery stored in player_stats to avoid unnecessary Riot calls
    const { data: statsRow } = await supabase
      .from('player_stats')
      .select('champion_mastery')
      .eq('riot_account_id', riotAccount.id)
      .maybeSingle() as { data: Pick<PlayerStats, 'champion_mastery'> | null }

    if (statsRow?.champion_mastery) {
      return NextResponse.json({ champions: statsRow.champion_mastery })
    }

    // Fetch top champions from Riot API
    const champions = await getTopChampions(
      riotAccount.puuid,
      riotAccount.region as RiotRegion,
      5
    )

    // Cache in player_stats for future calls (best-effort)
    await supabase
      .from('player_stats')
      .update({ champion_mastery: champions as any })
      .eq('riot_account_id', riotAccount.id)

    return NextResponse.json({ champions })
  } catch (error: any) {
    console.error('Error fetching champions:', error)
    if (error?.message?.includes('Riot API key not configured')) {
      return NextResponse.json(
        { error: 'Clé Riot manquante. Configurez RIOT_API_KEY (clé personnelle).' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch champions' },
      { status: 500 }
    )
  }
}

