import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { creditQP } from '@/lib/economy/wallet'
import { ECONOMY_CONSTANTS } from '@/lib/economy/wallet'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/economy/subscription/webhook
 * Webhook Stripe pour gérer les événements d'abonnement
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

    const supabase = await createServerClient()

    // Traiter les événements d'abonnement
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const userId = session.client_reference_id

          if (!userId || !subscriptionId) {
            console.error('Missing userId or subscriptionId')
            break
          }

          // Récupérer les détails de l'abonnement
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Créer ou mettre à jour l'abonnement dans la DB
          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: 'premium',
              price_monthly: ECONOMY_CONSTANTS.PREMIUM_PRICE,
              qp_monthly: ECONOMY_CONSTANTS.PREMIUM_QP_MONTHLY,
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: subscription.customer as string,
            }, {
              onConflict: 'user_id'
            })

          if (subError) {
            console.error('Error creating subscription:', subError)
            break
          }

          // Créditer les QP mensuels immédiatement
          await creditQP(
            userId,
            ECONOMY_CONSTANTS.PREMIUM_QP_MONTHLY,
            'subscription_bonus',
            'QP mensuel Premium',
            subscriptionId,
            'subscription'
          )

          console.log(`✅ Premium subscription activated for user ${userId}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Récupérer l'abonnement depuis Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Récupérer l'abonnement depuis la DB
        const { data: dbSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (!dbSubscription) break

        // Mettre à jour les dates de période
        await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbSubscription.id)

        // Créditer les QP mensuels
        await creditQP(
          dbSubscription.user_id,
          ECONOMY_CONSTANTS.PREMIUM_QP_MONTHLY,
          'subscription_bonus',
          'QP mensuel Premium (renouvellement)',
          subscriptionId,
          'subscription'
        )

        console.log(`✅ Premium subscription renewed for user ${dbSubscription.user_id}`)
        break
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Mettre à jour le statut dans la DB
        const status = subscription.status === 'active' ? 'active' :
                      subscription.status === 'canceled' ? 'cancelled' :
                      subscription.status === 'past_due' ? 'past_due' : 'expired'

        await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`✅ Subscription ${subscription.id} updated to status: ${status}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing subscription webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
