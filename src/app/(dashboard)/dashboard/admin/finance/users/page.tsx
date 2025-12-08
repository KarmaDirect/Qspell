import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Wallet, Coins, Euro, Search, Plus, Minus } from 'lucide-react'
import { UserWalletManager } from '@/components/admin/user-wallet-manager'

async function getUsers(search?: string) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      email,
      user_wallets (
        qp_balance,
        cash_balance,
        total_qp_purchased,
        total_cash_earned
      )
    `)
    .limit(50)

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`)
  }

  const { data } = await query
  return data || []
}

export default async function UsersFinancePage({
  searchParams
}: {
  searchParams: { search?: string }
}) {
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

  const users = await getUsers(searchParams.search)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Wallets Utilisateurs</h1>
        <p className="text-muted-foreground">Créditer, débiter QP et Cash pour les utilisateurs</p>
      </div>

      {/* Recherche */}
      <Card className="p-4">
        <form method="get" className="flex gap-2">
          <div className="flex-1">
            <Input
              name="search"
              placeholder="Rechercher par username, email..."
              defaultValue={searchParams.search}
            />
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </form>
      </Card>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {users.map((u: any) => {
          const wallet = u.user_wallets?.[0] || {
            qp_balance: 0,
            cash_balance: 0,
            total_qp_purchased: 0,
            total_cash_earned: 0
          }

          return (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{u.username || u.display_name || u.email}</h3>
                    {u.email === 'hatim.moro.2002@gmail.com' && (
                      <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
                        CEO
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        QP
                      </div>
                      <div className="font-semibold">{wallet.qp_balance?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        Cash
                      </div>
                      <div className="font-semibold">{wallet.cash_balance?.toFixed(2) || '0.00'}€</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total QP acheté</div>
                      <div className="font-semibold text-sm">{wallet.total_qp_purchased?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Cash gagné</div>
                      <div className="font-semibold text-sm">{wallet.total_cash_earned?.toFixed(2) || '0.00'}€</div>
                    </div>
                  </div>
                </div>
                <UserWalletManager userId={u.id} currentWallet={wallet} />
              </div>
            </Card>
          )
        })}
      </div>

      {users.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </Card>
      )}
    </div>
  )
}
