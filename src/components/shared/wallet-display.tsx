'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentUserWallet, type UserWallet } from '@/lib/economy/wallet-client'
import { Coins, Euro } from 'lucide-react'
import Link from 'next/link'

export function WalletDisplay() {
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const loadWallet = useCallback(async () => {
    try {
      const walletData = await getCurrentUserWallet()
      setWallet(walletData)
    } catch (error) {
      console.error('Error loading wallet:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWallet()
  }, [pathname, loadWallet]) // Recharge le wallet à chaque changement de page

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 rounded-lg bg-[#141414] animate-pulse" />
        <div className="w-20 h-8 rounded-lg bg-[#141414] animate-pulse" />
      </div>
    )
  }

  if (!wallet) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* QP Counter */}
      <Link 
        href="/dashboard/wallet"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group"
      >
        <Coins className="h-4 w-4 text-[#c8ff00]" />
        <span className="text-sm font-semibold text-white">
          {wallet.qp_balance.toLocaleString('fr-FR')} QP
        </span>
      </Link>

      {/* Cash Counter */}
      <Link 
        href="/dashboard/wallet"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group"
      >
        <Euro className="h-4 w-4 text-[#c8ff00]" />
        <span className="text-sm font-semibold text-white">
          {wallet.cash_balance.toFixed(2)}€
        </span>
      </Link>
    </div>
  )
}
