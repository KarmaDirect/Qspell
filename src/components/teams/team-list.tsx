'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Calendar, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Team {
  id: string
  name: string
  tag: string
  logo_url?: string
  region: string
  looking_for_players: boolean
  member_role: string
  member_since: string
  captain: {
    username: string
  }
  created_at: string
}

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()
      
      if (response.ok) {
        setTeams(data.teams || [])
      } else {
        toast.error('Erreur lors du chargement des équipes')
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Erreur lors du chargement des équipes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Aucune équipe
        </h3>
        <p className="text-muted-foreground mb-4">
          Vous n&apos;êtes membre d&apos;aucune équipe pour le moment.
        </p>
        <p className="text-sm text-muted-foreground">
          Créez une équipe ou attendez une invitation !
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
                  {team.tag}
                </div>
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {team.region.toUpperCase()}
                  </p>
                </div>
              </div>
              {team.member_role === 'captain' && (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Capitaine: {team.captain.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {new Date(team.member_since).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Badge variant={team.member_role === 'captain' ? 'default' : 'secondary'}>
                {team.member_role === 'captain' ? 'Capitaine' : 'Membre'}
              </Badge>
              {team.looking_for_players && (
                <Badge variant="outline" className="text-green-500">
                  Recrute
                </Badge>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

