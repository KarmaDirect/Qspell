-- Script pour initialiser le wallet du CEO (hatim.moro.2002@gmail.com)
-- À exécuter après la migration économique

-- Créer le wallet pour le CEO s'il n'existe pas
INSERT INTO user_wallets (user_id, qp_balance, cash_balance)
SELECT 
  id,
  10000, -- 10,000 QP de départ pour les tests
  1000.00 -- 1,000€ de départ pour les tests
FROM auth.users
WHERE email = 'hatim.moro.2002@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  qp_balance = user_wallets.qp_balance + 10000,
  cash_balance = user_wallets.cash_balance + 1000.00,
  updated_at = NOW();

-- Enregistrer les transactions de crédit initial
INSERT INTO qp_transactions (user_id, type, amount, description)
SELECT 
  id,
  'gift',
  10000,
  'Crédit initial CEO - Système de test'
FROM auth.users
WHERE email = 'hatim.moro.2002@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM qp_transactions 
  WHERE user_id = auth.users.id 
  AND description = 'Crédit initial CEO - Système de test'
);

INSERT INTO cash_transactions (user_id, type, amount, status, description)
SELECT 
  id,
  'tournament_win',
  1000.00,
  'completed',
  'Crédit initial CEO - Système de test'
FROM auth.users
WHERE email = 'hatim.moro.2002@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM cash_transactions 
  WHERE user_id = auth.users.id 
  AND description = 'Crédit initial CEO - Système de test'
);

-- Vérifier que le wallet a été créé
SELECT 
  u.email,
  p.username,
  p.display_name,
  w.qp_balance,
  w.cash_balance,
  w.total_qp_purchased,
  w.total_cash_earned
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN user_wallets w ON w.user_id = u.id
WHERE u.email = 'hatim.moro.2002@gmail.com';
