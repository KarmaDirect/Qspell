'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TournamentBracket } from './tournament-bracket'
import { TournamentTeams } from './tournament-teams'
import { TournamentChat } from './tournament-chat'
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Settings,
  GitBranch,
  MessageCircle,
  Medal,
  Info,
  Play,
  Pause,
  Flag,
  ArrowLeft,
  Share2,
  Edit
} from 'lucide-react'

interface TournamentDetailProps {
  tournament: any
  registrations: any[]
  matches: any[]
  canManage: boolean
  userId: string
}

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
  { id: 'brackets', label: 'Brackets', icon: GitBranch },
  { id: 'teams', label: 'Équipes', icon: Users },
  { id: 'matches', label: 'Matchs', icon: Trophy },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
]

export function TournamentDetail({ 
  tournament, 
  registrations, 
  matches,
  canManage,
  userId
}: TournamentDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const rules = tournament.rules || {}
  const startDate = new Date(tournament.start_date || tournament.tournament_start)
  const regEnd = tournament.registration_end ? new Date(tournament.registration_end) : null
  
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      draft: { label: 'Brouillon', color: 'bg-[#333] text-[#888]' },
      upcoming: { label: 'À venir', color: 'bg-blue-500/20 text-blue-400' },
      registration_open: { label: 'Inscriptions ouvertes', color: 'bg-[#c8ff00]/20 text-[#c8ff00]' },
      registration_closed: { label: 'Inscriptions fermées', color: 'bg-yellow-500/20 text-yellow-400' },
      in_progress: { label: 'En cours', color: 'bg-purple-500/20 text-purple-400' },
      completed: { label: 'Terminé', color: 'bg-[#333] text-[#888]' },
      cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-400' },
    }
    return configs[status] || { label: status, color: 'bg-[#333] text-[#888]' }
  }

  const statusConfig = getStatusConfig(tournament.status)

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      single_elimination: 'Single Elimination',
      double_elimination: 'Double Elimination',
      round_robin: 'Round Robin',
      swiss: 'Swiss System',
      groups_then_knockout: 'Poules + Élimination',
    }
    return formats[format] || format
  }

  const getGameModeLabel = (mode: string) => {
    const modes: Record<string, string> = {
      standard: 'Standard Draft',
      fearless: 'Fearless Draft',
      blind: 'Blind Pick',
      aram: 'ARAM',
    }
    return modes[mode] || mode
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/tournaments">
          <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          <p className="text-sm text-[#666]">
            Organisé par {tournament.organizer?.display_name || tournament.organizer?.username || 'QSPELL'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
            <Share2 className="h-5 w-5" />
          </Button>
          {canManage && (
            <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
              <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
                <Edit className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Banner & Quick Info */}
      <Card className="overflow-hidden bg-[#141414] border-[#1a1a1a]">
        <div className="h-40 bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 relative">
          {tournament.banner_url && (
            <img 
              src={tournament.banner_url} 
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-sm text-[#c8ff00] font-semibold">{getFormatLabel(tournament.format)}</p>
                <p className="text-xs text-[#888]">{getGameModeLabel(tournament.game_mode)}</p>
              </div>
            </div>
            
            {tournament.prize_pool && (
              <div className="text-right">
                <p className="text-2xl font-bold text-[#c8ff00]">{tournament.prize_pool}€</p>
                <p className="text-xs text-[#666]">Prize Pool</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1a1a1a] border-t border-[#1a1a1a]">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-[#c8ff00] mb-1">
              <Users className="h-4 w-4" />
              <span className="text-lg font-bold">{registrations.length}/{tournament.max_teams}</span>
            </div>
            <p className="text-xs text-[#666]">Équipes</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-lg font-bold">{startDate.toLocaleDateString('fr-FR')}</span>
            </div>
            <p className="text-xs text-[#666]">Début</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-lg font-bold">{tournament.region?.[0]?.toUpperCase() || 'EUW'}</span>
            </div>
            <p className="text-xs text-[#666]">Région</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-lg font-bold">{rules.match_format?.toUpperCase() || 'BO3'}</span>
            </div>
            <p className="text-xs text-[#666]">Format</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-xl border border-[#1a1a1a] overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-[#c8ff00] text-black' 
                  : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
              <h2 className="text-lg font-bold text-white mb-4">À propos</h2>
              <p className="text-[#888] whitespace-pre-wrap">
                {tournament.description || 'Aucune description disponible.'}
              </p>
            </Card>

            <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
              <h2 className="text-lg font-bold text-white mb-4">Règles</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#0a0a0a]">
                    <p className="text-xs text-[#666] mb-1">Format du tournoi</p>
                    <p className="text-sm font-medium text-white">{getFormatLabel(tournament.format)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a]">
                    <p className="text-xs text-[#666] mb-1">Mode de jeu</p>
                    <p className="text-sm font-medium text-white">{getGameModeLabel(tournament.game_mode)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a]">
                    <p className="text-xs text-[#666] mb-1">Format des matchs</p>
                    <p className="text-sm font-medium text-white">{rules.match_format?.toUpperCase() || 'BO3'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a]">
                    <p className="text-xs text-[#666] mb-1">Finale</p>
                    <p className="text-sm font-medium text-white">{rules.finals_format?.toUpperCase() || 'BO5'}</p>
                  </div>
                </div>

                {rules.custom_rules && (
                  <div className="pt-4 border-t border-[#1a1a1a]">
                    <p className="text-sm text-[#888] whitespace-pre-wrap">{rules.custom_rules}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
              <h2 className="text-lg font-bold text-white mb-4">Actions</h2>
              
              {tournament.status === 'registration_open' && (
                <Button className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold mb-3">
                  <Users className="h-4 w-4 mr-2" />
                  S'inscrire
                </Button>
              )}

              {canManage && (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a]">
                    <Settings className="h-4 w-4 mr-2" />
                    Gérer le tournoi
                  </Button>
                  
                  {tournament.status === 'registration_open' && (
                    <Button variant="outline" className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a]">
                      <Pause className="h-4 w-4 mr-2" />
                      Fermer les inscriptions
                    </Button>
                  )}
                  
                  {tournament.status === 'registration_closed' && (
                    <Button className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
                      <Play className="h-4 w-4 mr-2" />
                      Lancer le tournoi
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Prize Distribution */}
            {tournament.prize_pool && (
              <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Medal className="h-5 w-5 text-[#c8ff00]" />
                  Récompenses
                </h2>
                
                <div className="space-y-3">
                  {(rules.prize_distribution || '50/30/20').split('/').map((pct: string, i: number) => {
                    const amount = Math.round((parseInt(tournament.prize_pool) * parseInt(pct)) / 100)
                    const medals = ['🥇', '🥈', '🥉', '4️⃣']
                    const places = ['1er', '2ème', '3ème', '4ème']
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{medals[i]}</span>
                          <span className="text-sm text-white">{places[i]}</span>
                        </div>
                        <span className="text-sm font-bold text-[#c8ff00]">{amount}€</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* Schedule */}
            <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
              <h2 className="text-lg font-bold text-white mb-4">Planning</h2>
              
              <div className="space-y-3">
                {regEnd && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#c8ff00]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Fin des inscriptions</p>
                      <p className="text-xs text-[#666]">{regEnd.toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                    <Play className="h-4 w-4 text-[#c8ff00]" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Début du tournoi</p>
                    <p className="text-xs text-[#666]">{startDate.toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'brackets' && (
        <TournamentBracket 
          tournament={tournament}
          matches={matches}
          registrations={registrations}
          canManage={canManage}
        />
      )}

      {activeTab === 'teams' && (
        <TournamentTeams 
          tournament={tournament}
          registrations={registrations}
          canManage={canManage}
          userId={userId}
        />
      )}

      {activeTab === 'matches' && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="text-center py-12 text-[#666]">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Les matchs apparaîtront ici une fois le tournoi lancé</p>
          </div>
        </Card>
      )}

      {activeTab === 'chat' && (
        <TournamentChat 
          tournamentId={tournament.id}
          userId={userId}
          enabled={rules.enable_chat !== false}
        />
      )}
    </div>
  )
}

