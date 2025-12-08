'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SubscribeButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/economy/subscription/premium', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erreur', {
          description: data.error || 'Impossible de créer l\'abonnement'
        })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Une erreur est survenue'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-bold text-lg py-6"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Chargement...
        </>
      ) : (
        'S\'abonner maintenant'
      )}
    </Button>
  )
}
