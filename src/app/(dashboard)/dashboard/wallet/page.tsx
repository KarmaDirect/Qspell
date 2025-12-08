import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserWallet, getQPPackages, calculateQPPackageTotal, getActiveSubscription, ECONOMY_CONSTANTS } from '@/lib/economy/wallet'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PurchaseButton } from '@/components/wallet/purchase-button'
import { SubscribeButton } from '@/components/wallet/subscribe-button'
import { 
  Wallet, 
  Coins, 
  Euro, 
  ShoppingCart, 
  Gift,
  TrendingUp,
  Sparkles,
  Crown,
  Check,
  Zap,
  Star,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'

export default async function WalletPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const wallet = await getUserWallet(user.id)
  const allPackages = await getQPPackages()
  const activeSubscription = await getActiveSubscription(user.id)
  
  // Filtrer les doublons par nom (garder le premier)
  const uniquePackages = Array.from(
    new Map(allPackages.map(pkg => [pkg.name, pkg])).values()
  )

  if (!wallet) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-white">Chargement du wallet...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Mon Portefeuille</h1>
        <p className="text-[#666]">Gérez vos QP et votre Cash</p>
      </div>

      {/* Solde actuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#c8ff00]" />
              <h3 className="font-semibold text-white">QP (Points Virtuels)</h3>
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
              Virtuel
            </Badge>
          </div>
          <div className="text-4xl font-bold mb-2 text-white">{wallet.qp_balance.toLocaleString()}</div>
          <p className="text-sm text-[#666]">
            Total acheté: {wallet.total_qp_purchased.toLocaleString()} QP
          </p>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-[#c8ff00]" />
              <h3 className="font-semibold text-white">Cash (Argent Réel)</h3>
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
              Récupérable
            </Badge>
          </div>
          <div className="text-4xl font-bold mb-2 text-white">{wallet.cash_balance.toFixed(2)}€</div>
          <p className="text-sm text-[#666]">
            Total gagné: {wallet.total_cash_earned.toFixed(2)}€
          </p>
        </Card>
      </div>

      {/* Abonnement Premium - EN PREMIER */}
      <Card className="p-8 bg-gradient-to-br from-[#c8ff00]/10 via-[#141414] to-[#141414] border-2 border-[#c8ff00]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-[#c8ff00]/20 rounded-xl">
                  <Crown className="h-8 w-8 text-[#c8ff00]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    QSPELL Premium
                    {activeSubscription && (
                      <Badge className="bg-[#c8ff00] text-black">Actif</Badge>
                    )}
                  </h2>
                  <p className="text-[#666] mt-1">
                    L'abonnement qui vous fait gagner plus
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{ECONOMY_CONSTANTS.PREMIUM_PRICE}€</div>
              <div className="text-sm text-[#666]">par mois</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>500 QP</strong> crédités chaque mois</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>Accès aux formations de base</strong> (certaines formations premium restent payantes)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>-15%</strong> sur tous les coachings</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>1 entrée tournoi gratuite</strong> par semaine</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>Badge Premium</strong> visible sur votre profil</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-5 w-5 text-[#c8ff00]" />
                <span><strong>Support prioritaire</strong> et accès anticipé aux nouveautés</span>
              </div>
            </div>
          </div>

          {activeSubscription ? (
            <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Abonnement actif</p>
                  <p className="text-sm text-[#666]">
                    Renouvellement le {new Date(activeSubscription.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Link href="/dashboard/subscription">
                  <Button variant="outline" className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
                    Gérer
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <SubscribeButton />
          )}
        </div>
      </Card>

      {/* Boutique QP */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <ShoppingCart className="h-6 w-6 text-[#c8ff00]" />
              Boutique QP
            </h2>
            <p className="text-[#666] mt-1">
              Achetez des QP pour participer aux tournois et accéder aux formations premium
            </p>
          </div>
        </div>

        {/* Info sur l'utilisation des QP */}
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#1a1a1a]">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-[#c8ff00] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-white font-medium mb-1">À quoi servent les QP ?</p>
              <ul className="text-sm text-[#666] space-y-1 list-disc list-inside">
                <li>Participer aux tournois (50-300 QP selon le tournoi)</li>
                <li>Acheter des formations premium et des analyses IA</li>
                <li>Accéder à des services exclusifs de la plateforme</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniquePackages.map((pkg) => {
            const { totalQP, qpPerEuro, savings } = calculateQPPackageTotal(pkg)
            const isBestValue = pkg.name === 'Pro' || pkg.name === 'Legend'

            return (
              <Card 
                key={pkg.id} 
                className={`p-6 relative bg-[#141414] border-[#1a1a1a] ${isBestValue ? 'border-2 border-[#c8ff00] bg-[#c8ff00]/5' : ''}`}
              >
                {isBestValue && (
                  <Badge className="absolute top-2 right-2 bg-[#c8ff00] text-black">
                    ⭐ Meilleure valeur
                  </Badge>
                )}
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1 text-white">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{totalQP}</span>
                    <span className="text-[#666]">QP</span>
                  </div>
                  {pkg.bonus_qp > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-[#c8ff00]">
                      <Gift className="h-4 w-4" />
                      <span>+{pkg.bonus_qp} QP bonus</span>
                    </div>
                  )}
                </div>

                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
                    <span className="text-[#666]">Prix</span>
                    <span className="text-2xl font-bold text-white">{pkg.price_eur.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666] font-medium">QP par euro</span>
                    <span className="text-lg font-bold text-[#c8ff00]">{qpPerEuro.toFixed(0)} QP/€</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[#1a1a1a]">
                      <span className="text-[#666]">Économie</span>
                      <span className="text-[#c8ff00] font-semibold">+{savings.toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                <PurchaseButton packageId={pkg.id} packageName={pkg.name} />
              </Card>
            )
          })}
        </div>
      </Card>

      {/* Boutique Cash - Cartes cadeaux */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <ShoppingBag className="h-6 w-6 text-[#c8ff00]" />
              Boutique Cash
            </h2>
            <p className="text-[#666] mt-1">
              Échangez votre Cash contre des cartes cadeaux
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Amazon', icon: '🛒', minAmount: 10 },
            { name: 'Google Play', icon: '📱', minAmount: 10 },
            { name: 'Steam', icon: '🎮', minAmount: 10 },
            { name: 'PlayStation', icon: '🎮', minAmount: 20 },
          ].map((store) => (
            <Card key={store.name} className="p-6 bg-[#1a1a1a] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-3">{store.icon}</div>
                <h3 className="font-bold text-white mb-2">{store.name}</h3>
                <p className="text-sm text-[#666] mb-4">À partir de {store.minAmount}€</p>
                <Button 
                  variant="outline" 
                  className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30"
                  disabled={!wallet || wallet.cash_balance < store.minAmount}
                >
                  Échanger
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-[#141414] border-[#1a1a1a]">
          <Link href="/dashboard/wallet/transactions">
            <Button variant="outline" className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Historique des transactions
            </Button>
          </Link>
        </Card>
        <Card className="p-4 bg-[#141414] border-[#1a1a1a]">
          <Link href="/dashboard/wallet/withdraw">
            <Button variant="outline" className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              <Euro className="h-4 w-4 mr-2" />
              Retirer du Cash
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
