'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, CheckCircle, Lock } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  lane: string
  lessons: Array<{
    id: string
    title: string
    description: string
    video_url: string
    content: string
    duration_minutes: number
    is_preview: boolean
    order_index: number
  }>
}

interface CourseHeaderProps {
  course: Course
  hasSubscription: boolean
  progress: Record<string, any>
}

const laneColors: Record<string, string> = {
  top: 'from-orange-500 to-red-600',
  jungle: 'from-green-500 to-emerald-600',
  mid: 'from-blue-500 to-cyan-600',
  bot: 'from-purple-500 to-pink-600',
  support: 'from-yellow-500 to-amber-600',
  general: 'from-indigo-500 to-purple-600',
}

export function CourseHeader({ course, hasSubscription, progress }: CourseHeaderProps) {
  const totalLessons = course.lessons?.length || 0
  const completedLessons = Object.values(progress).filter((p: any) => p.completed).length
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className={`rounded-2xl bg-linear-to-br ${laneColors[course.lane] || 'from-gray-500 to-gray-600'} p-8 text-white mb-8`}>
      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
          {course.lane.toUpperCase()}
        </Badge>

        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        
        <p className="text-lg text-white/90 mb-6">{course.description}</p>

        {overallProgress > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progression globale</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs mt-2 text-white/80">
              {completedLessons} / {totalLessons} leçons complétées
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

