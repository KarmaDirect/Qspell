import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Shield, Bell } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is CEO
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
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <Badge variant="destructive">CEO uniquement</Badge>
      </div>
      <p className="text-muted-foreground">
        Configuration système et paramètres avancés
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold">Base de données</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Gestion des migrations et de la base de données Supabase
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Tables créées</span>
              <Badge variant="outline">20+</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Migrations</span>
              <Badge variant="outline">12</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold">Sécurité</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Gestion des rôles et permissions administrateurs
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Admins actifs</span>
              <Badge variant="outline">4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>RLS activé</span>
              <Badge variant="default">Oui</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold">Notifications</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Configuration des notifications système
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Emails activés</span>
              <Badge variant="outline">Supabase</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold">Système</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Informations système et version
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Next.js</span>
              <Badge variant="outline">16.0.7</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

