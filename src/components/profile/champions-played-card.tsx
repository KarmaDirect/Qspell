'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Sword, Loader2 } from 'lucide-react'
import { getChampionById, getChampionIconUrl } from '@/lib/riot/champions'
import Image from 'next/image'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']

interface ChampionMastery {
  championId: number
  championLevel: number
  championPoints: number
  championPointsSinceLastLevel: number
  championPointsUntilNextLevel: number
}

interface ChampionDisplay {
  id: number
  name: string
  key: string
  level: number
  points: number
}

export function ChampionsPlayedCard({ 
  riotAccount 
}: { 
  riotAccount: RiotAccount | null 
}) {
  const [champions, setChampions] = useState<ChampionDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChampions() {
      if (!riotAccount?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/riot/champions?riotAccountId=${riotAccount.id}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch champions')
        }

        const { champions: masteryData } = await response.json()

        const championsData: ChampionDisplay[] = masteryData
          .map((mastery: ChampionMastery) => {
            const champion = getChampionById(mastery.championId)
            if (!champion) return null
            return {
              id: champion.id,
              name: champion.name,
              key: champion.key,
              level: mastery.championLevel,
              points: mastery.championPoints
            }
          })
          .filter((c): c is ChampionDisplay => c !== null)

        setChampions(championsData)
      } catch (err) {
        console.error('Error fetching champions:', err)
        setError('Impossible de charger les champions')
      } finally {
        setLoading(false)
      }
    }

    fetchChampions()
  }, [riotAccount?.id])

  if (!riotAccount) {
    return null
  }

  if (loading) {
    return (
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
          <Sword className="h-5 w-5 text-[#c8ff00]" />
          Champions joués
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#c8ff00]" />
        </div>
      </Card>
    )
  }

  if (error || champions.length === 0) {
    return (
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
          <Sword className="h-5 w-5 text-[#c8ff00]" />
          Champions joués
        </h3>
        <div className="text-center py-6 text-[#666]">
          <Sword className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {error || 'Aucun champion trouvé'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
        <Sword className="h-5 w-5 text-[#c8ff00]" />
        Champions joués
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {champions.map((champion) => (
          <div 
            key={champion.id} 
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative mb-2">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-[#1a1a1a] group-hover:border-[#c8ff00]/50 transition-colors">
                <Image
                  src={getChampionIconUrl(champion.key)}
                  alt={champion.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              {/* Mastery Level Badge */}
              <div className="absolute -bottom-1 -right-1 bg-[#141414] border border-[#c8ff00] rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#c8ff00]">
                  M{champion.level}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-white text-center mb-1">
              {champion.name}
            </p>
            <p className="text-[10px] text-[#666] text-center">
              {Math.floor(champion.points / 1000)}k pts
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

