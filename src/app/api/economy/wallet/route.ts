import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserWallet } from '@/lib/economy/wallet'

/**
 * GET /api/economy/wallet
 * Récupère le wallet de l'utilisateur actuel
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

    const wallet = await getUserWallet(user.id)

    if (!wallet) {
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
