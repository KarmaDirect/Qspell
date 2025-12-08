import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCashTransactions } from '@/lib/economy/wallet'

/**
 * GET /api/economy/cash/transactions
 * Récupère l'historique des transactions Cash
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

    const transactions = await getCashTransactions(user.id, limit)

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('Error fetching cash transactions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
