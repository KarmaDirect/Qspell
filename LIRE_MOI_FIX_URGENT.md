# 🚨 FIX URGENT - Erreur 500 lors de l'inscription

## Le problème persiste !

L'erreur 500 signifie que le trigger `handle_new_user()` échoue toujours lors de la création du profil.

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1: Ouvrir Supabase Dashboard

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet **QSPELL**
3. Cliquez sur **SQL Editor** (dans le menu gauche)

### Étape 2: Exécuter le script de fix

1. Dans le SQL Editor, **copier-coller TOUT le contenu** du fichier :
   ```
   FIX_URGENT_SIGNUP.sql
   ```

2. Cliquer sur **RUN** (bouton en bas à droite)

3. **Attendre** que le script se termine (quelques secondes)

4. **Vérifier** que vous voyez le message :
   ```
   🎉 SUCCESS ! Tout est configuré correctement !
   ```

### Étape 3: Tester l'inscription

1. Allez sur **http://localhost:3000/register**
2. Créez un nouveau compte :
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Cliquez sur **S'inscrire**

✅ **Résultat attendu**: "Compte créé avec succès !"

---

## 🔍 Si ça ne marche TOUJOURS pas

### 1. Vérifier les logs d'erreur

Dans Supabase Dashboard :
1. Allez dans **Logs** > **Database**
2. Filtrez par "error"
3. Regardez l'erreur EXACTE qui apparaît

### 2. Vérifier manuellement

Exécutez dans SQL Editor :
```sql
-- Vérifier la colonne role
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- Si rien ne s'affiche, la colonne n'existe pas !
```

### 3. Tester le trigger manuellement

```sql
-- Créer un user de test directement
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Insérer manuellement un profile
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    test_user_id,
    'testmanual',
    'Test Manual',
    'user'
  );
  
  RAISE NOTICE 'Test réussi ! Profile créé avec ID: %', test_user_id;
END $$;
```

Si cette commande échoue, il y a un problème avec la table `profiles` elle-même.

---

## 🆘 Dernier recours : Créer la colonne manuellement

Si RIEN ne fonctionne, exécutez SEULEMENT ceci :

```sql
-- Force l'ajout de la colonne role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- Confirmer
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
```

---

## 📋 Checklist de diagnostic

- [ ] Script `FIX_URGENT_SIGNUP.sql` exécuté dans Supabase Dashboard
- [ ] Message "SUCCESS !" visible dans les résultats
- [ ] Colonne `role` existe (vérifiée avec la requête)
- [ ] Trigger `on_auth_user_created` existe
- [ ] Test d'inscription effectué
- [ ] Logs Supabase consultés si échec

---

## 💡 Pourquoi ça échoue ?

L'erreur 500 vient de :
1. **Colonne `role` manquante** dans `profiles` ⬅️ Cause #1
2. **Trigger mal configuré** ou avec mauvaises permissions
3. **Migrations non appliquées** sur le serveur Supabase

Le script `FIX_URGENT_SIGNUP.sql` corrige TOUS ces problèmes en une seule fois.

---

## ✅ Après le fix

Une fois que ça marche, vous devriez pouvoir :
- ✅ Créer un compte sans erreur
- ✅ Le profile est créé automatiquement avec `role='user'`
- ✅ Se connecter avec le nouveau compte

**Exécutez maintenant le script `FIX_URGENT_SIGNUP.sql` dans Supabase Dashboard !**
