import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { 
  Trophy, 
  Users, 
  Gamepad2, 
  Calendar, 
  ArrowRight, 
  Zap,
  Target,
  Star,
  Shield
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#888] hover:text-white">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              La plateforme esport de référence
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trouve ton équipe.
              <br />
              <span className="text-[#c8ff00]">Domine le jeu.</span>
            </h1>
            
            <p className="text-lg text-[#666] max-w-2xl mx-auto mb-10">
              Rejoins des milliers de joueurs sur QSPELL. Crée ton équipe, participe aux tournois 
              et grimpe les classements pour devenir le meilleur.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold text-base px-8 h-12">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-[#333] text-white hover:bg-[#1a1a1a] h-12 px-8">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#c8ff00]/10 rounded-full blur-3xl" />
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Joueurs actifs' },
              { value: '500+', label: 'Équipes' },
              { value: '100+', label: 'Tournois' },
              { value: '50K€', label: 'Distribués' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-[#c8ff00]">{stat.value}</p>
                <p className="text-sm text-[#666] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tout ce qu'il te faut pour performer
            </h2>
            <p className="text-[#666] max-w-xl mx-auto">
              QSPELL offre tous les outils nécessaires pour gérer ton parcours esport.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Users, 
                title: 'Gestion d\'équipe', 
                description: 'Crée et gère ton équipe, invite des joueurs et organisez-vous.' 
              },
              { 
                icon: Trophy, 
                title: 'Tournois', 
                description: 'Participe à des tournois compétitifs et gagne des récompenses.' 
              },
              { 
                icon: Gamepad2, 
                title: 'Compte Riot', 
                description: 'Lie ton compte LoL pour afficher tes stats et ton rang.' 
              },
              { 
                icon: Calendar, 
                title: 'Calendrier', 
                description: 'Suis tous les événements et matchs à venir en un coup d\'œil.' 
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl bg-[#141414] border border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center mb-4 group-hover:bg-[#c8ff00]/20 transition-all">
                    <Icon className="h-6 w-6 text-[#c8ff00]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#666]">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why QSPELL */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Pourquoi choisir <span className="text-[#c8ff00]">QSPELL</span> ?
              </h2>
              <p className="text-[#666] mb-8">
                Une plateforme conçue par des joueurs, pour des joueurs. 
                Nous comprenons tes besoins et créons les outils pour t'aider à réussir.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Target, text: 'Matchmaking précis basé sur ton niveau' },
                  { icon: Star, text: 'Coaching personnalisé avec des pros' },
                  { icon: Shield, text: 'Communauté modérée et bienveillante' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#c8ff00]" />
                      </div>
                      <span className="text-white">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-[#141414] border border-[#1a1a1a] flex items-center justify-center">
                <Logo size="lg" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#c8ff00]/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-[#1a1a1a] p-12 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à rejoindre l'arène ?
              </h2>
              <p className="text-[#666] max-w-xl mx-auto mb-8">
                Inscris-toi gratuitement et commence à jouer dès maintenant.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold text-base px-8 h-12">
                  Créer mon compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c8ff00]/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-[#666]">
              © 2025 QSPELL. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
