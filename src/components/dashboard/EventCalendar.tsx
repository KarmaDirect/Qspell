'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Users, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarDayProps {
  day: number
  hasEvent?: boolean
  isToday?: boolean
}

function CalendarDay({ day, hasEvent, isToday }: CalendarDayProps) {
  return (
    <button
      className={cn(
        "aspect-square rounded-lg border transition-all hover:scale-105",
        isToday && "border-primary bg-primary/10 font-semibold text-primary",
        !isToday && "border-border hover:border-primary/50 hover:bg-card",
        hasEvent && "relative"
      )}
    >
      {day}
      {hasEvent && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      )}
    </button>
  )
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  time: string
  status: 'victory' | 'info' | 'success'
}

function ActivityItem({ icon: Icon, title, time, status }: ActivityItemProps) {
  const statusColors = {
    victory: 'text-primary',
    info: 'text-blue-500',
    success: 'text-[oklch(0.65_0.20_145)]'
  }
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
      <div className={cn("p-2 rounded-lg bg-card", statusColors[status])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

export function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11)) // Décembre 2025
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()
  
  const today = 7 // Jour actuel
  const eventsOnDays = [7, 15, 23] // Jours avec événements
  
  return (
    <section className="container py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Calendrier des événements</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-lg font-medium px-4">
                  {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Grille calendrier */}
            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <CalendarDay 
                  key={day} 
                  day={day} 
                  hasEvent={eventsOnDays.includes(day)}
                  isToday={day === today}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Activité récente */}
        <div className="glass rounded-xl p-6 border border-border">
          <h3 className="text-xl font-bold mb-4">Activité récente</h3>
          <div className="space-y-2">
            <ActivityItem
              icon={Trophy}
              title="Tournoi Bronze Cup"
              time="Il y a 2 heures"
              status="victory"
            />
            <ActivityItem
              icon={Users}
              title="Équipe créée"
              time="Hier"
              status="info"
            />
            <ActivityItem
              icon={Award}
              title="50€ gagnés"
              time="Il y a 3 jours"
              status="success"
            />
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Aucune activité récente. Commencez par rejoindre un tournoi ou créer une équipe !
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
