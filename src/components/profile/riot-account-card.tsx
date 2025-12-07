'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']

export function RiotAccountCard({ 
  riotAccounts, 
  profileId 
}: { 
  riotAccounts: RiotAccount[]
  profileId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState('euw1')

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte Riot ?')) {
      return
    }

    setDeleting(accountId)
    
    try {
      const response = await fetch('/api/riot/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riotAccountId: accountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur lors de la suppression', {
          description: data.error
        })
        return
      }

      toast.success('Compte supprimé avec succès !')
      window.location.reload()
    } catch (error) {
      toast.error('Erreur de suppression', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleSyncStats = async (accountId: string) => {
    setSyncing(accountId)
    
    try {
      const response = await fetch('/api/riot/sync-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riotAccountId: accountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur lors de la synchronisation', {
          description: data.error
        })
        return
      }

      toast.success('Stats synchronisées avec succès !')
      window.location.reload()
    } catch (error) {
      toast.error('Erreur de synchronisation', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      })
    } finally {
      setSyncing(null)
    }
  }

  const handleAddAccount = async () => {
    if (!gameName || !tagLine) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      // Call our API route instead of directly calling Riot API
      const response = await fetch('/api/riot/add-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameName,
          tagLine,
          region,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur lors de l\'ajout du compte', {
          description: data.error || 'Une erreur est survenue'
        })
        return
      }

      toast.success('Compte Riot ajouté avec succès !')
      setOpen(false)
      setGameName('')
      setTagLine('')
      window.location.reload()
    } catch (error) {
      toast.error('Erreur lors de la recherche du compte', {
        description: error instanceof Error ? error.message : 'Vérifiez que le nom et le tag sont corrects'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Comptes Riot Games</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lier un compte Riot Games</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gameName">Nom d&apos;invocateur</Label>
                <Input
                  id="gameName"
                  placeholder="Faker"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagLine">Tag</Label>
                <Input
                  id="tagLine"
                  placeholder="EUW"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Région</Label>
                <Select value={region} onValueChange={setRegion} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="euw1">EUW (Europe West)</SelectItem>
                    <SelectItem value="eune1">EUNE (Europe Nordic & East)</SelectItem>
                    <SelectItem value="na1">NA (North America)</SelectItem>
                    <SelectItem value="kr">KR (Korea)</SelectItem>
                    <SelectItem value="br1">BR (Brazil)</SelectItem>
                    <SelectItem value="la1">LAN (Latin America North)</SelectItem>
                    <SelectItem value="la2">LAS (Latin America South)</SelectItem>
                    <SelectItem value="oc1">OCE (Oceania)</SelectItem>
                    <SelectItem value="tr1">TR (Turkey)</SelectItem>
                    <SelectItem value="ru">RU (Russia)</SelectItem>
                    <SelectItem value="jp1">JP (Japan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddAccount} 
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter le compte
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {riotAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun compte Riot lié</p>
            <p className="text-sm mt-1">
              Ajoutez votre compte pour afficher vos statistiques
            </p>
          </div>
        ) : (
          riotAccounts.map((account) => (
            <div 
              key={account.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {account.game_name}#{account.tag_line}
                    </span>
                    {account.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {account.region.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {account.is_primary && (
                  <Badge>Principal</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSyncStats(account.id)}
                  disabled={syncing === account.id || deleting === account.id}
                  className="gap-2"
                >
                  {syncing === account.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sync...
                    </>
                  ) : (
                    'Sync stats'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteAccount(account.id)}
                  disabled={syncing === account.id || deleting === account.id}
                  className="gap-2"
                >
                  {deleting === account.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </>
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

