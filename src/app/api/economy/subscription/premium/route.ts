import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { creditQP } from '@/lib/economy/wallet'
import { ECONOMY_CONSTANTS } from '@/lib/economy/wallet'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

/**
 * POST /api/economy/subscription/premium
 * Crée un abonnement Premium via Stripe
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

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .single()

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement Premium actif' },
        { status: 400 }
      )
    }

    // Créer ou récupérer le customer Stripe
    let customerId: string

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Chercher un customer existant
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    })

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      // Créer un nouveau customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Créer la session Stripe Checkout pour l'abonnement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'QSPELL Premium',
              description: 'Abonnement Premium mensuel - Formations illimitées, 500 QP/mois, réductions coaching',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: Math.round(ECONOMY_CONSTANTS.PREMIUM_PRICE * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/dashboard/wallet?subscription=success`,
      cancel_url: `${req.nextUrl.origin}/dashboard/wallet?subscription=canceled`,
      client_reference_id: user.id,
      metadata: {
        plan: 'premium',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/economy/subscription/premium
 * Récupère l'abonnement Premium actif de l'utilisateur
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

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ subscription: subscription || null })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
