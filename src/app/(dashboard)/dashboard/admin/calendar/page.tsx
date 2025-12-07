import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarEventsManager } from '@/components/admin/calendar-events-manager'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function AdminCalendarPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion du calendrier</h1>
          <p className="text-muted-foreground">
            Ajoutez et gérez les événements personnalisés du calendrier QSPELL
          </p>
        </div>
      </div>

      <CalendarEventsManager />
    </div>
  )
}

