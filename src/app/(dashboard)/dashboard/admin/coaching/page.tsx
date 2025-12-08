import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Video, BookOpen, Star, GraduationCap } from 'lucide-react'
import { CoachingSessionButton } from '@/components/coaching/coaching-session-button'

export default async function AdminCoachingPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <GraduationCap className="h-3 w-3 mr-1" />
            Gestion
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Coaching</h1>
          <p className="text-[#666]">Gérez les coachs et les sessions</p>
        </div>
        <CoachingSessionButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Coachs actifs', value: 12, icon: Users },
          { label: 'Sessions', value: 48, icon: Video },
          { label: 'Cours', value: 35, icon: BookOpen },
          { label: 'Note moyenne', value: '4.8', icon: Star },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="p-5 bg-[#141414] border-[#1a1a1a]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-[#666] mt-1">{s.label}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#c8ff00]" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-[#141414] border-[#1a1a1a] overflow-hidden">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h2 className="font-semibold text-white">Coachs</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {['Alpha', 'Beta', 'Gamma'].map((name, i) => (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#c8ff00]/10 flex items-center justify-center text-sm font-semibold text-[#c8ff00]">
                  {name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Coach {name}</p>
                  <p className="text-xs text-[#666]">{50 - i * 15} sessions</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#c8ff00]">
                  <Star className="h-3 w-3 fill-current" />
                  {(4.9 - i * 0.1).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#141414] border-[#1a1a1a] overflow-hidden">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h2 className="font-semibold text-white">Sessions récentes</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {['Privé', 'Groupe', 'Privé'].map((type, i) => (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                  {type === 'Groupe' ? <Users className="h-5 w-5 text-[#c8ff00]" /> : <Video className="h-5 w-5 text-[#c8ff00]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Session {type}</p>
                  <p className="text-xs text-[#666]">Il y a {i + 1}h</p>
                </div>
                <Badge className={`text-[10px] border-0 ${i === 1 ? 'bg-[#c8ff00]/10 text-[#c8ff00]' : 'bg-[#1a1a1a] text-[#666]'}`}>
                  {i === 1 ? 'En cours' : 'Terminé'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

