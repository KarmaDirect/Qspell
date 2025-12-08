import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarEventsManager } from '@/components/admin/calendar-events-manager'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default async function AdminCalendarPage() {
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
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <Calendar className="h-3 w-3 mr-1" />
          Gestion
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Événements</h1>
        <p className="text-[#666]">Gérez les événements du calendrier</p>
      </div>

      <CalendarEventsManager />
    </div>
  )
}
