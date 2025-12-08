import { Calendar } from '@/components/calendar/calendar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Sparkles, Info } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <CalendarIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground mt-1">
            Tous les événements de la communauté QSPELL
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-blue-200">
              Le calendrier affiche tous les événements publics organisés par QSPELL et la communauté.
              Cliquez sur une date pour voir les détails des événements.
            </p>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Calendar />

      {/* Legend */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Types d'événements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-600" />
            <span className="text-sm text-muted-foreground">Tournois</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm text-muted-foreground">Coaching Groupe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span className="text-sm text-muted-foreground">Événements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-muted-foreground">Personnalisé</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

