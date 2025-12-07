import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Users, GraduationCap, Target, TrendingUp, Shield } from 'lucide-react'
import { Calendar } from '@/components/calendar/calendar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-950 via-slate-900 to-purple-950">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              QSPELL
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-6xl">⚡</span>
            <h2 className="text-6xl md:text-7xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              QSPELL
            </h2>
            <span className="text-6xl">⚡</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-purple-300 mb-4">
          Master Your Q. Master Your Win.
        </p>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          La plateforme où chaque Q compte. Participe à des tournois,
          rejoins des ligues, trouve des coéquipiers et deviens un Q God !
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Commencer maintenant
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Voir les tournois
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Trophy className="h-10 w-10" />}
            title="Tournois amateurs"
            description="Créez ou participez à des tournois communautaires avec différents formats de bracket"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10" />}
            title="Ligues saisonnières"
            description="Rejoignez des ligues compétitives avec système de divisions et promotion/relégation"
          />
          <FeatureCard
            icon={<GraduationCap className="h-10 w-10" />}
            title="Coaching & Formations"
            description="Progressez avec des coachs expérimentés et des formations sur-mesure"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="Trouvez des coéquipiers"
            description="Système de matchmaking intelligent pour constituer votre équipe idéale"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10" />}
            title="Stats & Profils"
            description="Profils détaillés avec statistiques Riot Games en temps réel"
          />
          <FeatureCard
            icon={<Target className="h-10 w-10" />}
            title="Réseau social"
            description="Feed d&apos;activité, posts, highlights et suivez vos joueurs préférés"
          />
        </div>
      </section>

      {/* Calendar Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Calendrier des événements</h3>
          <p className="text-lg text-gray-300">
            Ne manque aucun tournoi, coaching ou événement QSPELL
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg">
            <Calendar compact={false} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">⚡</span>
            <h3 className="text-4xl font-bold">Rejoins les Q Gods</h3>
            <span className="text-5xl">⚡</span>
          </div>
          <p className="text-xl mb-8 text-gray-100">
            Maîtrise ton Q, remporte tes matchs, gagne des récompenses
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-12">
              Devenir un Q Master
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <span className="text-xl">⚡</span>
            <span>&copy; 2024 QSPELL - Where Every Q Counts</span>
            <span className="text-xl">⚡</span>
          </p>
          <p className="text-sm mt-2">
            QSPELL n&apos;est pas affilié à Riot Games.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="text-primary mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
