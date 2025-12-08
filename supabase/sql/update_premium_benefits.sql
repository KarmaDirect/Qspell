-- Script pour mettre à jour les avantages Premium
-- Réduction coaching : 20% → 15%
-- Formations : certaines restent payantes même pour Premium

UPDATE subscription_benefits
SET 
  benefit_value = '15'::jsonb,
  description = 'Réduction de 15% sur le coaching'
WHERE plan = 'premium' AND benefit_key = 'coaching_discount';

UPDATE subscription_benefits
SET 
  benefit_value = 'false'::jsonb,
  description = 'Accès aux formations de base (certaines formations premium restent payantes)'
WHERE plan = 'premium' AND benefit_key = 'unlimited_formations';

-- Vérification
SELECT 
  plan,
  benefit_key,
  benefit_value,
  description
FROM subscription_benefits
WHERE plan = 'premium'
ORDER BY benefit_key;
