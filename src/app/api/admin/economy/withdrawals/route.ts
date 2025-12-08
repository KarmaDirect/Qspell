import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/economy/withdrawals
 * Récupère toutes les demandes de retrait pour gestion admin
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
    const status = searchParams.get('status') // 'pending', 'processing', 'completed', etc.

    let query = supabase
      .from('withdrawal_requests')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: withdrawals, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ withdrawals })
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/economy/withdrawals
 * Met à jour le statut d'une demande de retrait
 */
export async function PATCH(req: NextRequest) {
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

    const { withdrawalId, status, adminNotes } = await req.json()

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: 'withdrawalId et status requis' },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      )
    }

    // Si on rejette, rembourser le cash
    if (status === 'rejected' && withdrawal.status === 'pending') {
      // Le cash a déjà été débité, il faut le rembourser
      const { creditCash } = await import('@/lib/economy/wallet')
      await creditCash(
        withdrawal.user_id,
        withdrawal.amount,
        'refund',
        `Remboursement - Retrait rejeté: ${withdrawalId}`
      )
    }

    // Mettre à jour le statut
    const updateData: any = {
      status,
      processed_by: user.id,
      processed_at: new Date().toISOString()
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { data: updated, error } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', withdrawalId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Logger l'action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'withdrawal_update',
        target_type: 'withdrawal_request',
        target_id: withdrawalId,
        details: {
          old_status: withdrawal.status,
          new_status: status,
          admin_notes: adminNotes
        }
      })

    return NextResponse.json({
      success: true,
      withdrawal: updated
    })
  } catch (error: any) {
    console.error('Error updating withdrawal:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
