import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/economy/stats
 * Récupère toutes les métriques économiques pour le dashboard admin
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

    // 1. Total QP en circulation
    const { data: qpTotal } = await supabase
      .from('user_wallets')
      .select('qp_balance')
    
    const totalQP = qpTotal?.reduce((sum, w) => sum + (w.qp_balance || 0), 0) || 0

    // 2. Total Cash en wallets
    const { data: cashTotal } = await supabase
      .from('user_wallets')
      .select('cash_balance')
    
    const totalCash = cashTotal?.reduce((sum, w) => sum + parseFloat(w.cash_balance?.toString() || '0'), 0) || 0

    // 3. QP acheté vs dépensé
    const { data: qpPurchased } = await supabase
      .from('user_wallets')
      .select('total_qp_purchased')
    
    const totalQPPurchased = qpPurchased?.reduce((sum, w) => sum + (w.total_qp_purchased || 0), 0) || 0

    const { data: qpSpent } = await supabase
      .from('qp_transactions')
      .select('amount')
      .eq('type', 'spend')
    
    const totalQPSpent = Math.abs(qpSpent?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0)
    const qpRatio = totalQPPurchased > 0 ? (totalQPSpent / totalQPPurchased) * 100 : 0

    // 4. Cash gagné vs retiré
    const { data: cashEarned } = await supabase
      .from('user_wallets')
      .select('total_cash_earned')
    
    const totalCashEarned = cashEarned?.reduce((sum, w) => sum + parseFloat(w.total_cash_earned?.toString() || '0'), 0) || 0

    const { data: cashWithdrawn } = await supabase
      .from('user_wallets')
      .select('total_cash_withdrawn')
    
    const totalCashWithdrawn = cashWithdrawn?.reduce((sum, w) => sum + parseFloat(w.total_cash_withdrawn?.toString() || '0'), 0) || 0
    const cashRatio = totalCashEarned > 0 ? (totalCashWithdrawn / totalCashEarned) * 100 : 0

    // 5. Revenus par source
    const { data: qpTransactions } = await supabase
      .from('qp_transactions')
      .select('type, amount')
      .eq('type', 'purchase')
    
    const revenueQP = qpTransactions?.reduce((sum, t) => {
      // Estimer le prix : 100 QP ≈ 1€ (approximation)
      return sum + (Math.abs(t.amount || 0) / 100)
    }, 0) || 0

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('price_monthly, status')
      .eq('status', 'active')
    
    const revenueSubscriptions = subscriptions?.reduce((sum, s) => sum + parseFloat(s.price_monthly?.toString() || '0'), 0) || 0

    // 6. Marge par service (estimation)
    const { data: qpSpentByType } = await supabase
      .from('qp_transactions')
      .select('reference_type, amount')
      .eq('type', 'spend')
    
    const serviceStats: Record<string, { spent: number; count: number }> = {}
    qpSpentByType?.forEach(t => {
      const type = t.reference_type || 'other'
      if (!serviceStats[type]) {
        serviceStats[type] = { spent: 0, count: 0 }
      }
      serviceStats[type].spent += Math.abs(t.amount || 0)
      serviceStats[type].count += 1
    })

    // 7. Statistiques des retraits
    const { data: withdrawals } = await supabase
      .from('withdrawal_requests')
      .select('status, amount, platform_fee')
    
    const withdrawalStats = {
      pending: withdrawals?.filter(w => w.status === 'pending').length || 0,
      processing: withdrawals?.filter(w => w.status === 'processing').length || 0,
      completed: withdrawals?.filter(w => w.status === 'completed').length || 0,
      totalPending: withdrawals?.filter(w => w.status === 'pending').reduce((sum, w) => sum + parseFloat(w.amount?.toString() || '0'), 0) || 0,
      totalFees: withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + parseFloat(w.platform_fee?.toString() || '0'), 0) || 0
    }

    // 8. Statistiques des tournois
    const { data: prizePools } = await supabase
      .from('tournament_prize_pool')
      .select('total_pool, paid_out')
    
    const tournamentStats = {
      totalPrizePools: prizePools?.reduce((sum, p) => sum + parseFloat(p.total_pool?.toString() || '0'), 0) || 0,
      paidOut: prizePools?.filter(p => p.paid_out).reduce((sum, p) => sum + parseFloat(p.total_pool?.toString() || '0'), 0) || 0,
      pending: prizePools?.filter(p => !p.paid_out).reduce((sum, p) => sum + parseFloat(p.total_pool?.toString() || '0'), 0) || 0
    }

    return NextResponse.json({
      metrics: {
        // Métriques principales
        totalQP,
        totalCash,
        totalQPPurchased,
        totalQPSpent,
        qpRatio: parseFloat(qpRatio.toFixed(2)),
        totalCashEarned,
        totalCashWithdrawn,
        cashRatio: parseFloat(cashRatio.toFixed(2)),
        
        // Revenus
        revenue: {
          qp: parseFloat(revenueQP.toFixed(2)),
          subscriptions: parseFloat(revenueSubscriptions.toFixed(2)),
          total: parseFloat((revenueQP + revenueSubscriptions).toFixed(2))
        },
        
        // Services
        services: serviceStats,
        
        // Retraits
        withdrawals: withdrawalStats,
        
        // Tournois
        tournaments: tournamentStats
      }
    })
  } catch (error: any) {
    console.error('Error fetching economy stats:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
