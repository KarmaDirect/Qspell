-- ============================================
-- CACHE DES RÉSUMÉS DE MATCHES
-- ============================================
-- Migration: 20250114000000_match_cache.sql
-- Description: Table de cache pour stocker les résumés de matches et réduire les appels API Riot
-- ============================================

-- Table pour stocker les résumés de matches (données de base uniquement)
-- Permet d'éviter de recharger les mêmes matches depuis l'API Riot
CREATE TABLE IF NOT EXISTS match_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL, -- 'europe', 'americas', 'asia', etc.
  riot_account_puuid TEXT NOT NULL,
  game_creation BIGINT NOT NULL,
  game_duration INTEGER NOT NULL,
  queue_id INTEGER NOT NULL,
  game_mode TEXT,
  participant_data JSONB NOT NULL, -- {championName, championId, kills, deaths, assists, win, teamPosition}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_match_summaries_match_id ON match_summaries(match_id);
CREATE INDEX IF NOT EXISTS idx_match_summaries_puuid ON match_summaries(riot_account_puuid);
CREATE INDEX IF NOT EXISTS idx_match_summaries_created_at ON match_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_summaries_puuid_queue ON match_summaries(riot_account_puuid, queue_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_match_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_match_summaries_updated_at ON match_summaries;
CREATE TRIGGER trigger_update_match_summaries_updated_at
  BEFORE UPDATE ON match_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_match_summaries_updated_at();

-- RLS : Tous les utilisateurs peuvent lire les résumés (public data)
ALTER TABLE match_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match summaries are viewable by everyone" ON match_summaries;
CREATE POLICY "Match summaries are viewable by everyone"
  ON match_summaries FOR SELECT
  USING (true);

-- Seuls les admins peuvent insérer/mettre à jour (via API backend)
DROP POLICY IF EXISTS "Admins can manage match summaries" ON match_summaries;
CREATE POLICY "Admins can manage match summaries"
  ON match_summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'ceo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'ceo')
    )
  );

-- Commentaires
COMMENT ON TABLE match_summaries IS 'Cache des résumés de matches pour éviter les appels API Riot répétés. Les détails complets sont chargés uniquement au clic.';
COMMENT ON COLUMN match_summaries.participant_data IS 'Données de base du participant (KDA, champion, etc.) stockées en JSONB';
COMMENT ON COLUMN match_summaries.match_id IS 'ID du match Riot (ex: EUW1_1234567890)';
COMMENT ON COLUMN match_summaries.platform IS 'Platform Riot (europe, americas, asia)';
