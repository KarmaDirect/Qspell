'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  RefreshCw
} from 'lucide-react'

interface TournamentBracketProps {
  tournament: any
  matches: any[]
  registrations: any[]
  canManage: boolean
}

interface MatchCardProps {
  match: any
  team1: any
  team2: any
  roundName: string
  canManage: boolean
  onUpdateScore?: (matchId: string, team1Score: number, team2Score: number) => void
}

function MatchCard({ match, team1, team2, roundName, canManage, onUpdateScore }: MatchCardProps) {
  const isCompleted = match?.status === 'completed'
  const isLive = match?.status === 'in_progress'
  
  return (
    <div className="w-52 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] overflow-hidden">
      {/* Header */}
      <div className="px-3 py-1.5 bg-[#141414] border-b border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[10px] text-[#666] font-medium">{roundName}</span>
        {isLive && (
          <Badge className="bg-red-500/20 text-red-400 border-0 text-[9px] px-1.5">
            LIVE
          </Badge>
        )}
        {isCompleted && (
          <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-0 text-[9px] px-1.5">
            Terminé
          </Badge>
        )}
      </div>
      
      {/* Teams */}
      <div className="divide-y divide-[#1a1a1a]">
        {/* Team 1 */}
        <div className={`flex items-center justify-between px-3 py-2 ${
          isCompleted && match?.winner_id === team1?.id ? 'bg-[#c8ff00]/5' : ''
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#666] shrink-0">
              {team1?.tag?.substring(0, 2) || '?'}
            </div>
            <span className={`text-sm truncate ${
              isCompleted && match?.winner_id === team1?.id ? 'text-[#c8ff00] font-semibold' : 'text-white'
            }`}>
              {team1?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm font-bold ml-2 ${
            isCompleted && match?.winner_id === team1?.id ? 'text-[#c8ff00]' : 'text-[#666]'
          }`}>
            {match?.team1_score ?? '-'}
          </span>
        </div>
        
        {/* Team 2 */}
        <div className={`flex items-center justify-between px-3 py-2 ${
          isCompleted && match?.winner_id === team2?.id ? 'bg-[#c8ff00]/5' : ''
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#666] shrink-0">
              {team2?.tag?.substring(0, 2) || '?'}
            </div>
            <span className={`text-sm truncate ${
              isCompleted && match?.winner_id === team2?.id ? 'text-[#c8ff00] font-semibold' : 'text-white'
            }`}>
              {team2?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm font-bold ml-2 ${
            isCompleted && match?.winner_id === team2?.id ? 'text-[#c8ff00]' : 'text-[#666]'
          }`}>
            {match?.team2_score ?? '-'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TournamentBracket({ 
  tournament, 
  matches, 
  registrations,
  canManage
}: TournamentBracketProps) {
  const [zoom, setZoom] = useState(1)
  
  const teams = registrations.map(r => r.team).filter(Boolean)
  const format = tournament.format
  
  // Calculate rounds based on team count
  const teamCount = tournament.max_teams || 16
  const rounds = Math.ceil(Math.log2(teamCount))
  
  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Finale'
    if (round === totalRounds - 1) return 'Demi-finales'
    if (round === totalRounds - 2) return 'Quarts'
    if (round === totalRounds - 3) return 'Huitièmes'
    return `Round ${round}`
  }

  // Generate bracket structure
  const generateBracket = () => {
    const bracket: any[][] = []
    
    for (let r = 1; r <= rounds; r++) {
      const matchesInRound = Math.pow(2, rounds - r)
      const roundMatches: any[] = []
      
      for (let m = 0; m < matchesInRound; m++) {
        // Find actual match data or create placeholder
        const matchData = matches.find(
          match => match.round === r && match.match_number === m + 1
        )
        
        // For first round, assign teams
        let team1 = null
        let team2 = null
        
        if (r === 1) {
          const idx1 = m * 2
          const idx2 = m * 2 + 1
          team1 = teams[idx1] || null
          team2 = teams[idx2] || null
        }
        
        roundMatches.push({
          match: matchData,
          team1,
          team2,
          round: r,
          matchNumber: m + 1
        })
      }
      
      bracket.push(roundMatches)
    }
    
    return bracket
  }

  const bracket = generateBracket()

  // If no teams registered yet
  if (teams.length === 0) {
    return (
      <Card className="p-12 bg-[#141414] border-[#1a1a1a] text-center">
        <Trophy className="h-12 w-12 mx-auto text-[#333] mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Bracket non disponible</h3>
        <p className="text-[#666]">
          Le bracket sera généré une fois que les équipes seront inscrites et le tournoi lancé.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#666] hover:text-white"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#666] w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#666] hover:text-white"
            onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#666] hover:text-white"
            onClick={() => setZoom(1)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {canManage && (
          <Button variant="ghost" className="text-[#666] hover:text-white gap-2">
            <RefreshCw className="h-4 w-4" />
            Regénérer
          </Button>
        )}
      </div>

      {/* Bracket Container */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a] overflow-x-auto">
        <div 
          className="flex gap-8 min-w-max transition-transform"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'left top' }}
        >
          {bracket.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="flex flex-col">
              {/* Round Header */}
              <div className="mb-4 text-center">
                <Badge className="bg-[#1a1a1a] text-[#888] border-0">
                  {getRoundName(roundIndex + 1, rounds)}
                </Badge>
              </div>
              
              {/* Matches */}
              <div 
                className="flex flex-col justify-around flex-1 gap-4"
                style={{ 
                  paddingTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 20}px` : 0,
                  gap: `${Math.pow(2, roundIndex + 1) * 16}px`
                }}
              >
                {roundMatches.map((matchData, matchIndex) => (
                  <div key={matchIndex} className="relative">
                    <MatchCard
                      match={matchData.match}
                      team1={matchData.team1}
                      team2={matchData.team2}
                      roundName={`Match ${matchData.matchNumber}`}
                      canManage={canManage}
                    />
                    
                    {/* Connector lines */}
                    {roundIndex < rounds - 1 && (
                      <div className="absolute right-0 top-1/2 w-8 border-t border-[#333]" 
                           style={{ transform: 'translateX(100%)' }} 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Winner */}
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-0">
                Champion
              </Badge>
            </div>
            <div className="w-52 p-6 rounded-lg border-2 border-[#c8ff00]/30 bg-[#c8ff00]/5 text-center">
              <Trophy className="h-10 w-10 mx-auto text-[#c8ff00] mb-3" />
              <p className="text-sm text-[#666]">À déterminer</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Double Elimination Lower Bracket */}
      {format === 'double_elimination' && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h3 className="text-lg font-bold text-white mb-4">Lower Bracket</h3>
          <div className="text-center py-8 text-[#666]">
            <p>Le Lower Bracket sera disponible après le premier round</p>
          </div>
        </Card>
      )}
    </div>
  )
}

