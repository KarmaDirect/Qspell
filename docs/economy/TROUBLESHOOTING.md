# 🔧 Dépannage - Système Économique

## Erreurs courantes et solutions

### Erreur : "relation already exists"

**Cause** : Un index, une table ou un type existe déjà.

**Solution** : La migration a été mise à jour pour être idempotente. Si vous avez encore cette erreur :

1. **Option 1** : Exécuter le script de correction
   ```sql
   -- Via Supabase Dashboard SQL Editor
   -- Copier le contenu de supabase/sql/fix_migration_errors.sql
   ```

2. **Option 2** : Supprimer manuellement l'élément en conflit
   ```sql
   DROP INDEX IF EXISTS idx_user_wallets_user_id;
   -- Puis réexécuter la migration
   ```

### Erreur : "type already exists"

**Cause** : Un type ENUM existe déjà.

**Solution** : La migration utilise maintenant `DO $$ BEGIN ... EXCEPTION ... END $$` pour gérer les types existants. Si vous avez encore cette erreur :

```sql
-- Supprimer le type (ATTENTION : supprime aussi les colonnes qui l'utilisent)
DROP TYPE IF EXISTS qp_transaction_type CASCADE;
-- Puis réexécuter la migration
```

### Erreur : "policy already exists"

**Cause** : Une politique RLS existe déjà.

**Solution** : La migration utilise maintenant `DROP POLICY IF EXISTS` avant chaque `CREATE POLICY`. Si vous avez encore cette erreur :

```sql
-- Supprimer la politique
DROP POLICY IF EXISTS "Users can view own wallet" ON user_wallets;
-- Puis réexécuter la migration
```

### Erreur : "function already exists"

**Cause** : Une fonction SQL existe déjà.

**Solution** : La migration utilise `CREATE OR REPLACE FUNCTION`, donc cela devrait fonctionner. Si vous avez encore cette erreur :

```sql
-- Supprimer la fonction
DROP FUNCTION IF EXISTS debit_qp CASCADE;
-- Puis réexécuter la migration
```

### Erreur : "constraint already exists"

**Cause** : Une contrainte UNIQUE existe déjà.

**Solution** : La migration utilise `CREATE UNIQUE INDEX IF NOT EXISTS`. Si vous avez encore cette erreur :

```sql
-- Supprimer l'index unique
DROP INDEX IF EXISTS idx_subscriptions_active_unique;
-- Puis réexécuter la migration
```

## Vérification après migration

Exécutez le script de vérification :

```sql
-- Via Supabase Dashboard SQL Editor
-- Copier le contenu de docs/economy/VERIFY_MIGRATION.sql
```

## Réinitialisation complète (⚠️ DANGEREUX)

Si vous voulez tout supprimer et recommencer :

```sql
-- ⚠️ ATTENTION : Supprime TOUTES les données économiques
DROP TABLE IF EXISTS formation_purchases CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS tournament_prize_pool CASCADE;
DROP TABLE IF EXISTS tournament_entries CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subscription_benefits CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS qp_packages CASCADE;
DROP TABLE IF EXISTS cash_transactions CASCADE;
DROP TABLE IF EXISTS qp_transactions CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;

-- Supprimer les types
DROP TYPE IF EXISTS withdrawal_status CASCADE;
DROP TYPE IF EXISTS withdrawal_method CASCADE;
DROP TYPE IF EXISTS tournament_entry_status CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS cash_transaction_status CASCADE;
DROP TYPE IF EXISTS cash_transaction_type CASCADE;
DROP TYPE IF EXISTS qp_transaction_type CASCADE;

-- Puis réexécuter la migration
```

## Problèmes courants

### Le wallet n'est pas créé automatiquement

**Solution** : Vérifier que le trigger existe :

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_profile_created_wallet';
```

Si le trigger n'existe pas, réexécuter la section des triggers dans la migration.

### Les fonctions SQL ne fonctionnent pas

**Solution** : Vérifier les permissions :

```sql
-- Vérifier que les fonctions existent
SELECT proname FROM pg_proc WHERE proname LIKE '%_qp' OR proname LIKE '%_cash';
```

### Les politiques RLS bloquent l'accès

**Solution** : Vérifier que RLS est activé et que les politiques existent :

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_wallets';
```

## Support

Si vous rencontrez d'autres problèmes :

1. Vérifiez les logs Supabase Dashboard → Logs
2. Vérifiez que toutes les migrations précédentes ont été appliquées
3. Consultez la documentation Supabase : https://supabase.com/docs
