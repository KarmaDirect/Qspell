'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CoachingSessionModal } from './coaching-session-modal'
import { useRouter } from 'next/navigation'

export function CoachingSessionButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle session
      </Button>

      <CoachingSessionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}

