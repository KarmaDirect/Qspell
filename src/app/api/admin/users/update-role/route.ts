import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isValidUserRole } from '@/lib/auth/permissions'
import { canAssignRole, UserRole } from '@/lib/auth/roles'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier le rôle de l'utilisateur actuel
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: UserRole }>()

    if (!currentUserProfile || !['admin', 'ceo'].includes(currentUserProfile.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer les données de la requête
    const body = await req.json()
    const { userId, newRole } = body

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'userId et newRole sont requis' }, { status: 400 })
    }

    // Valider le nouveau rôle
    if (!isValidUserRole(newRole)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    // Vérifier si l'utilisateur actuel peut assigner ce rôle
    if (!canAssignRole(currentUserProfile.role, newRole)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les permissions pour assigner ce rôle' },
        { status: 403 }
      )
    }

    // Mettre à jour le rôle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du rôle' },
        { status: 500 }
      )
    }

    // Logger l'action admin
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'update_role',
      target_type: 'user',
      target_id: userId,
      details: {
        new_role: newRole,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Rôle mis à jour avec succès'
    })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}

