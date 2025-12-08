-- ============================================
-- SYNCHRONISATION AUTOMATIQUE TOURNOIS <-> CALENDRIER
-- ============================================
-- Création de triggers pour synchroniser automatiquement
-- les tournois avec les événements du calendrier public

-- ============================================
-- FONCTION: Créer événement calendrier lors de la création d'un tournoi
-- ============================================

CREATE OR REPLACE FUNCTION sync_tournament_to_calendar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer l'événement pour la fin des inscriptions
  IF NEW.registration_end IS NOT NULL THEN
    INSERT INTO calendar_events (
      title,
      description,
      event_type,
      start_date,
      end_date,
      created_by,
      metadata
    ) VALUES (
      '📝 ' || NEW.name || ' - Fin des inscriptions',
      'Dernière chance de s''inscrire au tournoi: ' || NEW.name,
      'tournament',
      NEW.registration_end,
      NEW.registration_end,
      NEW.organizer_id,
      jsonb_build_object(
        'tournament_id', NEW.id,
        'event_subtype', 'registration_end'
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Créer l'événement pour le début du tournoi
  IF NEW.tournament_start IS NOT NULL THEN
    INSERT INTO calendar_events (
      title,
      description,
      event_type,
      start_date,
      end_date,
      created_by,
      metadata
    ) VALUES (
      '🏆 ' || NEW.name || ' - Début du tournoi',
      COALESCE(NEW.description, 'Tournoi ' || NEW.format || ' - Début de la compétition'),
      'tournament',
      NEW.tournament_start,
      NEW.tournament_end,
      NEW.organizer_id,
      jsonb_build_object(
        'tournament_id', NEW.id,
        'event_subtype', 'tournament_start',
        'format', NEW.format,
        'game_mode', NEW.game_mode,
        'team_size', NEW.team_size,
        'prize_pool', NEW.prize_pool
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- FONCTION: Mettre à jour événements calendrier lors de la modification d'un tournoi
-- ============================================

CREATE OR REPLACE FUNCTION update_tournament_calendar_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les anciens événements liés à ce tournoi
  DELETE FROM calendar_events 
  WHERE metadata->>'tournament_id' = OLD.id::text;

  -- Recréer les événements mis à jour (même logique que la création)
  IF NEW.registration_end IS NOT NULL THEN
    INSERT INTO calendar_events (
      title,
      description,
      event_type,
      start_date,
      end_date,
      created_by,
      metadata
    ) VALUES (
      '📝 ' || NEW.name || ' - Fin des inscriptions',
      'Dernière chance de s''inscrire au tournoi: ' || NEW.name,
      'tournament',
      NEW.registration_end,
      NEW.registration_end,
      NEW.organizer_id,
      jsonb_build_object(
        'tournament_id', NEW.id,
        'event_subtype', 'registration_end'
      )
    );
  END IF;

  IF NEW.tournament_start IS NOT NULL THEN
    INSERT INTO calendar_events (
      title,
      description,
      event_type,
      start_date,
      end_date,
      created_by,
      metadata
    ) VALUES (
      '🏆 ' || NEW.name || ' - Début du tournoi',
      COALESCE(NEW.description, 'Tournoi ' || NEW.format || ' - Début de la compétition'),
      'tournament',
      NEW.tournament_start,
      NEW.tournament_end,
      NEW.organizer_id,
      jsonb_build_object(
        'tournament_id', NEW.id,
        'event_subtype', 'tournament_start',
        'format', NEW.format,
        'game_mode', NEW.game_mode,
        'team_size', NEW.team_size,
        'prize_pool', NEW.prize_pool
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- FONCTION: Supprimer événements calendrier lors de la suppression d'un tournoi
-- ============================================

CREATE OR REPLACE FUNCTION delete_tournament_calendar_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer tous les événements liés à ce tournoi
  DELETE FROM calendar_events 
  WHERE metadata->>'tournament_id' = OLD.id::text;

  RETURN OLD;
END;
$$;

-- ============================================
-- TRIGGERS: Synchronisation automatique
-- ============================================

-- Trigger lors de la création d'un tournoi
DROP TRIGGER IF EXISTS tournament_create_calendar_sync ON tournaments;
CREATE TRIGGER tournament_create_calendar_sync
  AFTER INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION sync_tournament_to_calendar();

-- Trigger lors de la modification d'un tournoi
DROP TRIGGER IF EXISTS tournament_update_calendar_sync ON tournaments;
CREATE TRIGGER tournament_update_calendar_sync
  AFTER UPDATE ON tournaments
  FOR EACH ROW
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.registration_end IS DISTINCT FROM NEW.registration_end OR
    OLD.tournament_start IS DISTINCT FROM NEW.tournament_start OR
    OLD.tournament_end IS DISTINCT FROM NEW.tournament_end
  )
  EXECUTE FUNCTION update_tournament_calendar_events();

-- Trigger lors de la suppression d'un tournoi
DROP TRIGGER IF EXISTS tournament_delete_calendar_sync ON tournaments;
CREATE TRIGGER tournament_delete_calendar_sync
  BEFORE DELETE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION delete_tournament_calendar_events();

-- ============================================
-- MIGRATION: Synchroniser les tournois existants
-- ============================================

-- Supprimer les anciens événements de tournoi pour éviter les doublons
DELETE FROM calendar_events WHERE event_type = 'tournament';

-- Créer les événements pour tous les tournois existants
DO $$
DECLARE
  tournament_record RECORD;
BEGIN
  FOR tournament_record IN 
    SELECT * FROM tournaments 
    WHERE status IN ('upcoming', 'registration_open', 'in_progress', 'draft')
  LOOP
    -- Événement de fin d'inscription
    IF tournament_record.registration_end IS NOT NULL THEN
      INSERT INTO calendar_events (
        title,
        description,
        event_type,
        start_date,
        end_date,
        created_by,
        metadata
      ) VALUES (
        '📝 ' || tournament_record.name || ' - Fin des inscriptions',
        'Dernière chance de s''inscrire au tournoi: ' || tournament_record.name,
        'tournament',
        tournament_record.registration_end,
        tournament_record.registration_end,
        tournament_record.organizer_id,
        jsonb_build_object(
          'tournament_id', tournament_record.id,
          'event_subtype', 'registration_end'
        )
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Événement de début de tournoi
    IF tournament_record.tournament_start IS NOT NULL THEN
      INSERT INTO calendar_events (
        title,
        description,
        event_type,
        start_date,
        end_date,
        created_by,
        metadata
      ) VALUES (
        '🏆 ' || tournament_record.name || ' - Début du tournoi',
        COALESCE(tournament_record.description, 'Tournoi ' || tournament_record.format || ' - Début de la compétition'),
        'tournament',
        tournament_record.tournament_start,
        tournament_record.tournament_end,
        tournament_record.organizer_id,
        jsonb_build_object(
          'tournament_id', tournament_record.id,
          'event_subtype', 'tournament_start',
          'format', tournament_record.format,
          'game_mode', tournament_record.game_mode,
          'team_size', tournament_record.team_size,
          'prize_pool', tournament_record.prize_pool
        )
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Tournois existants synchronisés avec le calendrier';
END $$;

-- ============================================
-- SUCCÈS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Synchronisation tournois <-> calendrier configurée !';
  RAISE NOTICE '   - Trigger de création activé';
  RAISE NOTICE '   - Trigger de mise à jour activé';
  RAISE NOTICE '   - Trigger de suppression activé';
  RAISE NOTICE '   - Tournois existants migrés';
END $$;

