import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Users, 
  Calendar,
  Clock,
  ArrowLeft,
  Star,
  MapPin
} from 'lucide-react'

export default async function GroupCoachingPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock group sessions
  const sessions = [
    { id: 1, title: 'Masterclass Mid Lane', coach: 'Coach Alpha', date: '2024-01-20', time: '20:00', spots: 3, maxSpots: 10, price: 15, lane: 'mid' },
    { id: 2, title: 'Jungle Pathing Avancé', coach: 'Coach Beta', date: '2024-01-21', time: '19:00', spots: 5, maxSpots: 8, price: 12, lane: 'jungle' },
    { id: 3, title: 'Vision Control Workshop', coach: 'Coach Gamma', date: '2024-01-22', time: '21:00', spots: 0, maxSpots: 12, price: 10, lane: 'support' },
    { id: 4, title: 'Wave Management', coach: 'Coach Delta', date: '2024-01-23', time: '18:00', spots: 7, maxSpots: 10, price: 10, lane: 'all' },
  ]

  const getLaneColor = (lane: string) => {
    const colors: Record<string, string> = {
      mid: 'bg-red-500',
      jungle: 'bg-green-500',
      adc: 'bg-yellow-500',
      support: 'bg-blue-500',
      top: 'bg-purple-500',
      all: 'bg-gray-500'
    }
    return colors[lane] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/coaching">
          <Button variant="ghost" size="icon" className="text-[#888] hover:text-white hover:bg-[#1a1a1a]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <Users className="h-3 w-3 mr-1" />
            Formation
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Coaching Groupe</h1>
          <p className="text-[#666]">
            Sessions thématiques en groupe avec nos coachs
          </p>
        </div>
      </div>

      {/* Info */}
      <Card className="p-4 bg-[#c8ff00]/10 border-[#c8ff00]/20">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-[#c8ff00] mt-0.5" />
          <div>
            <p className="font-medium text-white">Apprenez en groupe !</p>
            <p className="text-sm text-[#888]">
              Rejoignez nos sessions de groupe thématiques. Prix réduit, interaction avec d'autres joueurs,
              et apprentissage collectif. Chaque session dure environ 1h30.
            </p>
          </div>
        </div>
      </Card>

      {/* Sessions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map((session) => {
          const isFull = session.spots === 0
          return (
            <Card key={session.id} className={`overflow-hidden bg-[#141414] border-[#1a1a1a] transition-all ${isFull ? 'opacity-60' : 'hover:border-[#c8ff00]/30'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getLaneColor(session.lane)} border-0`}>
                        {session.lane.toUpperCase()}
                      </Badge>
                      {isFull && <Badge className="bg-red-500/20 text-red-400 border-0">Complet</Badge>}
                    </div>
                    <h3 className="text-xl font-bold text-white">{session.title}</h3>
                    <p className="text-[#666]">par {session.coach}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">{session.price}€</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#666]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{session.maxSpots - session.spots}/{session.maxSpots} places</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(session.maxSpots - session.spots, 4) }).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-[#c8ff00]/20 border-2 border-[#141414] flex items-center justify-center text-xs font-bold text-[#c8ff00]">
                          ?
                        </div>
                      ))}
                      {session.maxSpots - session.spots > 4 && (
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#141414] flex items-center justify-center text-xs text-[#666]">
                          +{session.maxSpots - session.spots - 4}
                        </div>
                      )}
                    </div>
                    <Button disabled={isFull} className={isFull ? '' : 'bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold'}>
                      {isFull ? 'Complet' : 'Rejoindre'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

