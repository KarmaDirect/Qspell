import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

async function getWithdrawals(status?: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/api/admin/economy/withdrawals`)
  if (status) url.searchParams.set('status', status)
  
  const response = await fetch(url.toString(), {
    cache: 'no-store'
  })
  if (!response.ok) return []
  const data = await response.json()
  return data.withdrawals || []
}

export default async function WithdrawalsPage() {
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
    .single()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const [pending, processing, completed] = await Promise.all([
    getWithdrawals('pending'),
    getWithdrawals('processing'),
    getWithdrawals('completed')
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
      case 'processing':
        return <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20"><AlertCircle className="h-3 w-3 mr-1" /> En traitement</Badge>
      case 'completed':
        return <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20"><CheckCircle className="h-3 w-3 mr-1" /> Complété</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/20"><XCircle className="h-3 w-3 mr-1" /> Rejeté</Badge>
      default:
        return <Badge className="bg-[#1a1a1a] text-[#666] border-[#1a1a1a]">{status}</Badge>
    }
  }

  const handleStatusUpdate = async (withdrawalId: string, status: string, notes?: string) => {
    'use server'
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/api/admin/economy/withdrawals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, status, adminNotes: notes })
    })
    return response.json()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Retraits</h1>
        <p className="text-muted-foreground">Validez et gérez les demandes de retrait</p>
      </div>

      {/* En attente - Priorité */}
      {pending.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#c8ff00]" />
            En attente ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((w: any) => (
              <Card key={w.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(w.status)}
                      {w.kyc_required && (
                        <Badge variant="destructive">KYC Requis</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Utilisateur</div>
                        <div className="font-semibold">{w.profiles?.username || w.profiles?.display_name || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Montant</div>
                        <div className="font-semibold">{w.amount}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Frais (10%)</div>
                        <div className="font-semibold text-red-400">-{w.platform_fee}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Net</div>
                        <div className="font-semibold text-[#c8ff00]">{w.net_amount}€</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Méthode: <span className="font-semibold capitalize">{w.method}</span>
                    </div>
                    {w.details && (
                      <div className="text-sm text-muted-foreground">
                        Détails: {typeof w.details === 'object' ? JSON.stringify(w.details) : w.details}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Demandé le: {new Date(w.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <form action={async () => {
                      'use server'
                      await handleStatusUpdate(w.id, 'processing')
                    }}>
                      <Button type="submit" variant="outline" size="sm">
                        Marquer en traitement
                      </Button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await handleStatusUpdate(w.id, 'completed')
                    }}>
                      <Button type="submit" size="sm" className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                        Valider
                      </Button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await handleStatusUpdate(w.id, 'rejected', 'Rejeté par admin')
                    }}>
                      <Button type="submit" variant="destructive" size="sm">
                        Rejeter
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* En traitement */}
      {processing.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">En traitement ({processing.length})</h2>
          <div className="space-y-4">
            {processing.map((w: any) => (
              <Card key={w.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(w.status)}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{w.profiles?.username}</span> - {w.amount}€ ({w.net_amount}€ net)
                    </div>
                    {w.admin_notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Note: {w.admin_notes}
                      </div>
                    )}
                  </div>
                  <form action={async () => {
                    'use server'
                    await handleStatusUpdate(w.id, 'completed')
                  }}>
                    <Button type="submit" size="sm">
                      Marquer complété
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Complétés */}
      {completed.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Complétés ({completed.length})</h2>
          <div className="space-y-2">
            {completed.slice(0, 10).map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-2 bg-gray-500/5 rounded">
                <div className="text-sm">
                  <span className="font-semibold">{w.profiles?.username}</span> - {w.amount}€
                </div>
                <div className="text-xs text-muted-foreground">
                  {w.processed_at ? new Date(w.processed_at).toLocaleDateString('fr-FR') : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pending.length === 0 && processing.length === 0 && completed.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Aucune demande de retrait</p>
        </Card>
      )}
    </div>
  )
}
