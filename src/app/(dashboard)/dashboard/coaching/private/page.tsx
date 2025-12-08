import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Video, 
  Star, 
  Calendar,
  Clock,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'

export default async function PrivateCoachingPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock coaches data
  const coaches = [
    { id: 1, name: 'Coach Alpha', rank: 'Challenger', specialty: 'Mid Lane', rating: 4.9, price: 35, sessions: 156, available: true },
    { id: 2, name: 'Coach Beta', rank: 'Grandmaster', specialty: 'Jungle', rating: 4.8, price: 30, sessions: 98, available: true },
    { id: 3, name: 'Coach Gamma', rank: 'Master', specialty: 'ADC', rating: 4.7, price: 25, sessions: 67, available: false },
    { id: 4, name: 'Coach Delta', rank: 'Diamond', specialty: 'Support', rating: 4.6, price: 20, sessions: 45, available: true },
  ]

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
            <Video className="h-3 w-3 mr-1" />
            Formation
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Coaching Privé</h1>
          <p className="text-[#666]">
            Sessions 1-on-1 avec nos coachs experts
          </p>
        </div>
      </div>

      {/* Info */}
      <Card className="p-4 bg-[#c8ff00]/10 border-[#c8ff00]/20">
        <div className="flex items-start gap-3">
          <Video className="h-5 w-5 text-[#c8ff00] mt-0.5" />
          <div>
            <p className="font-medium text-white">Comment ça marche ?</p>
            <p className="text-sm text-[#888]">
              Réservez une session avec le coach de votre choix. Vous recevrez un lien Discord/Zoom pour la session.
              Le coach analysera vos replays et vous donnera des conseils personnalisés.
            </p>
          </div>
        </div>
      </Card>

      {/* Coaches Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id} className="overflow-hidden bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-2xl font-bold text-[#c8ff00] shrink-0">
                  {coach.name.split(' ')[1]?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{coach.name}</h3>
                    <Badge className={coach.available ? 'bg-[#c8ff00]/10 text-[#c8ff00] border-0' : 'bg-[#1a1a1a] text-[#666] border-0'}>
                      {coach.available ? 'Disponible' : 'Indisponible'}
                    </Badge>
                  </div>
                  <p className="text-[#c8ff00] font-medium">{coach.rank}</p>
                  <p className="text-sm text-[#666]">{coach.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-[#666]">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#c8ff00] fill-[#c8ff00]" />
                  <span>{coach.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>{coach.sessions} sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>1h</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a1a1a]">
                <div>
                  <span className="text-2xl font-bold text-white">{coach.price}€</span>
                  <span className="text-[#666]">/session</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
                    <MessageCircle className="h-4 w-4" />
                    Contacter
                  </Button>
                  <Button size="sm" className="gap-2 bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold" disabled={!coach.available}>
                    <Calendar className="h-4 w-4" />
                    Réserver
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

