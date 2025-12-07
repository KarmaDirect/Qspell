'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Tournament {
  id: string
  name: string
  format: string
  status: string
  start_date: string
  max_teams: number
  organizer: {
    username: string
  }
}

export function AdminTournamentsList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/admin/tournaments')
      const data = await response.json()
      
      if (response.ok) {
        setTournaments(data.tournaments || [])
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'outline' | 'default' | 'secondary' | 'destructive'> = {
      upcoming: 'outline',
      registration_open: 'default',
      in_progress: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  if (loading) {
    return <Card className="p-12 text-center">Chargement...</Card>
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Tournoi</th>
              <th className="text-left p-4">Format</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Organisateur</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-12 text-muted-foreground">
                  Aucun tournoi
                </td>
              </tr>
            ) : (
              tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-semibold">{tournament.name}</td>
                  <td className="p-4">{tournament.format}</td>
                  <td className="p-4">{getStatusBadge(tournament.status)}</td>
                  <td className="p-4">
                    {new Date(tournament.start_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">{tournament.organizer?.username || 'Admin'}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

