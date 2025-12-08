/**
 * Utilitaires pour la gestion des wallets et transactions économiques
 */

import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export type QPTransactionType = 'purchase' | 'spend' | 'refund' | 'gift' | 'subscription_bonus' | 'welcome_bonus'
export type CashTransactionType = 'tournament_win' | 'withdrawal' | 'refund' | 'coaching_payout'
export type ProductType = 'ai_analysis' | 'tournament_entry' | 'formation' | 'coaching_session' | 'cosmetic' | 'booster_xp'

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

export interface QPTransaction {
  id: string
  user_id: string
  type: QPTransactionType
  amount: number
  description: string | null
  reference_id: string | null
  reference_type: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface CashTransaction {
  id: string
  user_id: string
  type: CashTransactionType
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  tournament_id: string | null
  description: string | null
  created_at: string
  processed_at: string | null
}

export interface QPPackage {
  id: string
  name: string
  qp_amount: number
  price_eur: number
  bonus_qp: number
  is_active: boolean
  display_order: number
  stripe_price_id: string | null
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'premium'
  price_monthly: number
  qp_monthly: number
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string | null
  cancel_at_period_end: boolean
}

/**
 * Récupère le wallet d'un utilisateur
 */
export async function getUserWallet(userId: string): Promise<UserWallet | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching wallet:', error)
    return null
  }
  
  return data as UserWallet
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

/**
 * Débite des QP du wallet d'un utilisateur
 */
export async function debitQP(
  userId: string,
  amount: number,
  type: QPTransactionType,
  description?: string,
  referenceId?: string,
  referenceType?: string
): Promise<string | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.rpc('debit_qp', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description || null,
    p_reference_id: referenceId || null,
    p_reference_type: referenceType || null
  })
  
  if (error) {
    console.error('Error debiting QP:', error)
    return null
  }
  
  return data as string
}

/**
 * Crédite des QP au wallet d'un utilisateur
 */
export async function creditQP(
  userId: string,
  amount: number,
  type: QPTransactionType,
  description?: string,
  referenceId?: string,
  referenceType?: string
): Promise<string | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.rpc('credit_qp', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description || null,
    p_reference_id: referenceId || null,
    p_reference_type: referenceType || null
  })
  
  if (error) {
    console.error('Error crediting QP:', error)
    return null
  }
  
  return data as string
}

/**
 * Crédite du Cash au wallet d'un utilisateur
 */
export async function creditCash(
  userId: string,
  amount: number,
  type: CashTransactionType,
  description?: string,
  tournamentId?: string
): Promise<string | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.rpc('credit_cash', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description || null,
    p_tournament_id: tournamentId || null
  })
  
  if (error) {
    console.error('Error crediting cash:', error)
    return null
  }
  
  return data as string
}

/**
 * Vérifie si un utilisateur a un abonnement Premium actif
 */
export async function hasPremiumSubscription(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.rpc('has_premium_subscription', {
    p_user_id: userId
  })
  
  if (error) {
    console.error('Error checking premium subscription:', error)
    return false
  }
  
  return data as boolean
}

/**
 * Récupère l'abonnement actif d'un utilisateur
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString())
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Error fetching subscription:', error)
    return null
  }
  
  return data as Subscription
}

/**
 * Récupère les packs QP disponibles
 */
export async function getQPPackages(): Promise<QPPackage[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('qp_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching QP packages:', error)
    return []
  }
  
  return data as QPPackage[]
}

/**
 * Récupère l'historique des transactions QP
 */
export async function getQPTransactions(
  userId: string,
  limit: number = 50
): Promise<QPTransaction[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('qp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching QP transactions:', error)
    return []
  }
  
  return data as QPTransaction[]
}

/**
 * Récupère l'historique des transactions Cash
 */
export async function getCashTransactions(
  userId: string,
  limit: number = 50
): Promise<CashTransaction[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('cash_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching cash transactions:', error)
    return []
  }
  
  return data as CashTransaction[]
}

/**
 * Calcule le prix total avec bonus pour un pack QP
 */
export function calculateQPPackageTotal(package_: QPPackage): {
  totalQP: number
  pricePerQP: number
  qpPerEuro: number
  savings: number
} {
  const totalQP = package_.qp_amount + package_.bonus_qp
  const pricePerQP = package_.price_eur / totalQP // Prix par QP en euros
  const qpPerEuro = totalQP / package_.price_eur // Nombre de QP par euro
  const savings = package_.bonus_qp > 0 ? (package_.bonus_qp / package_.qp_amount) * 100 : 0
  
  return {
    totalQP,
    pricePerQP,
    qpPerEuro,
    savings
  }
}

/**
 * Constantes économiques
 */
export const ECONOMY_CONSTANTS = {
  QP_BASE_RATE: 100, // 100 QP = 1€
  PLATFORM_FEE_PERCENT: 10, // 10% sur retraits
  COACHING_COMMISSION: 5, // 5€ fixe par session
  MIN_WITHDRAWAL: 10, // Minimum 10€
  MAX_WITHDRAWAL_MONTHLY: 1000, // Maximum 1000€/mois
  TOURNAMENT_ENTRY_TO_PRIZE_RATIO: 0.6, // 60% des entries → prize
  PREMIUM_PRICE: 9.99, // Prix mensuel Premium
  PREMIUM_QP_MONTHLY: 500, // QP inclus/mois
  PREMIUM_COACHING_DISCOUNT: 15, // -15% sur coaching
  AI_ANALYSIS_COST: 20, // QP
  TOURNAMENT_ENTRY_SMALL: 50, // QP
  TOURNAMENT_ENTRY_MEDIUM: 150, // QP
  TOURNAMENT_ENTRY_LARGE: 300, // QP
  FORMATION_AVERAGE_COST: 200, // QP
} as const
