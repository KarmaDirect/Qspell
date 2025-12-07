-- 🚨 FIX URGENT : Appliquer directement dans Supabase Dashboard
-- Copiez-collez CE SCRIPT COMPLET dans : Dashboard > SQL Editor > Run

-- ========================================
-- ÉTAPE 1: Ajouter la colonne role si manquante
-- ========================================
DO $$ 
BEGIN
  -- Ajouter la colonne role si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;
    RAISE NOTICE '✅ Colonne role ajoutée';
  ELSE
    RAISE NOTICE '✅ Colonne role existe déjà';
  END IF;
END $$;

-- Mettre à jour les profiles existants sans role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL OR role = '';

RAISE NOTICE '✅ Profiles existants mis à jour';

-- ========================================
-- ÉTAPE 2: Recréer le trigger PROPREMENT
-- ========================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
RAISE NOTICE '✅ Ancien trigger supprimé';

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.handle_new_user();
RAISE NOTICE '✅ Ancienne fonction supprimée';

-- Créer la nouvelle fonction ROBUSTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  -- Extraire username des metadata ou utiliser l'email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extraire display_name ou utiliser username
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    v_username
  );
  
  -- Insérer le profil avec role='user' par défaut
  INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    v_username,
    v_display_name,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✅ Profile créé pour user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Logger l'erreur mais NE PAS bloquer la création
    RAISE WARNING '⚠️  Erreur création profile pour %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

RAISE NOTICE '✅ Fonction handle_new_user créée';

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Trigger on_auth_user_created créé';

-- ========================================
-- ÉTAPE 3: Définir les permissions
-- ========================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

RAISE NOTICE '✅ Permissions définies';

-- ========================================
-- ÉTAPE 4: Vérification finale
-- ========================================

-- Vérifier que tout est en place
DO $$
DECLARE
  v_has_role BOOLEAN;
  v_has_trigger BOOLEAN;
  v_has_function BOOLEAN;
BEGIN
  -- Vérifier colonne role
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) INTO v_has_role;
  
  -- Vérifier trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO v_has_trigger;
  
  -- Vérifier fonction
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' 
    AND routine_name = 'handle_new_user'
  ) INTO v_has_function;
  
  IF v_has_role AND v_has_trigger AND v_has_function THEN
    RAISE NOTICE '🎉 SUCCESS ! Tout est configuré correctement !';
    RAISE NOTICE '   ✅ Colonne role existe';
    RAISE NOTICE '   ✅ Trigger existe';
    RAISE NOTICE '   ✅ Fonction existe';
    RAISE NOTICE '   ';
    RAISE NOTICE '👉 Vous pouvez maintenant tester l''inscription !';
  ELSE
    RAISE EXCEPTION '❌ ÉCHEC - Quelque chose manque: role=%, trigger=%, function=%', 
      v_has_role, v_has_trigger, v_has_function;
  END IF;
END $$;

-- ========================================
-- BONUS: Créer profiles pour users existants sans profile
-- ========================================

INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
SELECT 
  u.id,
  split_part(u.email, '@', 1) as username,
  split_part(u.email, '@', 1) as display_name,
  'user' as role,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Afficher le résultat
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u 
   LEFT JOIN public.profiles p ON u.id = p.id 
   WHERE p.id IS NULL) as users_sans_profile;

-- ========================================
-- 🎯 CE SCRIPT EST MAINTENANT TERMINÉ
-- ========================================
-- Si vous voyez "SUCCESS !" ci-dessus, testez l'inscription !
-- Allez sur http://localhost:3000/register et créez un compte.
