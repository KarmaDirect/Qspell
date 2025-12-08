import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  GraduationCap, 
  Users, 
  Video,
  BookOpen,
  Star,
  Clock,
  ArrowRight,
  Crown,
  Zap
} from 'lucide-react'

export default async function CoachingPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Types de coaching
  const coachingTypes = [
    {
      title: 'Coaching Privé',
      description: 'Sessions 1-on-1 avec un coach certifié pour progresser rapidement',
      icon: Video,
      color: 'from-purple-500 to-pink-500',
      features: ['Sessions personnalisées', 'Analyse de replays', 'Plan de progression'],
      href: '/dashboard/coaching/private',
      price: 'À partir de 25€/h'
    },
    {
      title: 'Coaching Groupe',
      description: 'Apprenez en équipe avec des sessions de groupe thématiques',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      features: ['Sessions live', 'Interaction groupe', 'Prix réduit'],
      href: '/dashboard/coaching/group',
      price: 'À partir de 10€/session'
    },
    {
      title: 'Cours en ligne',
      description: 'Accédez à notre bibliothèque de cours vidéo à votre rythme',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      features: ['Accès illimité', '+50 cours', 'Mises à jour'],
      href: '/dashboard/coaching/courses',
      price: 'Abonnement 9.99€/mois'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <GraduationCap className="h-3 w-3 mr-1" />
          Formation
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Coaching</h1>
        <p className="text-[#666]">
          Progressez avec nos coachs experts League of Legends
        </p>
      </div>

      {/* Premium Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-[#c8ff00]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-[#c8ff00]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">QSPELL Premium</h2>
              <p className="text-sm text-[#666]">
                Accès illimité à tous les cours + réductions sur le coaching
              </p>
            </div>
          </div>
          <Button className="bg-[#c8ff00] hover:bg-[#b8ef00] text-black font-semibold gap-2">
            <Zap className="h-4 w-4" />
            Découvrir
          </Button>
        </div>
      </Card>

      {/* Coaching Types */}
      <div className="grid md:grid-cols-3 gap-6">
        {coachingTypes.map((type, index) => {
          const Icon = type.icon
          return (
            <Card key={index} className="overflow-hidden bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
              {/* Header */}
              <div className="h-32 bg-gradient-to-br from-[#c8ff00]/20 to-transparent relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#c8ff00]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{type.title}</h3>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <p className="text-[#666] text-sm mb-4">
                  {type.description}
                </p>
                
                <ul className="space-y-2 mb-4">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#888]">
                      <Star className="h-4 w-4 text-[#c8ff00]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                  <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0">
                    {type.price}
                  </Badge>
                  <Link href={type.href}>
                    <Button size="sm" variant="ghost" className="gap-1 text-[#888] hover:text-[#c8ff00]">
                      Voir <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Featured Coaches */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <Star className="h-5 w-5 text-[#c8ff00]" />
          Nos meilleurs coachs
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Coach Alpha', rank: 'Challenger', specialty: 'Mid Lane', rating: 4.9 },
            { name: 'Coach Beta', rank: 'Grandmaster', specialty: 'Jungle', rating: 4.8 },
            { name: 'Coach Gamma', rank: 'Master', specialty: 'ADC', rating: 4.7 },
            { name: 'Coach Delta', rank: 'Diamond', specialty: 'Support', rating: 4.6 },
          ].map((coach, i) => (
            <Card key={i} className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all">
              <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-[#c8ff00]">
                {coach.name.split(' ')[1]?.charAt(0) || 'C'}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white">{coach.name}</h3>
                <p className="text-sm text-[#c8ff00]">{coach.rank}</p>
                <p className="text-xs text-[#666]">{coach.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-[#c8ff00] fill-[#c8ff00]" />
                  <span className="text-sm text-white">{coach.rating}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

