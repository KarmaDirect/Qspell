import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRoleManager } from '@/components/admin/user-role-manager'
import { UserRole } from '@/lib/auth/roles'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: UserRole }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <Users className="h-3 w-3 mr-1" />
          Gestion
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Utilisateurs</h1>
        <p className="text-[#666]">Gérez les utilisateurs et leurs rôles</p>
      </div>

      <UserRoleManager currentUserRole={profile.role} />
    </div>
  )
}
