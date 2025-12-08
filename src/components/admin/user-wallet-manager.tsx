'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Minus, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface UserWalletManagerProps {
  userId: string
  currentWallet: {
    qp_balance: number
    cash_balance: number
  }
}

export function UserWalletManager({ userId, currentWallet }: UserWalletManagerProps) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'credit_qp' | 'debit_qp' | 'credit_cash' | 'debit_cash' | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action || !amount) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/economy/wallet/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          action,
          amount: parseFloat(amount),
          description: description || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(`Action ${action} effectuée avec succès`)
      setOpen(false)
      setAmount('')
      setDescription('')
      setAction(null)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'opération')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="h-4 w-4 mr-2" />
          Gérer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer le wallet</DialogTitle>
          <DialogDescription>
            Créditer ou débiter QP et Cash pour cet utilisateur
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={action === 'credit_qp' ? 'default' : 'outline'}
              onClick={() => setAction('credit_qp')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créditer QP
            </Button>
            <Button
              type="button"
              variant={action === 'debit_qp' ? 'default' : 'outline'}
              onClick={() => setAction('debit_qp')}
            >
              <Minus className="h-4 w-4 mr-2" />
              Débiter QP
            </Button>
            <Button
              type="button"
              variant={action === 'credit_cash' ? 'default' : 'outline'}
              onClick={() => setAction('credit_cash')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créditer Cash
            </Button>
            <Button
              type="button"
              variant={action === 'debit_cash' ? 'default' : 'outline'}
              onClick={() => setAction('debit_cash')}
            >
              <Minus className="h-4 w-4 mr-2" />
              Débiter Cash
            </Button>
          </div>

          {action && (
            <>
              <div>
                <Label>Montant</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={action.includes('cash') ? '0.00' : '0'}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Solde actuel: {action.includes('cash') 
                    ? `${currentWallet.cash_balance.toFixed(2)}€`
                    : `${currentWallet.qp_balance.toLocaleString()} QP`
                  }
                </p>
              </div>
              <div>
                <Label>Description (optionnel)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Raison de l'opération"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Traitement...' : 'Confirmer'}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
