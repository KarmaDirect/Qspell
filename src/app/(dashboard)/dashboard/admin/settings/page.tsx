import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Shield, Globe, Server } from 'lucide-react'

export default async function AdminSettingsPage() {
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

  if (!profile || profile.role !== 'ceo') {
    redirect('/dashboard/admin')
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <Settings className="h-3 w-3 mr-1" />
          CEO
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Paramètres</h1>
        <p className="text-[#666]">Configuration système (CEO uniquement)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <h3 className="font-semibold text-white">Base de données</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Provider</span>
              <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-[10px]">Supabase</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Tables</span>
              <span className="text-white">15+</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Status</span>
              <span className="text-[#c8ff00]">● Connecté</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <h3 className="font-semibold text-white">Sécurité</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">RLS</span>
              <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-[10px]">Actif</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Auth</span>
              <span className="text-white">Supabase Auth</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">2FA</span>
              <span className="text-[#666]">Non configuré</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <h3 className="font-semibold text-white">API externes</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Riot Games</span>
              <span className="text-[#c8ff00]">● Connecté</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Discord</span>
              <span className="text-[#666]">Non configuré</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <h3 className="font-semibold text-white">Système</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Version</span>
              <span className="text-white">2.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Next.js</span>
              <span className="text-white">16.0.7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Node</span>
              <span className="text-white">20.x</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
