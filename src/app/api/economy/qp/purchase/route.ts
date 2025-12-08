import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

/**
 * POST /api/economy/qp/purchase
 * Crée une session Stripe Checkout pour l'achat de QP
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

    const { packageId } = await req.json()

    if (!packageId) {
      return NextResponse.json(
        { error: 'ID du pack requis' },
        { status: 400 }
      )
    }

    // Récupérer le pack
    const { data: package_, error: packageError } = await supabase
      .from('qp_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (packageError || !package_) {
      return NextResponse.json(
        { error: 'Pack non trouvé' },
        { status: 404 }
      )
    }

    const totalQP = package_.qp_amount + package_.bonus_qp

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Pack ${package_.name} - ${totalQP} QP`,
              description: `${package_.qp_amount} QP + ${package_.bonus_qp} QP bonus`,
            },
            unit_amount: Math.round(package_.price_eur * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/dashboard/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/dashboard/wallet?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        package_id: packageId,
        qp_amount: package_.qp_amount.toString(),
        bonus_qp: package_.bonus_qp.toString(),
        total_qp: totalQP.toString(),
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
