'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CHAMPIONS, 
  getChampionIconUrl, 
  getChampionsByRole,
  CHAMPION_ROLES,
  type Champion 
} from '@/lib/riot/champions'
import { 
  Search,
  X,
  Clock,
  Ban,
  Users,
  Trophy
} from 'lucide-react'

type Team = 'blue' | 'red'
type Phase = 'ban1' | 'pick1' | 'ban2' | 'pick2' | 'ban3' | 'pick3' | 'complete'
type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support' | 'all'

interface DraftState {
  blueBans: (Champion | null)[]
  redBans: (Champion | null)[]
  bluePicks: (Champion | null)[]
  redPicks: (Champion | null)[]
  phase: Phase
  currentTeam: Team
  timer: number
}

interface DraftPickProps {
  tournamentId: string
  matchId: string
  blueTeam: { id: string; name: string; tag: string }
  redTeam: { id: string; name: string; tag: string }
  onComplete?: (draft: DraftState) => void
}

export function DraftPick({ tournamentId, matchId, blueTeam, redTeam, onComplete }: DraftPickProps) {
  const [patch, setPatch] = useState('15.24.1')
  const [roleFilter, setRoleFilter] = useState<Role>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [draft, setDraft] = useState<DraftState>({
    blueBans: [null, null, null, null, null],
    redBans: [null, null, null, null, null],
    bluePicks: [null, null, null, null, null],
    redPicks: [null, null, null, null, null],
    phase: 'ban1',
    currentTeam: 'blue',
    timer: 30
  })

  // Timer countdown
  useEffect(() => {
    if (draft.phase === 'complete') return
    
    const interval = setInterval(() => {
      setDraft(prev => {
        if (prev.timer <= 1) {
          // Auto-advance phase when timer expires
          return advancePhase(prev)
        }
        return { ...prev, timer: prev.timer - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [draft.phase])

  const advancePhase = (currentDraft: DraftState): DraftState => {
    const phaseOrder: Phase[] = ['ban1', 'pick1', 'ban2', 'pick2', 'ban3', 'pick3', 'complete']
    const currentIndex = phaseOrder.indexOf(currentDraft.phase)
    const nextPhase = phaseOrder[currentIndex + 1] || 'complete'
    
    return {
      ...currentDraft,
      phase: nextPhase,
      currentTeam: currentDraft.currentTeam === 'blue' ? 'red' : 'blue',
      timer: nextPhase === 'complete' ? 0 : 30
    }
  }

  const getBannedChampions = (): Champion[] => {
    return [
      ...draft.blueBans.filter(Boolean),
      ...draft.redBans.filter(Boolean)
    ] as Champion[]
  }

  const getPickedChampions = (): Champion[] => {
    return [
      ...draft.bluePicks.filter(Boolean),
      ...draft.redPicks.filter(Boolean)
    ] as Champion[]
  }

  const isChampionDisabled = (champion: Champion): boolean => {
    const banned = getBannedChampions().some(c => c.id === champion.id)
    const picked = getPickedChampions().some(c => c.id === champion.id)
    return banned || picked
  }

  const handleChampionSelect = (champion: Champion) => {
    if (isChampionDisabled(champion)) return
    if (draft.phase === 'complete') return

    setDraft(prev => {
      const newDraft = { ...prev }
      
      // Handle bans
      if (prev.phase.includes('ban')) {
        const banArray = prev.currentTeam === 'blue' ? [...prev.blueBans] : [...prev.redBans]
        const emptyIndex = banArray.findIndex(b => b === null)
        
        if (emptyIndex !== -1) {
          banArray[emptyIndex] = champion
          
          if (prev.currentTeam === 'blue') {
            newDraft.blueBans = banArray
          } else {
            newDraft.redBans = banArray
          }
          
          // Check if phase is complete
          const allBanned = banArray.every(b => b !== null)
          if (allBanned) {
            return advancePhase(newDraft)
          }
          
          // Switch team for alternate bans
          newDraft.currentTeam = prev.currentTeam === 'blue' ? 'red' : 'blue'
          newDraft.timer = 30
        }
      }
      
      // Handle picks
      if (prev.phase.includes('pick')) {
        const pickArray = prev.currentTeam === 'blue' ? [...prev.bluePicks] : [...prev.redPicks]
        const emptyIndex = pickArray.findIndex(p => p === null)
        
        if (emptyIndex !== -1) {
          pickArray[emptyIndex] = champion
          
          if (prev.currentTeam === 'blue') {
            newDraft.bluePicks = pickArray
          } else {
            newDraft.redPicks = pickArray
          }
          
          // Check if phase is complete
          const allPicked = pickArray.every(p => p !== null)
          if (allPicked) {
            return advancePhase(newDraft)
          }
          
          // Switch team for alternate picks
          newDraft.currentTeam = prev.currentTeam === 'blue' ? 'red' : 'blue'
          newDraft.timer = 30
        }
      }
      
      return newDraft
    })
  }

  const filteredChampions = CHAMPIONS.filter(champion => {
    const matchesSearch = champion.name.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesRole = true
    if (roleFilter !== 'all') {
      const roleKey = roleFilter as keyof typeof CHAMPION_ROLES
      const roleChampions = CHAMPION_ROLES[roleKey]
      matchesRole = roleChampions ? (roleChampions as readonly string[]).includes(champion.name) : false
    }
    return matchesSearch && matchesRole
  })

  const getPhaseLabel = () => {
    const labels = {
      ban1: 'Phase de Ban 1',
      pick1: 'Phase de Pick 1',
      ban2: 'Phase de Ban 2',
      pick2: 'Phase de Pick 2',
      ban3: 'Phase de Ban 3',
      pick3: 'Phase de Pick 3',
      complete: 'Draft Terminé'
    }
    return labels[draft.phase]
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 space-y-4">
      {/* Header avec status */}
      <Card className="p-4 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-lg px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              {getPhaseLabel()}
            </Badge>
            {draft.phase !== 'complete' && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#c8ff00]" />
                <span className="text-2xl font-bold text-white">{draft.timer}s</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#666]">Tour actuel:</span>
            <Badge className={draft.currentTeam === 'blue' ? 'bg-blue-500/20 text-blue-400 border-0' : 'bg-red-500/20 text-red-400 border-0'}>
              {draft.currentTeam === 'blue' ? blueTeam.name : redTeam.name}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Layout principal */}
      <div className="grid grid-cols-[300px_1fr_300px] gap-4">
        {/* Blue Team - Left */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-400" />
              <h2 className="font-bold text-white">{blueTeam.name}</h2>
              <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-0">{blueTeam.tag}</Badge>
            </div>
            
            {/* Blue Bans */}
            <div className="mb-4">
              <p className="text-xs text-[#666] mb-2 flex items-center gap-1">
                <Ban className="h-3 w-3" /> Bans
              </p>
              <div className="grid grid-cols-5 gap-1">
                {draft.blueBans.map((champion, i) => (
                  <ChampionSlot key={i} champion={champion} patch={patch} isBan />
                ))}
              </div>
            </div>
            
            {/* Blue Picks */}
            <div>
              <p className="text-xs text-[#666] mb-2">Picks</p>
              <div className="space-y-1">
                {draft.bluePicks.map((champion, i) => (
                  <ChampionSlot key={i} champion={champion} patch={patch} size="large" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Champion Grid - Center */}
        <div className="space-y-4">
          {/* Search & Filters */}
          <Card className="p-4 bg-[#141414] border-[#1a1a1a]">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                <Input 
                  placeholder="Rechercher un champion..." 
                  className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {(['all', 'top', 'jungle', 'mid', 'adc', 'support'] as const).map(role => (
                <Button
                  key={role}
                  size="sm"
                  variant={roleFilter === role ? 'default' : 'outline'}
                  className={roleFilter === role 
                    ? 'bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold' 
                    : 'border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                  }
                  onClick={() => setRoleFilter(role)}
                >
                  {role === 'all' ? 'Tous' : role}
                </Button>
              ))}
            </div>
          </Card>

          {/* Champion Grid */}
          <Card className="p-4 bg-[#141414] border-[#1a1a1a] max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {filteredChampions.map(champion => {
                const disabled = isChampionDisabled(champion)
                return (
                  <button
                    key={champion.id}
                    onClick={() => handleChampionSelect(champion)}
                    disabled={disabled || draft.phase === 'complete'}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                      disabled 
                        ? 'opacity-30 cursor-not-allowed border-[#1a1a1a]' 
                        : 'hover:border-[#c8ff00] border-[#1a1a1a] cursor-pointer hover:scale-105'
                    }`}
                  >
                    <img 
                      src={getChampionIconUrl(champion.key, patch)}
                      alt={champion.name}
                      className="w-full h-full object-cover"
                    />
                    {disabled && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <X className="h-6 w-6 text-red-400" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Red Team - Right */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-red-400" />
              <h2 className="font-bold text-white">{redTeam.name}</h2>
              <Badge className="ml-auto bg-red-500/20 text-red-400 border-0">{redTeam.tag}</Badge>
            </div>
            
            {/* Red Bans */}
            <div className="mb-4">
              <p className="text-xs text-[#666] mb-2 flex items-center gap-1">
                <Ban className="h-3 w-3" /> Bans
              </p>
              <div className="grid grid-cols-5 gap-1">
                {draft.redBans.map((champion, i) => (
                  <ChampionSlot key={i} champion={champion} patch={patch} isBan />
                ))}
              </div>
            </div>
            
            {/* Red Picks */}
            <div>
              <p className="text-xs text-[#666] mb-2">Picks</p>
              <div className="space-y-1">
                {draft.redPicks.map((champion, i) => (
                  <ChampionSlot key={i} champion={champion} patch={patch} size="large" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Complete Draft */}
      {draft.phase === 'complete' && (
        <Card className="p-6 bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/20 text-center">
          <Trophy className="h-12 w-12 mx-auto text-[#c8ff00] mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Draft Terminé !</h2>
          <p className="text-[#666] mb-4">Les compositions sont verrouillées. Bon match !</p>
          <Button 
            className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
            onClick={() => onComplete?.(draft)}
          >
            Confirmer & Lancer le match
          </Button>
        </Card>
      )}
    </div>
  )
}

function ChampionSlot({ 
  champion, 
  patch, 
  isBan = false, 
  size = 'small' 
}: { 
  champion: Champion | null
  patch: string
  isBan?: boolean
  size?: 'small' | 'large'
}) {
  const sizeClasses = size === 'large' ? 'h-14' : 'h-10'
  
  if (!champion) {
    return (
      <div className={`${sizeClasses} bg-[#1a1a1a] border border-[#333] rounded flex items-center justify-center`}>
        <span className="text-[#333] text-xs">-</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses} relative rounded overflow-hidden border-2 border-[#c8ff00]/50 flex items-center gap-2 px-2 bg-[#1a1a1a]`}>
      <img 
        src={getChampionIconUrl(champion.key, patch)}
        alt={champion.name}
        className={`${size === 'large' ? 'h-10 w-10' : 'h-8 w-8'} rounded object-cover`}
      />
      {size === 'large' && (
        <span className="text-white text-sm font-medium truncate flex-1">{champion.name}</span>
      )}
      {isBan && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
          <X className="h-5 w-5 text-red-400" />
        </div>
      )}
    </div>
  )
}

