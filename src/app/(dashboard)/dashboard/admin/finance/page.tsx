import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Coins,
  Euro,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

async function getEconomyStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/api/admin/economy/stats`, {
    cache: 'no-store'
  })
  if (!response.ok) return null
  return response.json()
}

export default async function AdminFinancePage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const statsData = await getEconomyStats()
  const metrics = statsData?.metrics || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Financier</h1>
          <p className="text-[#666]">Métriques économiques et gestion financière</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/finance/withdrawals">
            <Button variant="outline" className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              Gérer les retraits
            </Button>
          </Link>
          <Link href="/dashboard/admin/finance/tournaments">
            <Button variant="outline" className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              Gérer les tournois
            </Button>
          </Link>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
              <Coins className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">QP</Badge>
          </div>
          <div className="text-2xl font-bold mb-1 text-white">
            {metrics.totalQP?.toLocaleString() || 0}
          </div>
          <p className="text-sm text-[#666]">Total QP en circulation</p>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
              <Euro className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">Cash</Badge>
          </div>
          <div className="text-2xl font-bold mb-1 text-white">
            {metrics.totalCash?.toFixed(2) || '0.00'}€
          </div>
          <p className="text-sm text-[#666]">Total Cash en wallets</p>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">Ratio</Badge>
          </div>
          <div className="text-2xl font-bold mb-1 text-white">
            {metrics.qpRatio?.toFixed(1) || 0}%
          </div>
          <p className="text-sm text-[#666]">QP dépensé / acheté</p>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
              <Activity className="h-5 w-5 text-[#c8ff00]" />
            </div>
            <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">Cash</Badge>
          </div>
          <div className="text-2xl font-bold mb-1 text-white">
            {metrics.cashRatio?.toFixed(1) || 0}%
          </div>
          <p className="text-sm text-[#666]">Cash retiré / gagné</p>
        </Card>
      </div>

      {/* Revenus */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-[#c8ff00]" />
          Revenus par source
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666]">Ventes QP</span>
              <ShoppingCart className="h-4 w-4 text-[#c8ff00]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.revenue?.qp?.toFixed(2) || '0.00'}€
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666]">Abonnements</span>
              <Users className="h-4 w-4 text-[#c8ff00]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.revenue?.subscriptions?.toFixed(2) || '0.00'}€
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666]">Total</span>
              <TrendingUp className="h-4 w-4 text-[#c8ff00]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.revenue?.total?.toFixed(2) || '0.00'}€
            </div>
          </div>
        </div>
      </Card>

      {/* QP Acheté vs Dépensé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h3 className="text-lg font-semibold mb-4 text-white">QP Acheté vs Dépensé</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#666]">Total acheté</span>
                <span className="font-bold text-white">{metrics.totalQPPurchased?.toLocaleString() || 0} QP</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-[#c8ff00] h-2 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#666]">Total dépensé</span>
                <span className="font-bold text-white">{metrics.totalQPSpent?.toLocaleString() || 0} QP</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-[#c8ff00]/60 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((metrics.qpRatio || 0), 100)}%` 
                  }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#666]">Ratio utilisation</span>
                <Badge className={metrics.qpRatio > 80 ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20'}>
                  {metrics.qpRatio?.toFixed(1) || 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h3 className="text-lg font-semibold mb-4 text-white">Cash Gagné vs Retiré</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#666]">Total gagné</span>
                <span className="font-bold text-white">{metrics.totalCashEarned?.toFixed(2) || '0.00'}€</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-[#c8ff00] h-2 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#666]">Total retiré</span>
                <span className="font-bold text-white">{metrics.totalCashWithdrawn?.toFixed(2) || '0.00'}€</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-[#c8ff00]/60 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((metrics.cashRatio || 0), 100)}%` 
                  }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#666]">Ratio retrait</span>
                <Badge className={metrics.cashRatio > 50 ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20'}>
                  {metrics.cashRatio?.toFixed(1) || 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Retraits en attente */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <ArrowDownRight className="h-5 w-5 text-[#c8ff00]" />
            Retraits en attente
          </h2>
          <Link href="/dashboard/admin/finance/withdrawals">
            <Button variant="outline" size="sm" className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">En attente</div>
            <div className="text-2xl font-bold text-white">
              {metrics.withdrawals?.pending || 0}
            </div>
            <div className="text-sm text-[#666] mt-1">
              {metrics.withdrawals?.totalPending?.toFixed(2) || '0.00'}€
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">En traitement</div>
            <div className="text-2xl font-bold text-white">
              {metrics.withdrawals?.processing || 0}
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">Frais collectés</div>
            <div className="text-2xl font-bold text-white">
              {metrics.withdrawals?.totalFees?.toFixed(2) || '0.00'}€
            </div>
          </div>
        </div>
      </Card>

      {/* Tournois */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <PieChart className="h-5 w-5 text-[#c8ff00]" />
            Statistiques Tournois
          </h2>
          <Link href="/dashboard/admin/finance/tournaments">
            <Button variant="outline" size="sm" className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#c8ff00]/30">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">Prize Pools totaux</div>
            <div className="text-2xl font-bold text-white">
              {metrics.tournaments?.totalPrizePools?.toFixed(2) || '0.00'}€
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">Déjà payés</div>
            <div className="text-2xl font-bold text-white">
              {metrics.tournaments?.paidOut?.toFixed(2) || '0.00'}€
            </div>
          </div>
          <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#1a1a1a]">
            <div className="text-sm text-[#666] mb-1">En attente</div>
            <div className="text-2xl font-bold text-white">
              {metrics.tournaments?.pending?.toFixed(2) || '0.00'}€
            </div>
            <div className="text-xs text-[#666] mt-1">
              {metrics.tournaments?.activePrizePools || 0} tournois actifs
            </div>
          </div>
        </div>
      </Card>

      {/* Services les plus utilisés */}
      {metrics.services && Object.keys(metrics.services).length > 0 && (
        <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
          <h2 className="text-xl font-bold mb-4 text-white">Services les plus utilisés</h2>
          <div className="space-y-2">
            {Object.entries(metrics.services).map(([service, data]: [string, any]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#1a1a1a]">
                <div>
                  <div className="font-semibold capitalize text-white">{service.replace('_', ' ')}</div>
                  <div className="text-sm text-[#666]">
                    {data.count} utilisations
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{data.spent.toLocaleString()} QP</div>
                  <div className="text-sm text-[#666]">
                    ~{(data.spent / 100).toFixed(2)}€
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
