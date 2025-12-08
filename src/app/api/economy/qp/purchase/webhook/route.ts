import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { creditQP } from '@/lib/economy/wallet'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/economy/qp/purchase/webhook
 * Webhook Stripe pour traiter les paiements réussis
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Traiter l'événement
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.client_reference_id
      const packageId = session.metadata?.package_id
      const totalQP = parseInt(session.metadata?.total_qp || '0')
      const qpAmount = parseInt(session.metadata?.qp_amount || '0')
      const bonusQP = parseInt(session.metadata?.bonus_qp || '0')

      if (!userId || !packageId || !totalQP) {
        console.error('Missing metadata in Stripe session')
        return NextResponse.json(
          { error: 'Metadata manquante' },
          { status: 400 }
        )
      }

      // Créditer les QP à l'utilisateur
      const transactionId = await creditQP(
        userId,
        totalQP,
        'purchase',
        `Achat Pack QP - ${qpAmount} QP + ${bonusQP} QP bonus`,
        packageId,
        'qp_package'
      )

      if (!transactionId) {
        console.error('Failed to credit QP')
        return NextResponse.json(
          { error: 'Échec du crédit QP' },
          { status: 500 }
        )
      }

      console.log(`✅ QP credited: ${totalQP} QP to user ${userId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
