import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flag, Clock, CheckCircle, XCircle, User, MessageCircle, Shield } from 'lucide-react'

export default async function AdminModerationPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) redirect('/dashboard')

  const reports = [
    { id: 1, type: 'user', reason: 'Comportement toxique', reported: 'User2', status: 'pending' },
    { id: 2, type: 'team', reason: 'Nom inapproprié', reported: 'Team XYZ', status: 'pending' },
    { id: 3, type: 'message', reason: 'Spam', reported: 'User5', status: 'resolved' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <Shield className="h-3 w-3 mr-1" />
          Modération
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Modération</h1>
        <p className="text-[#666]">Gérez les signalements et modérez le contenu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En attente', value: 5, icon: Clock },
          { label: 'Résolus', value: 23, icon: CheckCircle },
          { label: 'Bannis', value: 3, icon: XCircle },
          { label: 'Total', value: 156, icon: Flag },
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

      <Card className="bg-[#141414] border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="font-semibold text-white">Signalements récents</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {reports.map((r) => (
            <div key={r.id} className="p-4 flex items-center gap-4 hover:bg-[#1a1a1a]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                {r.type === 'user' ? <User className="h-5 w-5 text-[#c8ff00]" /> : 
                 r.type === 'message' ? <MessageCircle className="h-5 w-5 text-[#c8ff00]" /> : 
                 <Flag className="h-5 w-5 text-[#c8ff00]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{r.reason}</p>
                <p className="text-xs text-[#666]">{r.reported}</p>
              </div>
              <Badge className={`text-[10px] border-0 ${r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[#1a1a1a] text-[#666]'}`}>
                {r.status === 'pending' ? 'En attente' : 'Résolu'}
              </Badge>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 bg-[#c8ff00] text-black hover:bg-[#b8ef00] text-xs font-semibold">
                    Approuver
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

