import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStats } from '@/components/admin/admin-stats'
import { AdminQuickActions } from '@/components/admin/admin-quick-actions'
import { RecentAdminActions } from '@/components/admin/recent-actions'

export default async function AdminDashboardPage() {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-orange-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Tableau de bord Admin
        </h1>
        <p className="text-red-100">
          Gestion et modération de la plateforme QSPELL
        </p>
      </div>

      {/* Stats */}
      <AdminStats />

      {/* Quick Actions */}
      <AdminQuickActions isCEO={profile.role === 'ceo'} />

      {/* Recent Actions */}
      <RecentAdminActions />
    </div>
  )
}

