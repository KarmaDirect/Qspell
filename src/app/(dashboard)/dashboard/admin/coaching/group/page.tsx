import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { GroupCoachingForm } from '@/components/admin/group-coaching-form'
import { GroupSessionsList } from '@/components/admin/group-sessions-list'

export default async function AdminGroupCoachingPage() {
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
          <h1 className="text-3xl font-bold mb-2">Coaching Groupe</h1>
          <p className="text-muted-foreground">
            Organisez des sessions de coaching groupe par lane
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GroupCoachingForm />
        </div>
        <div className="lg:col-span-2">
          <GroupSessionsList />
        </div>
      </div>
    </div>
  )
}

