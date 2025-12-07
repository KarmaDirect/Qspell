'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function TournamentForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'single_elimination',
    game_mode: 'draft',
    team_size: 5,
    max_teams: 16,
    min_rank: '',
    max_rank: '',
    prize_pool: '',
    registration_start: '',
    registration_end: '',
    tournament_start: '',
    tournament_end: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Vous devez être connecté')
        return
      }

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...formData,
          organizer_id: user.id,
          status: 'open',
          region: ['EUW', 'EUNE'], // Default regions
        })
        .select()
        .single()

      if (error) {
        toast.error('Erreur lors de la création', {
          description: error.message
        })
        return
      }

      toast.success('Tournoi créé avec succès !')
      router.push(`/dashboard/tournaments/${data.id}`)
    } catch (error) {
      toast.error('Une erreur est survenue', {
        description: error instanceof Error ? error.message : 'Impossible de créer le tournoi'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Informations générales</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Nom du tournoi *</Label>
          <Input
            id="name"
            placeholder="Coupe d'été EUW"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Description du tournoi..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={loading}
            className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format">Format *</Label>
            <Select 
              value={formData.format} 
              onValueChange={(value) => setFormData({ ...formData, format: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_elimination">Simple élimination</SelectItem>
                <SelectItem value="double_elimination">Double élimination</SelectItem>
                <SelectItem value="round_robin">Round Robin</SelectItem>
                <SelectItem value="swiss">Swiss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="game_mode">Mode de jeu *</Label>
            <Select 
              value={formData.game_mode} 
              onValueChange={(value) => setFormData({ ...formData, game_mode: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft Pick</SelectItem>
                <SelectItem value="blind">Blind Pick</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team_size">Taille d&apos;équipe</Label>
            <Input
              id="team_size"
              type="number"
              value={formData.team_size}
              onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) })}
              disabled={loading}
              min={1}
              max={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_teams">Nombre max d&apos;équipes</Label>
            <Input
              id="max_teams"
              type="number"
              value={formData.max_teams}
              onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
              disabled={loading}
              min={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize_pool">Prize Pool (optionnel)</Label>
          <Input
            id="prize_pool"
            placeholder="500€ + skins"
            value={formData.prize_pool}
            onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
            disabled={loading}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Restrictions de rang</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_rank">Rang minimum</Label>
            <Select 
              value={formData.min_rank || undefined} 
              onValueChange={(value) => setFormData({ ...formData, min_rank: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IRON">Iron</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
                <SelectItem value="EMERALD">Emerald</SelectItem>
                <SelectItem value="DIAMOND">Diamond</SelectItem>
                <SelectItem value="MASTER">Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_rank">Rang maximum</Label>
            <Select 
              value={formData.max_rank || undefined} 
              onValueChange={(value) => setFormData({ ...formData, max_rank: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
                <SelectItem value="EMERALD">Emerald</SelectItem>
                <SelectItem value="DIAMOND">Diamond</SelectItem>
                <SelectItem value="MASTER">Master</SelectItem>
                <SelectItem value="GRANDMASTER">Grandmaster</SelectItem>
                <SelectItem value="CHALLENGER">Challenger</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Dates</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registration_start">Début des inscriptions</Label>
            <Input
              id="registration_start"
              type="datetime-local"
              value={formData.registration_start}
              onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_end">Fin des inscriptions</Label>
            <Input
              id="registration_end"
              type="datetime-local"
              value={formData.registration_end}
              onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tournament_start">Début du tournoi *</Label>
            <Input
              id="tournament_start"
              type="datetime-local"
              value={formData.tournament_start}
              onChange={(e) => setFormData({ ...formData, tournament_start: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournament_end">Fin du tournoi</Label>
            <Input
              id="tournament_end"
              type="datetime-local"
              value={formData.tournament_end}
              onChange={(e) => setFormData({ ...formData, tournament_end: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer le tournoi
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

