import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { creditCash } from '@/lib/economy/wallet'

/**
 * POST /api/economy/tournament/prize
 * Distribue les prix d'un tournoi aux équipes gagnantes
 */
export async function POST(req: NextRequest) {
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

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin requis' },
        { status: 403 }
      )
    }

    const { tournamentId, rankings } = await req.json()

    if (!tournamentId || !rankings || !Array.isArray(rankings)) {
      return NextResponse.json(
        { error: 'Tournament ID et rankings requis' },
        { status: 400 }
      )
    }

    // Récupérer le prize pool
    const { data: prizePool, error: poolError } = await supabase
      .from('tournament_prize_pool')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single()

    if (poolError || !prizePool) {
      return NextResponse.json(
        { error: 'Prize pool non trouvé' },
        { status: 404 }
      )
    }

    if (prizePool.paid_out) {
      return NextResponse.json(
        { error: 'Les prix ont déjà été distribués' },
        { status: 400 }
      )
    }

    const distribution = prizePool.distribution as Record<string, number>
    const totalPool = parseFloat(prizePool.total_pool.toString())

    // Distribuer les prix
    const transactions = []

    for (const ranking of rankings) {
      const { teamId, position, memberIds } = ranking

      if (!teamId || !position || !memberIds || !Array.isArray(memberIds)) {
        continue
      }

      const percentage = distribution[position] || 0
      const teamPrize = totalPool * percentage
      const prizePerMember = teamPrize / memberIds.length

      // Distribuer à chaque membre de l'équipe
      for (const memberId of memberIds) {
        const transactionId = await creditCash(
          memberId,
          prizePerMember,
          'tournament_win',
          `Gain tournoi - Position ${position}`,
          tournamentId
        )

        if (transactionId) {
          transactions.push({
            userId: memberId,
            amount: prizePerMember,
            transactionId
          })
        }
      }
    }

    // Marquer le prize pool comme payé
    await supabase
      .from('tournament_prize_pool')
      .update({
        paid_out: true,
        paid_at: new Date().toISOString(),
      })
      .eq('id', prizePool.id)

    return NextResponse.json({
      success: true,
      transactions,
      totalDistributed: transactions.reduce((sum, t) => sum + t.amount, 0)
    })
  } catch (error: any) {
    console.error('Error distributing tournament prizes:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
