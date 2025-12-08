-- Script pour corriger la RLS de match_summaries
-- Permet aux utilisateurs authentifiés d'insérer leurs propres match summaries

-- Supprimer l'ancienne policy admin-only
DROP POLICY IF EXISTS "Admins can manage match summaries" ON match_summaries;

-- Policy pour permettre aux utilisateurs d'insérer leurs propres match summaries
-- (vérifie que le puuid correspond à un de leurs comptes Riot)
CREATE POLICY "Users can insert their own match summaries"
  ON match_summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM riot_accounts
      WHERE riot_accounts.puuid = match_summaries.riot_account_puuid
      AND riot_accounts.profile_id = auth.uid()
    )
  );

-- Policy pour permettre aux utilisateurs de mettre à jour leurs propres match summaries
CREATE POLICY "Users can update their own match summaries"
  ON match_summaries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM riot_accounts
      WHERE riot_accounts.puuid = match_summaries.riot_account_puuid
      AND riot_accounts.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM riot_accounts
      WHERE riot_accounts.puuid = match_summaries.riot_account_puuid
      AND riot_accounts.profile_id = auth.uid()
    )
  );

-- Les admins peuvent toujours tout gérer
CREATE POLICY "Admins can manage all match summaries"
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
