-- ============================================
-- Script de correction pour les erreurs de migration
-- ============================================
-- À exécuter si vous avez des erreurs "already exists"
-- ============================================

-- Supprimer les index qui pourraient déjà exister (optionnel, seulement si nécessaire)
-- DROP INDEX IF EXISTS idx_user_wallets_user_id;
-- DROP INDEX IF EXISTS idx_qp_transactions_user_id;
-- etc.

-- Alternative : Créer les index seulement s'ils n'existent pas
DO $$ 
BEGIN
  -- Index user_wallets
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_wallets_user_id') THEN
    CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
  END IF;

  -- Index qp_transactions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qp_transactions_user_id') THEN
    CREATE INDEX idx_qp_transactions_user_id ON qp_transactions(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qp_transactions_type') THEN
    CREATE INDEX idx_qp_transactions_type ON qp_transactions(type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qp_transactions_created_at') THEN
    CREATE INDEX idx_qp_transactions_created_at ON qp_transactions(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qp_transactions_reference') THEN
    CREATE INDEX idx_qp_transactions_reference ON qp_transactions(reference_id, reference_type);
  END IF;

  -- Index cash_transactions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cash_transactions_user_id') THEN
    CREATE INDEX idx_cash_transactions_user_id ON cash_transactions(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cash_transactions_type') THEN
    CREATE INDEX idx_cash_transactions_type ON cash_transactions(type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cash_transactions_status') THEN
    CREATE INDEX idx_cash_transactions_status ON cash_transactions(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cash_transactions_tournament') THEN
    CREATE INDEX idx_cash_transactions_tournament ON cash_transactions(tournament_id);
  END IF;

  -- Index qp_packages
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qp_packages_active') THEN
    CREATE INDEX idx_qp_packages_active ON qp_packages(is_active, display_order);
  END IF;

  -- Index subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_user_id') THEN
    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_status') THEN
    CREATE INDEX idx_subscriptions_status ON subscriptions(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_stripe') THEN
    CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_active_unique') THEN
    CREATE UNIQUE INDEX idx_subscriptions_active_unique 
      ON subscriptions(user_id) 
      WHERE status = 'active';
  END IF;

  -- Index products
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_type') THEN
    CREATE INDEX idx_products_type ON products(type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_active') THEN
    CREATE INDEX idx_products_active ON products(is_active);
  END IF;

  -- Index tournament_entries
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_entries_tournament') THEN
    CREATE INDEX idx_tournament_entries_tournament ON tournament_entries(tournament_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_entries_team') THEN
    CREATE INDEX idx_tournament_entries_team ON tournament_entries(team_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_entries_status') THEN
    CREATE INDEX idx_tournament_entries_status ON tournament_entries(status);
  END IF;

  -- Index tournament_prize_pool
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_prize_pool_tournament') THEN
    CREATE INDEX idx_tournament_prize_pool_tournament ON tournament_prize_pool(tournament_id);
  END IF;

  -- Index withdrawal_requests
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_user_id') THEN
    CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_status') THEN
    CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_withdrawal_requests_created_at') THEN
    CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);
  END IF;

  -- Index formation_purchases
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_formation_purchases_user') THEN
    CREATE INDEX idx_formation_purchases_user ON formation_purchases(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_formation_purchases_formation') THEN
    CREATE INDEX idx_formation_purchases_formation ON formation_purchases(formation_id);
  END IF;
END $$;

-- Vérifier que tous les index sont créés
SELECT 
  'Index créés' as check_type,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND (
  indexname LIKE '%wallet%' OR
  indexname LIKE '%qp_%' OR
  indexname LIKE '%cash_%' OR
  indexname LIKE '%subscription%' OR
  indexname LIKE '%product%' OR
  indexname LIKE '%tournament%' OR
  indexname LIKE '%withdrawal%' OR
  indexname LIKE '%formation%'
);
