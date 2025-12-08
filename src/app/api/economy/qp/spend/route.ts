import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { debitQP, hasPremiumSubscription, getUserWallet } from '@/lib/economy/wallet'
import { ECONOMY_CONSTANTS } from '@/lib/economy/wallet'

/**
 * POST /api/economy/qp/spend
 * Dépense des QP pour un service (analyse IA, tournoi, etc.)
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

    const { type, referenceId, referenceType, description } = await req.json()

    if (!type || !referenceType) {
      return NextResponse.json(
        { error: 'Type et référence requis' },
        { status: 400 }
      )
    }

    // Déterminer le coût selon le type
    let cost = 0
    let isPremiumFree = false

    switch (type) {
      case 'ai_analysis':
        cost = ECONOMY_CONSTANTS.AI_ANALYSIS_COST
        isPremiumFree = await hasPremiumSubscription(user.id)
        break
      case 'tournament_entry':
        // Le coût doit être passé dans la requête ou récupéré depuis le tournoi
        if (!referenceId) {
          return NextResponse.json(
            { error: 'ID du tournoi requis' },
            { status: 400 }
          )
        }
        // Récupérer le coût depuis le tournoi ou le produit
        const { data: product } = await supabase
          .from('products')
          .select('price_qp')
          .eq('type', 'tournament_entry')
          .eq('metadata->>tournament_id', referenceId)
          .single()
        
        if (product) {
          cost = product.price_qp || 0
        }
        break
      case 'formation':
        isPremiumFree = await hasPremiumSubscription(user.id)
        if (!isPremiumFree) {
          cost = ECONOMY_CONSTANTS.FORMATION_AVERAGE_COST
        }
        break
      default:
        return NextResponse.json(
          { error: 'Type de service non supporté' },
          { status: 400 }
        )
    }

    // Si Premium et gratuit, pas de débit
    if (isPremiumFree && (type === 'ai_analysis' || type === 'formation')) {
      return NextResponse.json({
        success: true,
        free: true,
        message: 'Service inclus dans votre abonnement Premium'
      })
    }

    if (cost <= 0) {
      return NextResponse.json(
        { error: 'Coût invalide' },
        { status: 400 }
      )
    }

    // Vérifier le solde
    const wallet = await getUserWallet(user.id)
    if (!wallet || wallet.qp_balance < cost) {
      return NextResponse.json(
        { error: 'Solde QP insuffisant' },
        { status: 400 }
      )
    }

    // Débiter
    const transactionId = await debitQP(
      user.id,
      cost,
      'spend',
      description || `Achat ${type}`,
      referenceId,
      referenceType
    )

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Échec de la transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId,
      remainingQP: (wallet.qp_balance - cost)
    })
  } catch (error: any) {
    console.error('Error spending QP:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
