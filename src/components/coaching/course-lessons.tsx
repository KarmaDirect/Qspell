'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, Clock, Lock } from 'lucide-react'
import { useState } from 'react'

interface Lesson {
  id: string
  title: string
  description?: string
  video_url?: string
  content?: string
  duration_minutes: number
  is_preview: boolean
  order_index: number
}

interface Course {
  id: string
  title: string
  is_premium: boolean
  lessons?: Lesson[]
}

interface LessonProgress {
  completed: boolean
  progress?: number
}

interface CourseLessonsProps {
  course: Course
  progress: Record<string, LessonProgress>
  hasSubscription: boolean
}

export function CourseLessons({ course, progress, hasSubscription }: CourseLessonsProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(course.lessons?.[0] || null)

  const canAccessLesson = (lesson: Lesson) => {
    return !course.is_premium || hasSubscription || lesson.is_preview
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Lessons List */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Leçons ({course.lessons?.length || 0})</h3>
          <div className="space-y-2">
            {(course.lessons || []).map((lesson: Lesson, index: number) => {
              const isCompleted = progress[lesson.id]?.completed
              const canAccess = canAccessLesson(lesson)

              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedLesson?.id === lesson.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  } ${!canAccess ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{lesson.title}</span>
                        {!canAccess && <Lock className="h-3 w-3 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration_minutes || 0} min</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Lesson Content */}
      <div className="lg:col-span-2">
        {selectedLesson ? (
          <Card className="p-6">
            {!canAccessLesson(selectedLesson) ? (
              <div className="text-center py-12">
                <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Leçon Premium</h3>
                <p className="text-muted-foreground">
                  Abonnez-vous pour accéder à cette leçon
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                    {selectedLesson.description && (
                      <p className="text-muted-foreground">{selectedLesson.description}</p>
                    )}
                  </div>
                  {progress[selectedLesson.id]?.completed && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Complétée
                    </Badge>
                  )}
                </div>

                {selectedLesson.video_url ? (
                  <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Lecture vidéo disponible
                      </p>
                      <Button className="mt-4" onClick={() => window.open(selectedLesson.video_url, '_blank')}>
                        Ouvrir la vidéo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none mb-6">
                    {selectedLesson.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                    ) : (
                      <p className="text-muted-foreground">
                        Contenu de la leçon à venir...
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => {
                    // Mark as completed (TODO: implement API)
                    console.log('Mark lesson as completed:', selectedLesson.id)
                  }}
                >
                  {progress[selectedLesson.id]?.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Leçon complétée
                    </>
                  ) : (
                    'Marquer comme complétée'
                  )}
                </Button>
              </>
            )}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Sélectionnez une leçon pour commencer</p>
          </Card>
        )}
      </div>
    </div>
  )
}

