import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserWallet, debitCash } from '@/lib/economy/wallet'
import { ECONOMY_CONSTANTS } from '@/lib/economy/wallet'

/**
 * POST /api/economy/withdrawal/request
 * Crée une demande de retrait
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

    const { amount, method, details } = await req.json()

    if (!amount || !method || !details) {
      return NextResponse.json(
        { error: 'Montant, méthode et détails requis' },
        { status: 400 }
      )
    }

    // Vérifier le minimum
    if (amount < ECONOMY_CONSTANTS.MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Montant minimum: ${ECONOMY_CONSTANTS.MIN_WITHDRAWAL}€` },
        { status: 400 }
      )
    }

    // Vérifier le maximum mensuel
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('processed_at', startOfMonth.toISOString())

    const monthlyTotal = monthlyWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0

    if (monthlyTotal + amount > ECONOMY_CONSTANTS.MAX_WITHDRAWAL_MONTHLY) {
      return NextResponse.json(
        { error: `Limite mensuelle atteinte: ${ECONOMY_CONSTANTS.MAX_WITHDRAWAL_MONTHLY}€` },
        { status: 400 }
      )
    }

    // Vérifier le solde
    const wallet = await getUserWallet(user.id)
    if (!wallet || wallet.cash_balance < amount) {
      return NextResponse.json(
        { error: 'Solde insuffisant' },
        { status: 400 }
      )
    }

    // Calculer les frais
    const platformFee = amount * (ECONOMY_CONSTANTS.PLATFORM_FEE_PERCENT / 100)
    const netAmount = amount - platformFee

    // Vérifier si KYC requis (> 100€)
    const kycRequired = amount > 100

    // Créer la demande
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        method,
        details,
        kyc_required: kycRequired,
        status: 'pending',
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating withdrawal request:', requestError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la demande' },
        { status: 500 }
      )
    }

    // Débiter le wallet (le cash sera remboursé si la demande est rejetée)
    const debitSuccess = await debitCash(user.id, amount)

    if (!debitSuccess) {
      // Annuler la demande si le débit échoue
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled' })
        .eq('id', withdrawalRequest.id)

      return NextResponse.json(
        { error: 'Échec du débit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      withdrawalRequest,
      message: kycRequired 
        ? 'Votre demande a été créée. Une vérification KYC sera requise.'
        : 'Votre demande a été créée et sera traitée sous 2-5 jours ouvrés.'
    })
  } catch (error: any) {
    console.error('Error creating withdrawal request:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/economy/withdrawal/request
 * Récupère les demandes de retrait de l'utilisateur
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

    const { data: requests, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error fetching withdrawal requests:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
