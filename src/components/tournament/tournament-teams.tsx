'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  UserMinus,
  UserPlus,
  MessageCircle,
  MoreVertical,
  Crown,
  Shield
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface TournamentTeamsProps {
  tournament: any
  registrations: any[]
  canManage: boolean
  userId: string
}

export function TournamentTeams({ 
  tournament, 
  registrations,
  canManage,
  userId
}: TournamentTeamsProps) {
  const [search, setSearch] = useState('')
  const supabase = createClient()
  
  const filteredRegistrations = registrations.filter(reg => 
    reg.team?.name?.toLowerCase().includes(search.toLowerCase()) ||
    reg.team?.tag?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: any; color: string }> = {
      pending: { label: 'En attente', icon: Clock, color: 'bg-yellow-500/20 text-yellow-400' },
      confirmed: { label: 'Confirmé', icon: CheckCircle, color: 'bg-[#c8ff00]/20 text-[#c8ff00]' },
      checked_in: { label: 'Check-in', icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
      disqualified: { label: 'Disqualifié', icon: XCircle, color: 'bg-red-500/20 text-red-400' },
      forfeited: { label: 'Forfait', icon: Flag, color: 'bg-[#333] text-[#666]' },
    }
    return configs[status] || { label: status, icon: Clock, color: 'bg-[#333] text-[#666]' }
  }

  const handleForfeit = async (registrationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir déclarer forfait ?')) return
    
    try {
      const { error } = await supabase
        .from('tournament_registrations')
        .update({ status: 'forfeited' })
        .eq('id', registrationId)
      
      if (error) throw error
      toast.success('Forfait déclaré')
    } catch (error) {
      toast.error('Erreur lors du forfait')
    }
  }

  const handleDisqualify = async (registrationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir disqualifier cette équipe ?')) return
    
    try {
      const { error } = await supabase
        .from('tournament_registrations')
        .update({ status: 'disqualified' })
        .eq('id', registrationId)
      
      if (error) throw error
      toast.success('Équipe disqualifiée')
    } catch (error) {
      toast.error('Erreur lors de la disqualification')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
          <Input
            placeholder="Rechercher une équipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#141414] border-[#1a1a1a] focus:border-[#c8ff00]/50"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[#666]">
          <Users className="h-4 w-4" />
          <span>{registrations.length}/{tournament.max_teams} équipes</span>
        </div>
      </div>

      {/* Teams List */}
      {filteredRegistrations.length === 0 ? (
        <Card className="p-12 bg-[#141414] border-[#1a1a1a] text-center">
          <Users className="h-12 w-12 mx-auto text-[#333] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucune équipe inscrite</h3>
          <p className="text-[#666]">
            Les équipes apparaîtront ici une fois inscrites au tournoi.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredRegistrations.map((reg, index) => {
            const statusConfig = getStatusConfig(reg.status)
            const StatusIcon = statusConfig.icon
            const isMyTeam = reg.team?.owner_id === userId
            
            return (
              <Card 
                key={reg.id} 
                className={`p-4 bg-[#141414] border-[#1a1a1a] ${
                  isMyTeam ? 'border-[#c8ff00]/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Seed */}
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-sm font-bold text-[#666]">
                    #{index + 1}
                  </div>
                  
                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{reg.team?.name || 'Équipe inconnue'}</h3>
                      {reg.team?.tag && (
                        <Badge className="bg-[#1a1a1a] text-[#666] border-0 text-[10px]">
                          {reg.team.tag}
                        </Badge>
                      )}
                      {isMyTeam && (
                        <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-0 text-[10px]">
                          Mon équipe
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-[#666]">
                      <Badge className={`${statusConfig.color} border-0 text-[10px] gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      <span>Inscrit le {new Date(reg.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#141414] border-[#1a1a1a]">
                      <DropdownMenuItem className="text-white hover:bg-[#1a1a1a] gap-2">
                        <Users className="h-4 w-4" />
                        Voir l'équipe
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-[#1a1a1a] gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Contacter
                      </DropdownMenuItem>
                      
                      {isMyTeam && reg.status !== 'forfeited' && (
                        <>
                          <DropdownMenuItem 
                            className="text-yellow-400 hover:bg-yellow-400/10 gap-2"
                            onClick={() => {}}
                          >
                            <UserMinus className="h-4 w-4" />
                            Changer joueur
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-400/10 gap-2"
                            onClick={() => handleForfeit(reg.id)}
                          >
                            <Flag className="h-4 w-4" />
                            Déclarer forfait
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {canManage && (
                        <>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-400/10 gap-2"
                            onClick={() => handleDisqualify(reg.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Disqualifier
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Team Members Preview */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#1a1a1a]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center -ml-2 first:ml-0 border-2 border-[#141414]"
                    >
                      <span className="text-[10px] text-[#666]">{i}</span>
                    </div>
                  ))}
                  <span className="text-xs text-[#666] ml-2">5 joueurs</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

