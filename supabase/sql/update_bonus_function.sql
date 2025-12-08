-- ============================================
-- Script pour mettre à jour la fonction calculate_qp_bonus_from_amount
-- ============================================
-- À exécuter pour corriger les calculs de bonus
-- ============================================

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

-- Vérifier que la fonction fonctionne correctement
SELECT 
  'Vérification fonction bonus' as check_type,
  name,
  qp_amount,
  price_eur,
  bonus_qp as bonus_reel,
  calculate_qp_bonus_from_amount(qp_amount, price_eur) as bonus_calcule,
  bonus_qp - calculate_qp_bonus_from_amount(qp_amount, price_eur) as difference
FROM qp_packages
ORDER BY display_order;
