import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { EventCalendar } from '@/components/dashboard/EventCalendar'

export default function DashboardPage() {
  // TODO: Récupérer le vrai user depuis l'auth
  const user = { username: 'hatim' }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection username={user.username} />
        <QuickActions />
        <EventCalendar />
      </main>
      
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[oklch(0.60_0.25_250)]/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
