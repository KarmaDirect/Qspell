import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { creditQP, debitQP, creditCash, debitCash } from '@/lib/economy/wallet'

/**
 * POST /api/admin/economy/wallet/manage
 * API Admin pour gérer les wallets (créditer/débiter QP et Cash sans Stripe)
 * Réservé aux admins/CEO pour les tests
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

    // Vérifier que l'utilisateur est admin ou CEO
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Accès refusé - Admin/CEO requis' },
        { status: 403 }
      )
    }

    const { 
      targetUserId, 
      action, // 'credit_qp', 'debit_qp', 'credit_cash', 'debit_cash'
      amount,
      description,
      referenceId,
      referenceType
    } = await req.json()

    if (!targetUserId || !action || !amount) {
      return NextResponse.json(
        { error: 'targetUserId, action et amount requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur cible existe
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', targetUserId)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur cible non trouvé' },
        { status: 404 }
      )
    }

    let transactionId: string | null = null
    const adminDescription = description || `Action admin: ${action} par ${profile.email}`

    // Exécuter l'action
    switch (action) {
      case 'credit_qp':
        transactionId = await creditQP(
          targetUserId,
          amount,
          'gift',
          adminDescription,
          referenceId,
          referenceType || 'admin_action'
        )
        break

      case 'debit_qp':
        transactionId = await debitQP(
          targetUserId,
          amount,
          'spend',
          adminDescription,
          referenceId,
          referenceType || 'admin_action'
        )
        break

      case 'credit_cash':
        transactionId = await creditCash(
          targetUserId,
          amount,
          'tournament_win',
          adminDescription
        )
        break

      case 'debit_cash':
        const success = await debitCash(targetUserId, amount)
        if (!success) {
          return NextResponse.json(
            { error: 'Solde insuffisant' },
            { status: 400 }
          )
        }
        transactionId = 'debit_success'
        break

      default:
        return NextResponse.json(
          { error: 'Action invalide. Actions: credit_qp, debit_qp, credit_cash, debit_cash' },
          { status: 400 }
        )
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Échec de la transaction' },
        { status: 500 }
      )
    }

    // Logger l'action admin
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'economy_manage',
        target_type: 'wallet',
        target_id: targetUserId,
        details: {
          action,
          amount,
          description: adminDescription,
          transaction_id: transactionId
        }
      })

    // Récupérer le wallet mis à jour
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    return NextResponse.json({
      success: true,
      transactionId,
      wallet,
      message: `Action ${action} effectuée avec succès`
    })
  } catch (error: any) {
    console.error('Error managing wallet:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/economy/wallet/manage
 * Récupère le wallet d'un utilisateur (admin)
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

    const searchParams = req.nextUrl.searchParams
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    const { data: wallet, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Wallet non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ wallet })
  } catch (error: any) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
