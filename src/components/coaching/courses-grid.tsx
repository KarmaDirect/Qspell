'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Play, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  lane: string
  is_premium: boolean
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_preview: boolean
  }>
}

interface CoursesGridProps {
  hasSubscription: boolean
}

interface UserProgress {
  progress: number
  completed?: boolean
}

const laneIcons: Record<string, string> = {
  top: '🏆',
  jungle: '🌲',
  mid: '⚡',
  bot: '🎯',
  support: '🛡️',
  general: '🌟',
}

const laneColors: Record<string, string> = {
  top: 'from-orange-500 to-red-600',
  jungle: 'from-green-500 to-emerald-600',
  mid: 'from-blue-500 to-cyan-600',
  bot: 'from-purple-500 to-pink-600',
  support: 'from-yellow-500 to-amber-600',
  general: 'from-indigo-500 to-purple-600',
}

export function CoursesGrid({ hasSubscription }: CoursesGridProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      if (response.ok) {
        setCourses(data.courses || [])
        setUserProgress(data.userProgress || {})
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalDuration = (lessons: Course['lessons']) => {
    return lessons.reduce((acc, lesson) => acc + (lesson.duration_minutes || 0), 0)
  }

  const getProgress = (courseId: string) => {
    return userProgress[courseId]?.progress || 0
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-48 bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Formations Disponibles</h2>
        <p className="text-muted-foreground">
          {hasSubscription 
            ? 'Accédez à toutes les formations avec votre abonnement' 
            : 'Abonnez-vous pour débloquer toutes les formations'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const progress = getProgress(course.id)
          const canAccess = !course.is_premium || hasSubscription
          const totalDuration = getTotalDuration(course.lessons || [])

          return (
            <Card 
              key={course.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                !canAccess ? 'opacity-75' : ''
              }`}
            >
              <div className={`h-32 bg-linear-to-br ${laneColors[course.lane] || 'from-gray-500 to-gray-600'} relative`}>
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  {laneIcons[course.lane] || '📚'}
                </div>
                {!canAccess && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <Badge variant="outline" className="uppercase">
                    {course.lane}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>{(course.lessons || []).length} leçons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(totalDuration / 60)}h {totalDuration % 60}min</span>
                  </div>
                </div>

                {progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Link href={`/dashboard/coaching/courses/${course.slug}`}>
                  <Button 
                    className="w-full" 
                    variant={canAccess ? "default" : "outline"}
                    disabled={!canAccess}
                  >
                    {canAccess ? (
                      <>
                        {progress > 0 ? 'Continuer' : 'Commencer'} 
                        {progress === 100 && <CheckCircle className="h-4 w-4 ml-2" />}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Premium requis
                      </>
                    )}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

