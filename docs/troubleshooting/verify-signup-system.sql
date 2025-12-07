-- 🔍 Script de vérification complète du système d'inscription
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ✅ 1. Vérifier la structure de la table profiles
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ✅ 2. Vérifier que le trigger existe
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ✅ 3. Vérifier la fonction handle_new_user
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- ✅ 4. Vérifier les permissions sur profiles
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- ✅ 5. Compter les utilisateurs et profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u 
   LEFT JOIN public.profiles p ON u.id = p.id 
   WHERE p.id IS NULL) as users_without_profile;

-- ✅ 6. Voir les derniers utilisateurs créés
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.username,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 🎯 Si tout est OK, vous devriez voir :
-- 1. profiles a bien une colonne 'role' avec default 'user'
-- 2. Le trigger 'on_auth_user_created' existe
-- 3. La fonction 'handle_new_user' existe avec type 'FUNCTION' et security 'DEFINER'
-- 4. Les permissions sont correctes (authenticated peut INSERT/UPDATE sur profiles)
-- 5. Le nombre de users et profiles devrait correspondre (ou users_without_profile = 0)
-- 6. Les derniers users ont bien un profile avec un role

-- ❌ Si vous voyez des problèmes :
-- - Colonne role manquante → Exécutez la migration 20240111000001_ensure_profiles_has_role.sql
-- - Trigger manquant → Exécutez la migration 20240111000000_fix_user_creation_trigger.sql
-- - Users sans profile → Exécutez le script de fix ci-dessous

-- 🔧 FIX : Créer les profiles manquants
-- (À exécuter seulement si users_without_profile > 0)
/*
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
*/
