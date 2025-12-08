# Configuration des variables d'environnement

## Variables requises pour le système économique

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Stripe - Paiements
STRIPE_SECRET_KEY=sk_test_... # Clé secrète Stripe (test ou production)
STRIPE_PUBLISHABLE_KEY=pk_test_... # Clé publique Stripe (optionnelle, pour le frontend)
STRIPE_WEBHOOK_SECRET=whsec_... # Secret du webhook Stripe

# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Configuration Stripe

### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte
3. Récupérez vos clés API dans le Dashboard → Developers → API keys

### 2. Configurer les webhooks

1. Dans Stripe Dashboard → Developers → Webhooks
2. Cliquez sur "Add endpoint"
3. URL : `https://votre-domaine.com/api/economy/qp/purchase/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
5. Copiez le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`

6. Créez un deuxième endpoint pour les abonnements :
   - URL : `https://votre-domaine.com/api/economy/subscription/webhook`
   - Événements :
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`

### 3. Mode test vs production

- **Test** : Utilisez les clés `sk_test_...` et `pk_test_...`
- **Production** : Utilisez les clés `sk_live_...` et `pk_live_...`

## Installation de Stripe

Le package Stripe doit être installé :

```bash
npm install stripe
```

## Vérification

Pour vérifier que tout fonctionne :

1. Vérifiez que les variables sont bien définies :
   ```bash
   echo $STRIPE_SECRET_KEY
   ```

2. Testez une requête API :
   ```bash
   curl -X POST http://localhost:8080/api/economy/qp/packages
   ```

## Sécurité

⚠️ **Important** :
- Ne commitez **jamais** vos clés secrètes dans Git
- Utilisez `.env.local` qui est dans `.gitignore`
- En production, utilisez les variables d'environnement de votre hébergeur (Vercel, etc.)
