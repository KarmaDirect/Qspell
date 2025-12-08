import { NextRequest, NextResponse } from 'next/server'
import { getQPPackages } from '@/lib/economy/wallet'

/**
 * GET /api/economy/qp/packages
 * Récupère les packs QP disponibles
 */
export async function GET(req: NextRequest) {
  try {
    const packages = await getQPPackages()

    return NextResponse.json({ packages })
  } catch (error: any) {
    console.error('Error fetching QP packages:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
