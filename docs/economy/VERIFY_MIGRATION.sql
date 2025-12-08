-- ============================================
-- Script de vérification de la migration économique
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor après avoir appliqué la migration
-- pour vérifier que tout est correctement installé
-- ============================================

-- 1. Vérifier que les tables existent
SELECT 
  'Tables créées' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_wallets',
  'qp_transactions',
  'cash_transactions',
  'qp_packages',
  'subscriptions',
  'subscription_benefits',
  'products',
  'tournament_entries',
  'tournament_prize_pool',
  'withdrawal_requests',
  'formation_purchases'
);

-- 2. Vérifier que les types ENUM existent
SELECT 
  'Types ENUM créés' as check_type,
  COUNT(*) as count
FROM pg_type 
WHERE typname IN (
  'qp_transaction_type',
  'cash_transaction_type',
  'cash_transaction_status',
  'subscription_status',
  'subscription_plan',
  'product_type',
  'tournament_entry_status',
  'withdrawal_method',
  'withdrawal_status'
);

-- 3. Vérifier que les fonctions existent
SELECT 
  'Fonctions créées' as check_type,
  COUNT(*) as count
FROM pg_proc 
WHERE proname IN (
  'initialize_user_wallet',
  'debit_qp',
  'credit_qp',
  'credit_cash',
  'debit_cash',
  'has_premium_subscription',
  'calculate_qp_bonus'
);

-- 4. Vérifier les données initiales - Packs QP
SELECT 
  'Packs QP' as check_type,
  COUNT(*) as count,
  string_agg(name, ', ') as names
FROM qp_packages;

-- 5. Vérifier les données initiales - Produits
SELECT 
  'Produits' as check_type,
  COUNT(*) as count,
  string_agg(name, ', ') as names
FROM products;

-- 6. Vérifier les données initiales - Avantages Premium
SELECT 
  'Avantages Premium' as check_type,
  COUNT(*) as count,
  string_agg(benefit_key, ', ') as benefits
FROM subscription_benefits;

-- 7. Vérifier les triggers
SELECT 
  'Triggers créés' as check_type,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgname = 'on_profile_created_wallet';

-- 8. Vérifier les politiques RLS
SELECT 
  'Politiques RLS' as check_type,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'user_wallets',
  'qp_transactions',
  'cash_transactions',
  'qp_packages',
  'subscriptions',
  'products'
);

-- 9. Test de la fonction has_premium_subscription (devrait retourner false pour un user inexistant)
SELECT 
  'Test fonction has_premium_subscription' as check_type,
  has_premium_subscription('00000000-0000-0000-0000-000000000000'::uuid) as result;

-- 10. Test de la fonction calculate_qp_bonus (basée sur le prix)
SELECT 
  'Test fonction calculate_qp_bonus (prix)' as check_type,
  calculate_qp_bonus(1.99) as bonus_1_99,
  calculate_qp_bonus(4.99) as bonus_4_99,
  calculate_qp_bonus(9.99) as bonus_9_99,
  calculate_qp_bonus(49.99) as bonus_49_99;

-- 11. Test de la fonction calculate_qp_bonus_from_amount (basée sur le montant QP)
SELECT 
  'Test fonction calculate_qp_bonus_from_amount (QP)' as check_type,
  calculate_qp_bonus_from_amount(100, 1.99) as bonus_starter,
  calculate_qp_bonus_from_amount(500, 4.99) as bonus_basic,
  calculate_qp_bonus_from_amount(1200, 9.99) as bonus_pro,
  calculate_qp_bonus_from_amount(6000, 49.99) as bonus_legend;

-- 12. Comparaison avec les bonus réels des packs
SELECT 
  'Comparaison bonus réels vs calculés' as check_type,
  name,
  qp_amount,
  price_eur,
  bonus_qp as bonus_reel,
  calculate_qp_bonus_from_amount(qp_amount, price_eur) as bonus_calcule,
  bonus_qp - calculate_qp_bonus_from_amount(qp_amount, price_eur) as difference,
  CASE 
    WHEN bonus_qp = calculate_qp_bonus_from_amount(qp_amount, price_eur) THEN '✅ Parfait'
    WHEN ABS(bonus_qp - calculate_qp_bonus_from_amount(qp_amount, price_eur)) <= 5 THEN '⚠️ Proche'
    ELSE '❌ Différence'
  END as status
FROM qp_packages
ORDER BY display_order;

-- ============================================
-- Résumé final
-- ============================================
-- Si tous les comptes sont > 0 (sauf le test de fonction qui peut être false),
-- alors la migration est correctement appliquée ! ✅
