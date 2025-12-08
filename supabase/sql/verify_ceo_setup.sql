-- Script de vérification pour le setup CEO
-- Vérifie que le wallet, les transactions et les fonctions sont correctement configurés

-- 1. Vérifier le wallet CEO
SELECT 
  'Wallet CEO' as check_type,
  u.email,
  p.username,
  w.qp_balance,
  w.cash_balance,
  w.total_qp_purchased,
  w.total_cash_earned,
  CASE 
    WHEN w.qp_balance >= 10000 AND w.cash_balance >= 1000 THEN '✅ OK'
    ELSE '❌ Manquant'
  END as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN user_wallets w ON w.user_id = u.id
WHERE u.email = 'hatim.moro.2002@gmail.com';

-- 2. Vérifier les transactions QP
SELECT 
  'Transactions QP' as check_type,
  COUNT(*) as total_transactions,
  SUM(amount) as total_qp_credited,
  CASE 
    WHEN COUNT(*) > 0 AND SUM(amount) >= 10000 THEN '✅ OK'
    ELSE '❌ Manquant'
  END as status
FROM qp_transactions qt
JOIN auth.users u ON u.id = qt.user_id
WHERE u.email = 'hatim.moro.2002@gmail.com'
AND description = 'Crédit initial CEO - Système de test';

-- 3. Vérifier les transactions Cash
SELECT 
  'Transactions Cash' as check_type,
  COUNT(*) as total_transactions,
  SUM(amount) as total_cash_credited,
  CASE 
    WHEN COUNT(*) > 0 AND SUM(amount) >= 1000 THEN '✅ OK'
    ELSE '❌ Manquant'
  END as status
FROM cash_transactions ct
JOIN auth.users u ON u.id = ct.user_id
WHERE u.email = 'hatim.moro.2002@gmail.com'
AND description = 'Crédit initial CEO - Système de test';

-- 4. Vérifier la fonction de bonus
SELECT 
  'Fonction Bonus' as check_type,
  calculate_qp_bonus_from_amount(500, 4.99) as bonus_basic,
  calculate_qp_bonus_from_amount(1200, 9.99) as bonus_pro,
  calculate_qp_bonus_from_amount(2500, 19.99) as bonus_elite,
  calculate_qp_bonus_from_amount(6000, 49.99) as bonus_legend,
  CASE 
    WHEN calculate_qp_bonus_from_amount(500, 4.99) = 50 
     AND calculate_qp_bonus_from_amount(1200, 9.99) = 200
     AND calculate_qp_bonus_from_amount(2500, 19.99) = 500
     AND calculate_qp_bonus_from_amount(6000, 49.99) = 1500 THEN '✅ OK'
    ELSE '❌ Erreur'
  END as status;

-- 5. Vérifier les packages QP disponibles
SELECT 
  'Packages QP' as check_type,
  COUNT(*) as total_packages,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ OK'
    ELSE '❌ Manquant'
  END as status
FROM qp_packages
WHERE is_active = true;

-- 6. Vérifier le rôle CEO
SELECT 
  'Rôle CEO' as check_type,
  u.email,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'ceo') THEN '✅ OK'
    ELSE '❌ Pas admin/CEO'
  END as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'hatim.moro.2002@gmail.com';
