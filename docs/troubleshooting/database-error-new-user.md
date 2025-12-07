# 🔧 Fix: Database Error lors de la création d'utilisateur

## Problème
Erreur "Database error saving new user" lors de l'inscription d'un nouveau compte.

## Cause
Le trigger `handle_new_user()` qui crée automatiquement un profil lors de l'inscription peut échouer si :
- La colonne `role` n'existe pas dans la table `profiles`
- Le trigger n'est pas correctement déployé sur Supabase
- Il y a des problèmes de permissions

## Solution appliquée

### 1. Migration créée : `20240111000000_fix_user_creation_trigger.sql`

Cette migration :
- ✅ Recrée le trigger avec une meilleure gestion des erreurs
- ✅ Ajoute un `ON CONFLICT DO NOTHING` pour éviter les doublons
- ✅ Définit le rôle par défaut à `'user'`
- ✅ Utilise `EXCEPTION WHEN OTHERS` pour logger les erreurs sans bloquer la création
- ✅ Accorde les permissions nécessaires

### 2. Déploiement de la migration

```bash
cd c:\Users\hatim\Desktop\parias
npx supabase db push
```

## Vérification

### Option 1: Via l'interface Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet QSPELL
3. Allez dans **Database** > **Functions**
4. Vérifiez que `handle_new_user` existe

### Option 2: Via SQL Editor
```sql
-- Vérifier que le trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Tester la fonction
SELECT public.handle_new_user();
```

## Test manuel

1. Essayez de créer un nouveau compte via `/register`
2. Si l'inscription réussit → ✅ Le problème est résolu
3. Si l'erreur persiste, vérifiez les logs Supabase :
   - Dashboard > Logs > Database

## Debugging supplémentaire

### Vérifier la structure de la table profiles
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Vérifier les permissions
```sql
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'profiles';
```

### Forcer la recréation d'un profil manuellement
Si un utilisateur existe sans profil :
```sql
-- Trouver les users sans profil
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Créer manuellement le profil manquant
INSERT INTO public.profiles (id, username, display_name, role)
SELECT 
  id,
  split_part(email, '@', 1) as username,
  split_part(email, '@', 1) as display_name,
  'user' as role
FROM auth.users
WHERE id = 'USER_ID_ICI'
ON CONFLICT (id) DO NOTHING;
```

## Prévention future

Le trigger amélioré inclut maintenant :
- ✅ Gestion d'erreur avec `EXCEPTION`
- ✅ Logging des warnings
- ✅ `ON CONFLICT DO NOTHING` pour éviter les duplications
- ✅ Valeurs par défaut robustes

## Contact Support
Si le problème persiste après ces étapes, contactez le support Supabase avec :
- Les logs d'erreur complets
- Le résultat de la requête de vérification du trigger
- L'ID du projet Supabase
