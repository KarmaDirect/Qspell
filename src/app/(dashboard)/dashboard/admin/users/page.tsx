import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersList } from '@/components/admin/users-list'

export default async function AdminUsersPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin or CEO
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          CRM complet - Liste de tous les utilisateurs inscrits
        </p>
      </div>

      <UsersList />
    </div>
  )
}

