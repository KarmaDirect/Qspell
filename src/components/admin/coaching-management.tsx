'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, User, Star, Calendar } from 'lucide-react'

interface Coach {
  id: string
  profile: {
    username: string
    display_name?: string
  }
  specialties?: string[]
  available?: boolean
}

interface Session {
  id: string
  date: string
  status: string
  participants_count?: number
}

export function CoachingManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [groupSessions, setGroupSessions] = useState<Session[]>([])
  const [privateSessions, setPrivateSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coachesRes, groupRes, privateRes] = await Promise.all([
        fetch('/api/coaching/coaches'),
        fetch('/api/admin/coaching/group-sessions'),
        fetch('/api/admin/coaching/private-sessions'),
      ])

      const coachesData = await coachesRes.json()
      const groupData = await groupRes.json()
      const privateData = await privateRes.json()

      setCoaches(coachesData.coaches || [])
      setGroupSessions(groupData.sessions || [])
      setPrivateSessions(privateData.sessions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Card className="p-12 text-center">Chargement...</Card>
  }

  return (
    <Tabs defaultValue="coaches" className="space-y-4">
      <TabsList>
        <TabsTrigger value="coaches">
          <User className="h-4 w-4 mr-2" />
          Coachs ({coaches.length})
        </TabsTrigger>
        <TabsTrigger value="group">
          <Users className="h-4 w-4 mr-2" />
          Sessions Groupe ({groupSessions.length})
        </TabsTrigger>
        <TabsTrigger value="private">
          <Calendar className="h-4 w-4 mr-2" />
          Sessions Privées ({privateSessions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="coaches">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Coachs actifs</h3>
            {coaches.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun coach</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coaches.map((coach) => (
                  <Card key={coach.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={coach.profile.avatar_url} />
                        <AvatarFallback>
                          {coach.profile.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{coach.profile.username}</div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{coach.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {coach.total_sessions} sessions
                    </div>
                    <div className="font-semibold">{coach.hourly_rate}€/h</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="group">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sessions de coaching groupe</h3>
          <p className="text-center py-8 text-muted-foreground">
            Aucune session programmée
          </p>
        </Card>
      </TabsContent>

      <TabsContent value="private">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sessions de coaching privé</h3>
          <p className="text-center py-8 text-muted-foreground">
            Aucune session en cours
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

