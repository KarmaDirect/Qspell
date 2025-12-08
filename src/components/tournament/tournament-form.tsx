'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Loader2, 
  Trophy, 
  Calendar, 
  Users, 
  Settings2,
  Swords,
  Shield,
  Clock,
  Award,
  GitBranch,
  Info,
  ChevronRight,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface TournamentFormProps {
  userId: string
}

// Tournament formats
const TOURNAMENT_FORMATS = [
  { 
    id: 'single_elimination', 
    name: 'Single Elimination', 
    description: 'Perdre = éliminé',
    icon: GitBranch
  },
  { 
    id: 'double_elimination', 
    name: 'Double Elimination', 
    description: '2 défaites pour être éliminé',
    icon: GitBranch
  },
  { 
    id: 'round_robin', 
    name: 'Round Robin', 
    description: 'Tout le monde joue contre tout le monde',
    icon: Users
  },
  { 
    id: 'swiss', 
    name: 'Swiss System', 
    description: 'Matchs basés sur les performances',
    icon: Trophy
  },
  { 
    id: 'groups_then_knockout', 
    name: 'Poules + Élimination', 
    description: 'Phase de groupes puis brackets',
    icon: Swords
  },
]

// Game modes
const GAME_MODES = [
  { id: 'standard', name: 'Standard Draft', description: 'Pick/Ban classique' },
  { id: 'fearless', name: 'Fearless Draft', description: 'Champions bannis après utilisation' },
  { id: 'blind', name: 'Blind Pick', description: 'Pas de bans, sélection aveugle' },
  { id: 'aram', name: 'ARAM', description: 'All Random All Mid' },
  { id: 'one_for_all', name: 'One For All', description: 'Même champion pour tous' },
]

// Match formats
const MATCH_FORMATS = [
  { id: 'bo1', name: 'Best of 1', games: 1 },
  { id: 'bo3', name: 'Best of 3', games: 3 },
  { id: 'bo5', name: 'Best of 5', games: 5 },
]

export function TournamentForm({ userId }: TournamentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    // Basic
    name: '',
    description: '',
    banner_url: '',
    
    // Format
    tournament_format: 'single_elimination',
    game_mode: 'standard',
    match_format: 'bo3',
    finals_format: 'bo5',
    
    // Teams
    team_size: 5,
    max_teams: 16,
    min_teams: 4,
    allow_substitutes: true,
    max_substitutes: 2,
    
    // Dates
    registration_start: '',
    registration_end: '',
    check_in_start: '',
    check_in_duration: 30,
    tournament_start: '',
    
    // Rules
    region: 'euw1',
    min_rank: '',
    max_rank: '',
    prize_pool: '',
    prize_distribution: '50/30/20',
    rules: '',
    
    // Advanced
    allow_spectators: true,
    stream_delay: 0,
    require_discord: false,
    discord_server: '',
    enable_chat: true,
    allow_forfeit: true,
    allow_reschedule: false,
    third_place_match: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate
      if (!formData.name || !formData.tournament_start || !formData.registration_end) {
        toast.error('Veuillez remplir tous les champs obligatoires')
        setLoading(false)
        return
      }

      const now = new Date()
      const startDate = new Date(formData.tournament_start)
      const regEnd = new Date(formData.registration_end)

      if (regEnd >= startDate) {
        toast.error('Les inscriptions doivent fermer avant le début du tournoi')
        setLoading(false)
        return
      }

      // Determine status
      let status = 'draft'
      if (formData.registration_start) {
        const regStart = new Date(formData.registration_start)
        if (now >= regStart && now < regEnd) {
          status = 'registration_open'
        } else if (now < regStart) {
          status = 'upcoming'
        }
      }

      const tournamentData = {
        name: formData.name,
        description: formData.description,
        banner_url: formData.banner_url || null,
        organizer_id: userId,
        format: formData.tournament_format,
        game_mode: formData.game_mode,
        team_size: formData.team_size,
        max_teams: formData.max_teams,
        min_rank: formData.min_rank || null,
        max_rank: formData.max_rank || null,
        region: [formData.region],
        prize_pool: formData.prize_pool || null,
        registration_start: formData.registration_start || null,
        registration_end: formData.registration_end,
        tournament_start: formData.tournament_start,
        tournament_end: null,
        status,
        rules: {
          match_format: formData.match_format,
          finals_format: formData.finals_format,
          allow_substitutes: formData.allow_substitutes,
          max_substitutes: formData.max_substitutes,
          min_teams: formData.min_teams,
          check_in_duration: formData.check_in_duration,
          allow_spectators: formData.allow_spectators,
          stream_delay: formData.stream_delay,
          require_discord: formData.require_discord,
          discord_server: formData.discord_server,
          enable_chat: formData.enable_chat,
          allow_forfeit: formData.allow_forfeit,
          allow_reschedule: formData.allow_reschedule,
          third_place_match: formData.third_place_match,
          prize_distribution: formData.prize_distribution,
          custom_rules: formData.rules,
        },
      }

      console.log('Sending tournament data:', tournamentData)
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert(tournamentData as any)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2))
        console.error('Error details:', error.message, error.details, error.hint, error.code)
        toast.error(`Erreur: ${error.message || error.details || 'Impossible de créer le tournoi'}`)
        setLoading(false)
        return
      }

      toast.success('Tournoi créé avec succès !', {
        description: 'Vous pouvez maintenant gérer les inscriptions.'
      })
      
      router.push(`/dashboard/tournaments/${(data as any).id}`)
      router.refresh()
    } catch (error: any) {
      console.error('Error creating tournament:', error)
      toast.error(error?.message || 'Erreur lors de la création du tournoi')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, name: 'Informations', icon: Trophy },
    { id: 2, name: 'Format', icon: GitBranch },
    { id: 3, name: 'Équipes', icon: Users },
    { id: 4, name: 'Dates', icon: Calendar },
    { id: 5, name: 'Avancé', icon: Settings2 },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isCompleted = step > s.id
          
          return (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#c8ff00] text-black' 
                    : isCompleted
                    ? 'bg-[#c8ff00]/20 text-[#c8ff00]'
                    : 'bg-[#1a1a1a] text-[#666]'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden md:inline text-sm font-medium">{s.name}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 mx-2 text-[#333]" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
            Informations générales
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Nom du tournoi *</Label>
              <Input
                id="name"
                placeholder="QSPELL Championship 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <textarea
                id="description"
                className="mt-1 w-full min-h-[120px] px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-white focus:border-[#c8ff00]/50 focus:outline-none"
                placeholder="Décrivez votre tournoi, les règles spéciales, les objectifs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Tournament Banner Upload */}
            <ImageUpload
              value={formData.banner_url}
              onChange={(url) => setFormData({ ...formData, banner_url: url })}
              onRemove={() => setFormData({ ...formData, banner_url: '' })}
              disabled={loading}
              aspectRatio="wide"
              label="Bannière du tournoi"
              description="Image d'en-tête pour le tournoi (recommandé: 1920x1080px)"
              bucket="tournaments"
              path="banners"
              maxSize={10}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Région</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    <SelectItem value="euw1">EUW - Europe Ouest</SelectItem>
                    <SelectItem value="eune1">EUNE - Europe Nord-Est</SelectItem>
                    <SelectItem value="na1">NA - Amérique du Nord</SelectItem>
                    <SelectItem value="kr">KR - Corée</SelectItem>
                    <SelectItem value="br1">BR - Brésil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prize_pool" className="text-white">Prize Pool (€)</Label>
                <Input
                  id="prize_pool"
                  type="number"
                  placeholder="1000"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                  className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Tournament Format */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-[#c8ff00]" />
              Format du tournoi
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOURNAMENT_FORMATS.map((format) => {
                const Icon = format.icon
                const isSelected = formData.tournament_format === format.id
                
                return (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, tournament_format: format.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-[#c8ff00]/10 border-[#c8ff00] text-white' 
                        : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#888] hover:border-[#333]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-[#c8ff00]' : ''}`} />
                    <p className="font-semibold">{format.name}</p>
                    <p className="text-xs text-[#666] mt-1">{format.description}</p>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Swords className="h-5 w-5 text-[#c8ff00]" />
              Mode de jeu
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAME_MODES.map((mode) => {
                const isSelected = formData.game_mode === mode.id
                
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, game_mode: mode.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-[#c8ff00]/10 border-[#c8ff00] text-white' 
                        : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#888] hover:border-[#333]'
                    }`}
                  >
                    <p className="font-semibold">{mode.name}</p>
                    <p className="text-xs text-[#666] mt-1">{mode.description}</p>
                    {mode.id === 'fearless' && (
                      <Badge className="mt-2 bg-[#c8ff00]/20 text-[#c8ff00] border-0 text-[10px]">
                        Compétitif
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-lg font-bold text-white mb-4">Format des matchs</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Matchs de poule / Bracket</Label>
                <Select
                  value={formData.match_format}
                  onValueChange={(value) => setFormData({ ...formData, match_format: value })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    {MATCH_FORMATS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Finale</Label>
                <Select
                  value={formData.finals_format}
                  onValueChange={(value) => setFormData({ ...formData, finals_format: value })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    {MATCH_FORMATS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Teams */}
      {step === 3 && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#c8ff00]" />
            Configuration des équipes
          </h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Taille d'équipe</Label>
                <Select
                  value={String(formData.team_size)}
                  onValueChange={(value) => setFormData({ ...formData, team_size: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    <SelectItem value="1">1v1</SelectItem>
                    <SelectItem value="2">2v2</SelectItem>
                    <SelectItem value="3">3v3</SelectItem>
                    <SelectItem value="5">5v5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Minimum d'équipes</Label>
                <Select
                  value={String(formData.min_teams)}
                  onValueChange={(value) => setFormData({ ...formData, min_teams: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    <SelectItem value="2">2 équipes</SelectItem>
                    <SelectItem value="4">4 équipes</SelectItem>
                    <SelectItem value="8">8 équipes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Maximum d'équipes</Label>
                <Select
                  value={String(formData.max_teams)}
                  onValueChange={(value) => setFormData({ ...formData, max_teams: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    <SelectItem value="8">8 équipes</SelectItem>
                    <SelectItem value="16">16 équipes</SelectItem>
                    <SelectItem value="32">32 équipes</SelectItem>
                    <SelectItem value="64">64 équipes</SelectItem>
                    <SelectItem value="128">128 équipes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-6">
              <h3 className="font-semibold text-white mb-4">Remplaçants</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white">Autoriser les remplaçants</p>
                  <p className="text-xs text-[#666]">Les équipes peuvent avoir des joueurs supplémentaires</p>
                </div>
                <Switch
                  checked={formData.allow_substitutes}
                  onCheckedChange={(checked) => setFormData({ ...formData, allow_substitutes: checked })}
                />
              </div>

              {formData.allow_substitutes && (
                <div>
                  <Label className="text-white">Nombre max de remplaçants</Label>
                  <Select
                    value={String(formData.max_substitutes)}
                    onValueChange={(value) => setFormData({ ...formData, max_substitutes: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="border-t border-[#1a1a1a] pt-6">
              <h3 className="font-semibold text-white mb-4">Restrictions de rang</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Rang minimum</Label>
                  <Select
                    value={formData.min_rank || "none"}
                    onValueChange={(value) => setFormData({ ...formData, min_rank: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="iron">Iron</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="grandmaster">Grandmaster</SelectItem>
                      <SelectItem value="challenger">Challenger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Rang maximum</Label>
                  <Select
                    value={formData.max_rank || "none"}
                    onValueChange={(value) => setFormData({ ...formData, max_rank: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="iron">Iron</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="grandmaster">Grandmaster</SelectItem>
                      <SelectItem value="challenger">Challenger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Dates */}
      {step === 4 && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#c8ff00]" />
            Planning du tournoi
          </h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Ouverture des inscriptions</Label>
                <Input
                  type="datetime-local"
                  value={formData.registration_start}
                  onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
                  className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                />
              </div>

              <div>
                <Label className="text-white">Fermeture des inscriptions *</Label>
                <Input
                  type="datetime-local"
                  value={formData.registration_end}
                  onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
                  className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Début du tournoi *</Label>
                <Input
                  type="datetime-local"
                  value={formData.tournament_start}
                  onChange={(e) => setFormData({ ...formData, tournament_start: e.target.value })}
                  className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Durée du check-in (minutes)</Label>
                <Select
                  value={String(formData.check_in_duration)}
                  onValueChange={(value) => setFormData({ ...formData, check_in_duration: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1 bg-[#0a0a0a] border-[#1a1a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="p-4 bg-[#c8ff00]/5 border-[#c8ff00]/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#c8ff00] mt-0.5 shrink-0" />
                <div className="text-sm text-[#c8ff00]/80">
                  <p>Le check-in commencera automatiquement avant le début du tournoi selon la durée configurée.</p>
                  <p className="mt-1">Les équipes devront confirmer leur présence pendant cette période.</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      )}

      {/* Step 5: Advanced */}
      {step === 5 && (
        <div className="space-y-6">
          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#c8ff00]" />
              Options avancées
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-white font-medium">Match pour la 3ème place</p>
                  <p className="text-xs text-[#666]">Jouer un match pour déterminer le 3ème</p>
                </div>
                <Switch
                  checked={formData.third_place_match}
                  onCheckedChange={(checked) => setFormData({ ...formData, third_place_match: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-white font-medium">Autoriser le forfait</p>
                  <p className="text-xs text-[#666]">Les équipes peuvent abandonner</p>
                </div>
                <Switch
                  checked={formData.allow_forfeit}
                  onCheckedChange={(checked) => setFormData({ ...formData, allow_forfeit: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-white font-medium">Autoriser les reprogrammations</p>
                  <p className="text-xs text-[#666]">Les équipes peuvent demander un changement d'horaire</p>
                </div>
                <Switch
                  checked={formData.allow_reschedule}
                  onCheckedChange={(checked) => setFormData({ ...formData, allow_reschedule: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-white font-medium">Chat d'équipe</p>
                  <p className="text-xs text-[#666]">Activer le chat pour les équipes</p>
                </div>
                <Switch
                  checked={formData.enable_chat}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable_chat: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                <div>
                  <p className="text-white font-medium">Autoriser les spectateurs</p>
                  <p className="text-xs text-[#666]">Les matchs peuvent être regardés</p>
                </div>
                <Switch
                  checked={formData.allow_spectators}
                  onCheckedChange={(checked) => setFormData({ ...formData, allow_spectators: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Requérir Discord</p>
                  <p className="text-xs text-[#666]">Les joueurs doivent avoir Discord lié</p>
                </div>
                <Switch
                  checked={formData.require_discord}
                  onCheckedChange={(checked) => setFormData({ ...formData, require_discord: checked })}
                />
              </div>

              {formData.require_discord && (
                <div>
                  <Label className="text-white">Lien du serveur Discord</Label>
                  <Input
                    placeholder="https://discord.gg/..."
                    value={formData.discord_server}
                    onChange={(e) => setFormData({ ...formData, discord_server: e.target.value })}
                    className="mt-1 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#c8ff00]/50"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-lg font-bold text-white mb-4">Distribution des prix</h2>
            <Select
              value={formData.prize_distribution}
              onValueChange={(value) => setFormData({ ...formData, prize_distribution: value })}
            >
              <SelectTrigger className="bg-[#0a0a0a] border-[#1a1a1a]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#1a1a1a]">
                <SelectItem value="100/0/0">100% 1er</SelectItem>
                <SelectItem value="70/30/0">70% 1er / 30% 2ème</SelectItem>
                <SelectItem value="50/30/20">50% 1er / 30% 2ème / 20% 3ème</SelectItem>
                <SelectItem value="50/25/15/10">50% 1er / 25% 2ème / 15% 3ème / 10% 4ème</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h2 className="text-lg font-bold text-white mb-4">Règlement personnalisé</h2>
            <textarea
              className="w-full min-h-[150px] px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-white focus:border-[#c8ff00]/50 focus:outline-none"
              placeholder="Règles additionnelles du tournoi..."
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
        >
          {step === 1 ? 'Annuler' : 'Précédent'}
        </Button>
        
        {step < 5 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Créer le tournoi
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

