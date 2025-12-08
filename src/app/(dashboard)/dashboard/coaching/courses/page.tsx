import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  BookOpen, 
  Play, 
  Clock,
  ArrowLeft,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react'

export default async function CoursesPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock courses
  const courses = [
    { id: 1, title: 'Fondamentaux Mid Lane', lessons: 12, duration: '3h 45min', level: 'Débutant', rating: 4.9, views: 1250, free: true },
    { id: 2, title: 'Wave Management Avancé', lessons: 8, duration: '2h 30min', level: 'Intermédiaire', rating: 4.8, views: 890, free: false },
    { id: 3, title: 'Vision Control Pro', lessons: 10, duration: '2h 15min', level: 'Avancé', rating: 4.7, views: 756, free: false },
    { id: 4, title: 'Jungle Pathing Masterclass', lessons: 15, duration: '4h 20min', level: 'Tous niveaux', rating: 4.9, views: 2100, free: false },
    { id: 5, title: 'Trading en Lane', lessons: 6, duration: '1h 45min', level: 'Débutant', rating: 4.6, views: 650, free: true },
    { id: 6, title: 'Objectifs & Macro Game', lessons: 9, duration: '2h 50min', level: 'Intermédiaire', rating: 4.8, views: 980, free: false },
  ]

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Débutant': 'bg-green-500',
      'Intermédiaire': 'bg-yellow-500',
      'Avancé': 'bg-red-500',
      'Tous niveaux': 'bg-blue-500'
    }
    return colors[level] || 'bg-gray-500'
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
            <BookOpen className="h-3 w-3 mr-1" />
            Formation
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Cours en ligne</h1>
          <p className="text-[#666]">
            Apprenez à votre rythme avec nos cours vidéo
          </p>
        </div>
      </div>

      {/* Premium Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-[#c8ff00]/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">QSPELL Premium</h2>
            <p className="text-[#666]">
              Accès illimité à tous les cours • Nouveaux contenus chaque semaine
            </p>
          </div>
          <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
            S'abonner - 9.99€/mois
          </Button>
        </div>
      </Card>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-[#c8ff00]/10 to-transparent relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center group-hover:bg-[#c8ff00]/30 transition-colors">
                <Play className="h-8 w-8 text-[#c8ff00]" />
              </div>
              <div className="absolute top-3 left-3">
                <Badge className={`${getLevelColor(course.level)} border-0`}>
                  {course.level}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                {course.free ? (
                  <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-0">Gratuit</Badge>
                ) : (
                  <Badge className="bg-[#1a1a1a] text-[#666] border-0 gap-1">
                    <Lock className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-[#c8ff00] transition-colors">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-[#666] mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons} leçons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-[#c8ff00] fill-[#c8ff00]" />
                    <span className="font-medium text-white">{course.rating}</span>
                  </div>
                  <span className="text-sm text-[#666]">
                    {course.views} vues
                  </span>
                </div>
                <Button size="sm" className={course.free ? 'bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold' : 'border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]'} variant={course.free ? 'default' : 'outline'}>
                  {course.free ? 'Commencer' : 'Voir'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

