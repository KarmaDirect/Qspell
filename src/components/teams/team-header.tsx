'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, MapPin } from 'lucide-react'

interface Team {
  name: string
  tag: string
  logo_url?: string
  region: string
  description?: string
  looking_for_players: boolean
  captain: {
    username: string
  }
}

interface TeamHeaderProps {
  team: Team
  isCaptain: boolean
}

export function TeamHeader({ team, isCaptain }: TeamHeaderProps) {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {team.tag}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {isCaptain && (
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" />
                Capitaine
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{team.region.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Capitaine: {team.captain.username}</span>
            </div>
          </div>
          
          {team.description && (
            <p className="text-muted-foreground">{team.description}</p>
          )}
          
          <div className="mt-4 flex gap-2">
            {team.looking_for_players && (
              <Badge variant="outline" className="text-green-500">
                Recrute des joueurs
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

