'use client'

import { MatchResultUltraCompact } from './MatchResultUltraCompact'
import type { MatchResultCompactProps } from './MatchResultCompact'

interface MatchHistoryListProps {
  matches: MatchResultCompactProps[]
}

export function MatchHistoryList({ matches }: MatchHistoryListProps) {
  return (
    <div className="space-y-3">
      {matches.map((match, idx) => (
        <div key={idx} className="relative">
          {/* Date séparateur si nouvelle journée */}
          {(idx === 0 || matches[idx - 1].gameDate !== match.gameDate) && (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-[#888]">
                {match.gameDate}
              </span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
            </div>
          )}
          
          <MatchResultUltraCompact
            blueTeam={match.blueTeam}
            redTeam={match.redTeam}
            gameDuration={match.gameDuration}
            gameDate={match.gameDate}
          />
        </div>
      ))}
    </div>
  )
}

