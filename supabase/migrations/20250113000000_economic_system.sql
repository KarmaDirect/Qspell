-- ============================================
-- SYSTÈME ÉCONOMIQUE QSPELL - DOUBLE MONNAIE
-- ============================================
-- Migration: 20250113000000_economic_system.sql
-- Description: Système complet de gestion économique avec QP (Points Virtuels) et Cash (Argent Réel)
-- ============================================

-- ============================================
-- 1. USER WALLETS - Portefeuilles utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  qp_balance INTEGER DEFAULT 0 NOT NULL CHECK (qp_balance >= 0),
  cash_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (cash_balance >= 0),
  total_qp_purchased INTEGER DEFAULT 0 NOT NULL CHECK (total_qp_purchased >= 0),
  total_cash_earned DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_cash_earned >= 0),
  total_cash_withdrawn DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_cash_withdrawn >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- ============================================
-- 2. QP TRANSACTIONS - Transactions Points Virtuels
-- ============================================
DO $$ BEGIN
  CREATE TYPE qp_transaction_type AS ENUM ('purchase', 'spend', 'refund', 'gift', 'subscription_bonus', 'welcome_bonus');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS qp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type qp_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- ID de l'item acheté (tournoi, formation, etc.)
  reference_type TEXT, -- 'tournament', 'formation', 'ai_analysis', 'cosmetic', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_qp_transactions_user_id ON qp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_qp_transactions_type ON qp_transactions(type);
CREATE INDEX IF NOT EXISTS idx_qp_transactions_created_at ON qp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qp_transactions_reference ON qp_transactions(reference_id, reference_type);

-- ============================================
-- 3. CASH TRANSACTIONS - Transactions Argent Réel
-- ============================================
DO $$ BEGIN
  CREATE TYPE cash_transaction_type AS ENUM ('tournament_win', 'withdrawal', 'refund', 'coaching_payout');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE cash_transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type cash_transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status cash_transaction_status DEFAULT 'pending' NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  withdrawal_request_id UUID, -- Référence vers withdrawal_requests si applicable
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_cash_transactions_user_id ON cash_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_type ON cash_transactions(type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_status ON cash_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_tournament ON cash_transactions(tournament_id);

-- ============================================
-- 4. QP PACKAGES - Packs de Points Virtuels
-- ============================================
CREATE TABLE IF NOT EXISTS qp_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  qp_amount INTEGER NOT NULL CHECK (qp_amount > 0),
  price_eur DECIMAL(10, 2) NOT NULL CHECK (price_eur > 0),
  bonus_qp INTEGER DEFAULT 0 NOT NULL CHECK (bonus_qp >= 0),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  stripe_price_id TEXT, -- ID Stripe pour le prix
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_qp_packages_active ON qp_packages(is_active, display_order);

-- ============================================
-- 5. SUBSCRIPTIONS - Abonnements Premium
-- ============================================
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan DEFAULT 'premium' NOT NULL,
  price_monthly DECIMAL(10, 2) DEFAULT 9.99 NOT NULL,
  qp_monthly INTEGER DEFAULT 500 NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Contrainte: un seul abonnement actif par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_unique 
  ON subscriptions(user_id) 
  WHERE status = 'active';

-- ============================================
-- 6. SUBSCRIPTION BENEFITS - Avantages Premium
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan DEFAULT 'premium' NOT NULL,
  benefit_key TEXT NOT NULL, -- 'unlimited_formations', 'qp_monthly', 'coaching_discount', etc.
  benefit_value JSONB NOT NULL, -- Valeur du bénéfice (nombre, pourcentage, booléen, etc.)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan, benefit_key)
);

-- ============================================
-- 7. PRODUCTS - Produits/Services disponibles
-- ============================================
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('ai_analysis', 'tournament_entry', 'formation', 'coaching_session', 'cosmetic', 'booster_xp');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type product_type NOT NULL,
  price_qp INTEGER, -- Prix en QP (NULL si gratuit ou payant en €)
  price_eur DECIMAL(10, 2), -- Prix direct en € (si applicable)
  description TEXT,
  is_available_free BOOLEAN DEFAULT true,
  is_available_premium BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb, -- Config spécifique (tournament_id, formation_id, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ============================================
-- 8. TOURNAMENT ENTRIES - Inscriptions tournois (avec paiement QP)
-- ============================================
DO $$ BEGIN
  CREATE TYPE tournament_entry_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ajouter les colonnes à la table existante si elles n'existent pas
DO $$ 
BEGIN
  -- Vérifier si les colonnes existent déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'entry_fee_qp'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN entry_fee_qp INTEGER,
    ADD COLUMN entry_fee_paid BOOLEAN DEFAULT false,
    ADD COLUMN paid_at TIMESTAMPTZ,
    ADD COLUMN qp_transaction_id UUID REFERENCES qp_transactions(id);
  END IF;
END $$;

-- Créer une nouvelle table pour les entrées avec plus de détails
CREATE TABLE IF NOT EXISTS tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  entry_fee_qp INTEGER NOT NULL CHECK (entry_fee_qp > 0),
  status tournament_entry_status DEFAULT 'pending' NOT NULL,
  qp_transaction_id UUID REFERENCES qp_transactions(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament ON tournament_entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_team ON tournament_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_status ON tournament_entries(status);

-- ============================================
-- 9. TOURNAMENT PRIZE POOL - Prize pools des tournois
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_prize_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_pool DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_pool >= 0),
  distribution JSONB DEFAULT '{"1st": 0.40, "2nd": 0.25, "3rd": 0.15, "4th": 0.05, "5th": 0.05, "6th": 0.03, "7th": 0.03, "8th": 0.04}'::jsonb,
  paid_out BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tournament_prize_pool_tournament ON tournament_prize_pool(tournament_id);

-- ============================================
-- 10. WITHDRAWAL REQUESTS - Demandes de retrait
-- ============================================
DO $$ BEGIN
  CREATE TYPE withdrawal_method AS ENUM ('paypal', 'bank', 'gift_card');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 10), -- Minimum 10€
  platform_fee DECIMAL(10, 2) NOT NULL CHECK (platform_fee >= 0),
  net_amount DECIMAL(10, 2) NOT NULL CHECK (net_amount >= 0),
  method withdrawal_method NOT NULL,
  details JSONB NOT NULL, -- Email PayPal, IBAN, etc.
  status withdrawal_status DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  kyc_required BOOLEAN DEFAULT false,
  kyc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id) -- Admin qui a traité
);

-- Index
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- ============================================
-- 11. FORMATION PURCHASES - Achats de formations
-- ============================================
-- Ajouter colonnes à la table formations existante si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' 
    AND column_name = 'price_qp'
  ) THEN
    ALTER TABLE formations 
    ADD COLUMN price_qp INTEGER DEFAULT 200,
    ADD COLUMN is_premium_only BOOLEAN DEFAULT false,
    ADD COLUMN duration_minutes INTEGER,
    ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0;
  END IF;
END $$;

-- Table pour suivre les achats de formations
CREATE TABLE IF NOT EXISTS formation_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price_qp INTEGER,
  qp_transaction_id UUID REFERENCES qp_transactions(id),
  is_premium_access BOOLEAN DEFAULT false, -- Accès via Premium
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(formation_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formation_purchases_user ON formation_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_formation_purchases_formation ON formation_purchases(formation_id);

-- ============================================
-- 12. COACHING SESSIONS - Mise à jour pour paiement
-- ============================================
-- Ajouter colonnes à coaching_sessions si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coaching_sessions' 
    AND column_name = 'discount_percent'
  ) THEN
    ALTER TABLE coaching_sessions 
    ADD COLUMN discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    ADD COLUMN stripe_payment_intent_id TEXT,
    ADD COLUMN coach_payout DECIMAL(10, 2),
    ADD COLUMN platform_fee DECIMAL(10, 2);
  END IF;
END $$;

-- ============================================
-- 13. FUNCTIONS - Fonctions utilitaires
-- ============================================

-- Fonction pour initialiser un wallet à la création d'un profil
CREATE OR REPLACE FUNCTION initialize_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, qp_balance)
  VALUES (NEW.id, 50) -- Bonus de bienvenue: 50 QP
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Enregistrer la transaction de bienvenue
  INSERT INTO qp_transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'welcome_bonus', 50, 'Bonus de bienvenue QSPELL');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le wallet automatiquement
DROP TRIGGER IF EXISTS on_profile_created_wallet ON profiles;
CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_wallet();

-- Fonction pour débiter QP
CREATE OR REPLACE FUNCTION debit_qp(
  p_user_id UUID,
  p_amount INTEGER,
  p_type qp_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance INTEGER;
BEGIN
  -- Vérifier le solde
  SELECT qp_balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient QP balance. Current: %, Required: %', v_current_balance, p_amount;
  END IF;
  
  -- Débiter
  UPDATE user_wallets
  SET qp_balance = qp_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Créer la transaction
  INSERT INTO qp_transactions (
    user_id, type, amount, description, reference_id, reference_type
  )
  VALUES (
    p_user_id, p_type, -p_amount, p_description, p_reference_id, p_reference_type
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créditer QP
CREATE OR REPLACE FUNCTION credit_qp(
  p_user_id UUID,
  p_amount INTEGER,
  p_type qp_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Créditer
  UPDATE user_wallets
  SET qp_balance = qp_balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Si le wallet n'existe pas, le créer
  IF NOT FOUND THEN
    INSERT INTO user_wallets (user_id, qp_balance)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET qp_balance = user_wallets.qp_balance + p_amount,
        updated_at = NOW();
  END IF;
  
  -- Mettre à jour total_qp_purchased si c'est un achat
  IF p_type = 'purchase' THEN
    UPDATE user_wallets
    SET total_qp_purchased = total_qp_purchased + p_amount
    WHERE user_id = p_user_id;
  END IF;
  
  -- Créer la transaction
  INSERT INTO qp_transactions (
    user_id, type, amount, description, reference_id, reference_type
  )
  VALUES (
    p_user_id, p_type, p_amount, p_description, p_reference_id, p_reference_type
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créditer Cash
CREATE OR REPLACE FUNCTION credit_cash(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type cash_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_tournament_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Créditer
  UPDATE user_wallets
  SET cash_balance = cash_balance + p_amount,
      total_cash_earned = total_cash_earned + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Si le wallet n'existe pas, le créer
  IF NOT FOUND THEN
    INSERT INTO user_wallets (user_id, cash_balance, total_cash_earned)
    VALUES (p_user_id, p_amount, p_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET cash_balance = user_wallets.cash_balance + p_amount,
        total_cash_earned = user_wallets.total_cash_earned + p_amount,
        updated_at = NOW();
  END IF;
  
  -- Créer la transaction
  INSERT INTO cash_transactions (
    user_id, type, amount, status, tournament_id, description
  )
  VALUES (
    p_user_id, p_type, p_amount, 'completed', p_tournament_id, p_description
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour débiter Cash (retrait)
CREATE OR REPLACE FUNCTION debit_cash(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  -- Vérifier le solde
  SELECT cash_balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient cash balance. Current: %, Required: %', v_current_balance, p_amount;
  END IF;
  
  -- Débiter
  UPDATE user_wallets
  SET cash_balance = cash_balance - p_amount,
      total_cash_withdrawn = total_cash_withdrawn + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a Premium
CREATE OR REPLACE FUNCTION has_premium_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le bonus QP selon le prix
-- Cette fonction calcule le bonus approximatif basé sur le prix
-- Utilisée pour les nouveaux packs créés dynamiquement
CREATE OR REPLACE FUNCTION calculate_qp_bonus(p_price_eur DECIMAL)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_price_eur < 5 THEN 0
    WHEN p_price_eur < 10 THEN FLOOR((p_price_eur * 100) * 0.10) -- +10% approximatif
    WHEN p_price_eur < 20 THEN FLOOR((p_price_eur * 100) * 0.20) -- +20% approximatif
    WHEN p_price_eur < 50 THEN FLOOR((p_price_eur * 100) * 0.25) -- +25% approximatif
    ELSE FLOOR((p_price_eur * 100) * 0.25) -- +25% max
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction optimisée pour calculer le bonus basé sur le montant de QP de base
-- Cette fonction correspond exactement aux bonus réels des packs optimisés
CREATE OR REPLACE FUNCTION calculate_qp_bonus_from_amount(p_qp_amount INTEGER, p_price_eur DECIMAL)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    -- Packs spécifiques avec bonus optimisés
    WHEN p_qp_amount = 500 AND p_price_eur = 4.99 THEN 50  -- Basic: 10% de 500
    WHEN p_qp_amount = 1200 AND p_price_eur = 9.99 THEN 200  -- Pro: 16.67% de 1200
    WHEN p_qp_amount = 2500 AND p_price_eur = 19.99 THEN 500  -- Elite: 20% de 2500
    WHEN p_qp_amount = 6000 AND p_price_eur = 49.99 THEN 1500  -- Legend: 25% de 6000
    -- Règles générales pour nouveaux packs
    WHEN p_price_eur < 5 THEN 0
    WHEN p_price_eur < 10 THEN FLOOR(p_qp_amount * 0.10) -- +10% du montant de base
    WHEN p_price_eur < 20 THEN FLOOR(p_qp_amount * 0.20) -- +20% du montant de base
    WHEN p_price_eur < 50 THEN FLOOR(p_qp_amount * 0.25) -- +25% du montant de base
    ELSE FLOOR(p_qp_amount * 0.25) -- +25% max
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour obtenir le meilleur pack selon le budget
-- Retourne le pack avec le meilleur ratio QP/€
CREATE OR REPLACE FUNCTION get_best_value_package(p_budget DECIMAL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  qp_amount INTEGER,
  price_eur DECIMAL,
  bonus_qp INTEGER,
  total_qp INTEGER,
  qp_per_eur DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.qp_amount,
    p.price_eur,
    p.bonus_qp,
    (p.qp_amount + p.bonus_qp) as total_qp,
    ((p.qp_amount + p.bonus_qp)::DECIMAL / p.price_eur) as qp_per_eur
  FROM qp_packages p
  WHERE p.is_active = true
    AND p.price_eur <= p_budget
  ORDER BY qp_per_eur DESC, total_qp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. ROW LEVEL SECURITY (RLS)
-- ============================================

-- User Wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wallet" ON user_wallets;
CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

-- QP Transactions
ALTER TABLE qp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own QP transactions" ON qp_transactions;
CREATE POLICY "Users can view own QP transactions"
  ON qp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Cash Transactions
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own cash transactions" ON cash_transactions;
CREATE POLICY "Users can view own cash transactions"
  ON cash_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- QP Packages (public)
ALTER TABLE qp_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "QP packages are viewable by everyone" ON qp_packages;
CREATE POLICY "QP packages are viewable by everyone"
  ON qp_packages FOR SELECT
  USING (is_active = true);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Products (public)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Tournament Entries
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view tournament entries" ON tournament_entries;
CREATE POLICY "Users can view tournament entries"
  ON tournament_entries FOR SELECT
  USING (true); -- Public pour voir qui participe

-- Withdrawal Requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Formation Purchases
ALTER TABLE formation_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own formation purchases" ON formation_purchases;
CREATE POLICY "Users can view own formation purchases"
  ON formation_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 15. DONNÉES INITIALES
-- ============================================

-- Packs QP par défaut (bonus optimisés pour meilleure valeur)
INSERT INTO qp_packages (name, qp_amount, price_eur, bonus_qp, display_order) VALUES
  ('Starter', 100, 1.99, 0, 1),           -- 50 QP/€
  ('Basic', 500, 4.99, 50, 2),            -- 110 QP/€ (+10%)
  ('Pro', 1200, 9.99, 200, 3),            -- 140 QP/€ (+16.67%)
  ('Elite', 2500, 19.99, 500, 4),         -- 150 QP/€ (+20%)
  ('Legend', 6000, 49.99, 1500, 5)        -- 150 QP/€ (+25%)
ON CONFLICT DO NOTHING;

-- Produits par défaut
INSERT INTO products (name, type, price_qp, description, is_available_free, is_available_premium) VALUES
  ('Analyse IA', 'ai_analysis', 20, 'Analyse détaillée de votre match par IA', true, true),
  ('Entrée Tournoi Small', 'tournament_entry', 50, 'Entrée pour tournoi Daily Clash', true, true),
  ('Entrée Tournoi Medium', 'tournament_entry', 150, 'Entrée pour tournoi Weekly Cup', true, true),
  ('Entrée Tournoi Large', 'tournament_entry', 300, 'Entrée pour tournoi Monthly League', true, true),
  ('Formation', 'formation', 200, 'Accès à une formation complète', true, true),
  ('Boost XP 1 semaine', 'booster_xp', 150, 'Double XP pendant 1 semaine', true, true)
ON CONFLICT DO NOTHING;

-- Avantages Premium
INSERT INTO subscription_benefits (plan, benefit_key, benefit_value, description) VALUES
  ('premium', 'unlimited_formations', 'true'::jsonb, 'Accès illimité aux formations'),
  ('premium', 'qp_monthly', '500'::jsonb, '500 QP par mois'),
  ('premium', 'coaching_discount', '20'::jsonb, 'Réduction de 20% sur le coaching'),
  ('premium', 'tournament_free_weekly', '1'::jsonb, '1 entrée tournoi gratuite par semaine'),
  ('premium', 'badge_premium', 'true'::jsonb, 'Badge Premium visible'),
  ('premium', 'priority_support', 'true'::jsonb, 'Support prioritaire'),
  ('premium', 'early_features', 'true'::jsonb, 'Accès aux nouvelles fonctionnalités en avant-première')
ON CONFLICT (plan, benefit_key) DO NOTHING;

-- ============================================
-- 16. COMMENTS
-- ============================================
COMMENT ON TABLE user_wallets IS 'Portefeuilles utilisateurs avec QP et Cash';
COMMENT ON TABLE qp_transactions IS 'Historique des transactions QP';
COMMENT ON TABLE cash_transactions IS 'Historique des transactions Cash';
COMMENT ON TABLE qp_packages IS 'Packs de QP disponibles à l''achat';
COMMENT ON TABLE subscriptions IS 'Abonnements Premium des utilisateurs';
COMMENT ON TABLE products IS 'Produits et services disponibles';
COMMENT ON TABLE tournament_entries IS 'Inscriptions aux tournois avec paiement QP';
COMMENT ON TABLE tournament_prize_pool IS 'Prize pools des tournois';
COMMENT ON TABLE withdrawal_requests IS 'Demandes de retrait d''argent';
