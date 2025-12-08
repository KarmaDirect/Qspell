'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PurchaseButtonProps {
  packageId: string
  packageName: string
}

export function PurchaseButton({ packageId, packageName }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/economy/qp/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        toast.error('URL de paiement non disponible')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'achat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      className="w-full"
      onClick={handlePurchase}
      disabled={loading}
    >
      {loading ? 'Chargement...' : 'Acheter maintenant'}
    </Button>
  )
}
