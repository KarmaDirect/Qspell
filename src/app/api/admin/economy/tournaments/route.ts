import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/economy/tournaments
 * Récupère les statistiques économiques des tournois
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier admin/CEO
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Récupérer tous les prize pools avec les infos des tournois
    const { data: prizePools, error: poolsError } = await supabase
      .from('tournament_prize_pool')
      .select(`
        *,
        tournaments:tournament_id (
          id,
          name,
          status,
          tournament_start,
          tournament_end
        )
      `)
      .order('created_at', { ascending: false })

    if (poolsError) {
      throw poolsError
    }

    // Récupérer les entrées de tournois (revenus)
    const { data: entries, error: entriesError } = await supabase
      .from('tournament_entries')
      .select(`
        *,
        tournaments:tournament_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (entriesError) {
      throw entriesError
    }

    // Calculer les revenus par tournoi
    const tournamentRevenues: Record<string, {
      tournamentId: string
      tournamentName: string
      entries: number
      totalEntryFees: number
      prizePool: number
      revenue: number
    }> = {}

    entries?.forEach(entry => {
      const tournamentId = entry.tournament_id
      const tournament = entry.tournaments as any
      
      if (!tournamentRevenues[tournamentId]) {
        tournamentRevenues[tournamentId] = {
          tournamentId,
          tournamentName: tournament?.name || 'Tournoi inconnu',
          entries: 0,
          totalEntryFees: 0,
          prizePool: 0,
          revenue: 0
        }
      }
      
      tournamentRevenues[tournamentId].entries += 1
      tournamentRevenues[tournamentId].totalEntryFees += entry.entry_fee_qp || 0
    })

    // Ajouter les prize pools
    prizePools?.forEach(pool => {
      const tournamentId = pool.tournament_id
      const tournament = pool.tournaments as any
      
      if (tournamentRevenues[tournamentId]) {
        tournamentRevenues[tournamentId].prizePool = parseFloat(pool.total_pool?.toString() || '0')
        // Revenu = entrées - prize pool (marge plateforme)
        tournamentRevenues[tournamentId].revenue = 
          (tournamentRevenues[tournamentId].totalEntryFees / 100) - tournamentRevenues[tournamentId].prizePool
      }
    })

    // Statistiques globales
    const totalEntries = entries?.length || 0
    const totalEntryFees = entries?.reduce((sum, e) => sum + (e.entry_fee_qp || 0), 0) || 0
    const totalPrizePools = prizePools?.reduce((sum, p) => sum + parseFloat(p.total_pool?.toString() || '0'), 0) || 0
    const totalRevenue = (totalEntryFees / 100) - totalPrizePools

    return NextResponse.json({
      tournaments: Object.values(tournamentRevenues),
      stats: {
        totalEntries,
        totalEntryFees: totalEntryFees / 100, // Convertir en euros
        totalPrizePools,
        totalRevenue,
        activePrizePools: prizePools?.filter(p => !p.paid_out).length || 0
      },
      prizePools: prizePools?.map(p => ({
        ...p,
        tournament: p.tournaments
      }))
    })
  } catch (error: any) {
    console.error('Error fetching tournament stats:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
