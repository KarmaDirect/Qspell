import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getQPTransactions } from '@/lib/economy/wallet'

/**
 * GET /api/economy/qp/transactions
 * Récupère l'historique des transactions QP
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

    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const transactions = await getQPTransactions(user.id, limit)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('Error fetching QP transactions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
