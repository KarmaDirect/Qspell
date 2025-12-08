# 📦 Comment appliquer la migration économique

## Option 1 : Via Supabase Dashboard (RECOMMANDÉ - Plus simple)

Cette méthode ne nécessite **pas** d'installer Supabase CLI.

### Étapes :

1. **Ouvrez votre projet Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet QSPELL

2. **Ouvrez le SQL Editor**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New Query"**

3. **Copiez la migration**
   - Ouvrez le fichier : `supabase/migrations/20250113000000_economic_system.sql`
   - Sélectionnez **TOUT le contenu** (Ctrl+A / Cmd+A)
   - Copiez (Ctrl+C / Cmd+C)

4. **Collez dans l'éditeur SQL**
   - Collez le contenu dans l'éditeur Supabase
   - Vérifiez que tout est bien collé

5. **Exécutez la migration**
   - Cliquez sur **"Run"** (ou appuyez sur Ctrl+Entrée / Cmd+Entrée)
   - Attendez quelques secondes

6. **Vérifiez le résultat**
   - Vous devriez voir "Success. No rows returned"
   - Si vous voyez des erreurs, vérifiez les messages

### ✅ Vérification

Pour vérifier que tout fonctionne, exécutez cette requête dans le SQL Editor :

```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_wallets',
  'qp_transactions',
  'cash_transactions',
  'qp_packages',
  'subscriptions',
  'products'
)
ORDER BY table_name;
```

Vous devriez voir 6 tables (ou plus si d'autres existent déjà).

---

## Option 2 : Installer Supabase CLI (Pour les développeurs)

Si vous préférez utiliser la ligne de commande :

### Installation (Windows avec Git Bash)

```bash
# Via npm (recommandé)
npm install -g supabase

# Ou via Scoop (si installé)
scoop install supabase

# Ou via Chocolatey (si installé)
choco install supabase
```

### Installation (macOS/Linux)

```bash
# Via Homebrew (macOS)
brew install supabase/tap/supabase

# Via npm
npm install -g supabase
```

### Lier votre projet

```bash
# Se connecter à Supabase
supabase login

# Lier votre projet (vous aurez besoin du project-ref)
supabase link --project-ref votre-project-ref
```

### Appliquer la migration

```bash
# Depuis la racine du projet
supabase db push
```

---

## Option 3 : Utiliser npx (Sans installation globale)

Si Supabase CLI est dans vos `devDependencies`, vous pouvez utiliser `npx` :

```bash
# Lier le projet (première fois seulement)
npx supabase link --project-ref votre-project-ref

# Appliquer les migrations
npx supabase db push
```

---

## ⚠️ Erreurs courantes

### Erreur : "relation already exists"

Si vous voyez cette erreur, cela signifie qu'une table existe déjà. Vous avez deux options :

1. **Supprimer les tables existantes** (⚠️ ATTENTION : supprime les données) :
   ```sql
   DROP TABLE IF EXISTS user_wallets CASCADE;
   DROP TABLE IF EXISTS qp_transactions CASCADE;
   -- etc. pour toutes les tables
   ```

2. **Modifier la migration** pour utiliser `CREATE TABLE IF NOT EXISTS` au lieu de `CREATE TABLE`

### Erreur : "permission denied"

Assurez-vous d'être connecté avec un compte qui a les droits d'administration sur le projet Supabase.

### Erreur : "function already exists"

Les fonctions SQL peuvent déjà exister. La migration utilise `CREATE OR REPLACE FUNCTION` donc cela devrait fonctionner. Si ce n'est pas le cas, vous pouvez supprimer manuellement :

```sql
DROP FUNCTION IF EXISTS debit_qp CASCADE;
DROP FUNCTION IF EXISTS credit_qp CASCADE;
-- etc.
```

---

## 🎯 Après l'application

Une fois la migration appliquée :

1. ✅ Vérifiez que les tables existent (voir requête ci-dessus)
2. ✅ Vérifiez que les données initiales sont créées :
   ```sql
   SELECT * FROM qp_packages;
   SELECT * FROM products;
   SELECT * FROM subscription_benefits;
   ```
3. ✅ Testez la création d'un wallet :
   - Créez un nouveau compte utilisateur
   - Vérifiez qu'il reçoit automatiquement 50 QP

---

## 📝 Notes

- La migration est **idempotente** : vous pouvez l'exécuter plusieurs fois sans problème
- Les `CREATE TABLE IF NOT EXISTS` évitent les erreurs si les tables existent déjà
- Les fonctions utilisent `CREATE OR REPLACE` donc elles seront mises à jour si elles existent
- Les données initiales utilisent `ON CONFLICT DO NOTHING` donc elles ne seront pas dupliquées

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Supabase Dashboard → Logs
2. Vérifiez que vous avez les bonnes permissions
3. Assurez-vous que toutes les migrations précédentes ont été appliquées
4. Consultez la documentation Supabase : https://supabase.com/docs
