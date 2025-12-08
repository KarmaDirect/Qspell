/**
 * Utilitaires client-side pour la gestion des wallets
 * Séparé de wallet.ts pour éviter les imports serveur dans les composants client
 */

import { createClient } from '@/lib/supabase/client'

export interface UserWallet {
  id: string
  user_id: string
  qp_balance: number
  cash_balance: number
  total_qp_purchased: number
  total_cash_earned: number
  total_cash_withdrawn: number
  created_at: string
  updated_at: string
}

/**
 * Récupère le wallet de l'utilisateur actuel (client-side)
 */
export async function getCurrentUserWallet(): Promise<UserWallet | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching wallet:', error)
    return null
  }
  
  return data as UserWallet
}
