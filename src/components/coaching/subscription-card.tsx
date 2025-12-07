'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SubscriptionCard() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      // Get default plan
      const planResponse = await fetch('/api/subscription/plans')
      const plansData = await planResponse.json()
      const defaultPlan = plansData.plans?.[0]

      if (!defaultPlan) {
        toast.error('Aucun plan disponible')
        return
      }

      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: defaultPlan.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Abonnement activé avec succès !')
        window.location.reload()
      } else {
        toast.error('Erreur', { description: data.error })
      }
    } catch (error) {
      toast.error('Erreur lors de l&apos;abonnement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-2 border-primary/50">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5" />
      
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">QSPELL Premium</h2>
            </div>
            <p className="text-muted-foreground">
              Débloquez toutes les formations et accédez au coaching
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold">10,99€</div>
            <div className="text-sm text-muted-foreground">/mois</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Accès à toutes les formations (TOP, JUNGLE, MID, BOT, SUPPORT, GÉNÉRAL)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Coaching groupe par lane</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Statistiques avancées</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Ressources exclusives</span>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              S&apos;abonner maintenant
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Annulation possible à tout moment • Paiement sécurisé
        </p>
      </div>
    </Card>
  )
}

