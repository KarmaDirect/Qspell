# 🎯 Configuration du compte CEO pour tests

## Initialisation du wallet CEO

Après avoir appliqué la migration économique, exécutez ce script pour initialiser le wallet du compte CEO :

### Script SQL

Le script se trouve dans : `supabase/sql/init_ceo_wallet.sql`

### Exécution

1. **Via Supabase Dashboard** :
   - Ouvrez Supabase Dashboard → SQL Editor
   - Copiez le contenu de `supabase/sql/init_ceo_wallet.sql`
   - Collez et exécutez

2. **Résultat attendu** :
   - Wallet créé avec **10,000 QP** de départ
   - Wallet créé avec **1,000€** de départ
   - Transactions enregistrées

### Accès au système admin

Une fois le wallet initialisé, vous pouvez :

1. **Gérer les wallets utilisateurs** :
   - `/dashboard/admin/finance/users`
   - Créditer/débiter QP et Cash pour n'importe quel utilisateur

2. **Tester sans Stripe** :
   - Utilisez l'API `/api/admin/economy/wallet/manage`
   - Actions disponibles : `credit_qp`, `debit_qp`, `credit_cash`, `debit_cash`

3. **Dashboard financier** :
   - `/dashboard/admin/finance`
   - Toutes les métriques économiques

### Exemple d'utilisation API

```typescript
// Créditer 1000 QP à un utilisateur
const response = await fetch('/api/admin/economy/wallet/manage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetUserId: 'user-uuid',
    action: 'credit_qp',
    amount: 1000,
    description: 'Test admin'
  })
})
```

### Vérification

Pour vérifier que le wallet CEO est bien initialisé :

```sql
SELECT 
  p.email,
  p.username,
  w.qp_balance,
  w.cash_balance
FROM profiles p
JOIN user_wallets w ON w.user_id = p.id
WHERE p.id IN (
  SELECT id FROM auth.users WHERE email = 'hatim.moro.2002@gmail.com'
);
```

Vous devriez voir :
- `qp_balance`: 10000
- `cash_balance`: 1000.00
