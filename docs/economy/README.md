# 💰 Système Économique QSPELL - Guide Complet

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Structure](#structure)
4. [Utilisation](#utilisation)
5. [APIs](#apis)
6. [Configuration](#configuration)

## Vue d'ensemble

Le système économique QSPELL implémente une **double monnaie** :

- **🔮 QP (QSPELL Points)** : Monnaie virtuelle achetée, utilisée pour les services
- **💵 Cash** : Argent réel gagné via les tournois, récupérable

### Caractéristiques principales

✅ Double wallet (QP + Cash)  
✅ Achat de QP via Stripe  
✅ Abonnement Premium récurrent  
✅ Dépense QP pour services (analyses IA, tournois, formations)  
✅ Gains tournois en Cash  
✅ Système de retrait avec frais (10%)  
✅ Historique complet des transactions  
✅ Sécurité RLS et vérifications  

## Installation

### 1. Dépendances

```bash
npm install stripe
```

### 2. Migration SQL

La migration est dans `supabase/migrations/20250113000000_economic_system.sql`

**Méthode recommandée (sans CLI)** :
1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez tout le contenu de `supabase/migrations/20250113000000_economic_system.sql`
3. Collez dans l'éditeur et exécutez (Run)

**Avec Supabase CLI** :
```bash
supabase db push
# ou
supabase migration up
```

📖 **Guide détaillé** : Voir [APPLY_MIGRATION.md](./APPLY_MIGRATION.md)

### 3. Variables d'environnement

Créez un fichier `.env.local` avec :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Voir [ENV_SETUP.md](./ENV_SETUP.md) pour plus de détails.

### 4. Configuration Stripe

1. Créez un compte Stripe
2. Configurez les webhooks (voir [ENV_SETUP.md](./ENV_SETUP.md))
3. Ajoutez vos clés API

## Structure

### Fichiers créés

```
src/
├── lib/
│   └── economy/
│       └── wallet.ts              # Fonctions utilitaires
├── app/
│   └── api/
│       └── economy/
│           ├── wallet/             # GET wallet
│           ├── qp/
│           │   ├── packages/       # GET packs QP
│           │   ├── purchase/        # POST achat QP
│           │   ├── purchase/webhook/ # Webhook Stripe
│           │   ├── spend/          # POST dépense QP
│           │   └── transactions/   # GET historique QP
│           ├── cash/
│           │   └── transactions/   # GET historique Cash
│           ├── subscription/
│           │   ├── premium/        # POST/GET abonnement
│           │   └── webhook/        # Webhook abonnements
│           ├── tournament/
│           │   └── prize/          # POST distribution prix
│           └── withdrawal/
│               └── request/        # POST/GET retraits

supabase/
└── migrations/
    └── 20250113000000_economic_system.sql

docs/
└── economy/
    ├── README.md                   # Ce fichier
    ├── ECONOMIC_SYSTEM.md         # Documentation technique
    └── ENV_SETUP.md               # Configuration env
```

## Utilisation

### Récupérer le wallet

```typescript
import { getCurrentUserWallet } from '@/lib/economy/wallet'

const wallet = await getCurrentUserWallet()
console.log(`QP: ${wallet?.qp_balance}, Cash: ${wallet?.cash_balance}`)
```

### Acheter des QP

```typescript
// Frontend
const response = await fetch('/api/economy/qp/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ packageId: 'uuid-du-pack' })
})

const { sessionId, url } = await response.json()
// Rediriger vers url (Stripe Checkout)
window.location.href = url
```

### Dépenser des QP

```typescript
const response = await fetch('/api/economy/qp/spend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'ai_analysis',
    referenceId: 'match-id',
    referenceType: 'match',
    description: 'Analyse IA du match'
  })
})
```

### Créer un abonnement Premium

```typescript
const response = await fetch('/api/economy/subscription/premium', {
  method: 'POST'
})

const { url } = await response.json()
// Rediriger vers Stripe Checkout
```

### Demander un retrait

```typescript
const response = await fetch('/api/economy/withdrawal/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50,
    method: 'paypal',
    details: { email: 'user@example.com' }
  })
})
```

## APIs

### Wallet

- **GET** `/api/economy/wallet` - Récupère le wallet de l'utilisateur

### QP

- **GET** `/api/economy/qp/packages` - Liste des packs disponibles
- **POST** `/api/economy/qp/purchase` - Crée une session Stripe
- **POST** `/api/economy/qp/spend` - Dépense des QP
- **GET** `/api/economy/qp/transactions` - Historique QP

### Cash

- **GET** `/api/economy/cash/transactions` - Historique Cash
- **POST** `/api/economy/withdrawal/request` - Crée une demande de retrait
- **GET** `/api/economy/withdrawal/request` - Liste des demandes

### Abonnements

- **POST** `/api/economy/subscription/premium` - Crée un abonnement
- **GET** `/api/economy/subscription/premium` - Récupère l'abonnement actif

### Tournois (Admin)

- **POST** `/api/economy/tournament/prize` - Distribue les prix

## Configuration

### Constantes économiques

Modifiables dans `src/lib/economy/wallet.ts` :

```typescript
export const ECONOMY_CONSTANTS = {
  QP_BASE_RATE: 100,              // 100 QP = 1€
  PLATFORM_FEE_PERCENT: 10,        // 10% sur retraits
  MIN_WITHDRAWAL: 10,              // Minimum 10€
  MAX_WITHDRAWAL_MONTHLY: 1000,    // Maximum 1000€/mois
  PREMIUM_PRICE: 9.99,             // Prix mensuel Premium
  PREMIUM_QP_MONTHLY: 500,         // QP inclus/mois
  AI_ANALYSIS_COST: 20,            // Coût analyse IA
  // ...
}
```

### Packs QP par défaut

Créés automatiquement dans la migration :

- Starter : 100 QP - 1.99€
- Basic : 500 QP + 50 bonus - 4.99€
- Pro : 1200 QP + 200 bonus - 9.99€
- Elite : 2500 QP + 500 bonus - 19.99€
- Legend : 6000 QP + 1500 bonus - 49.99€

## Sécurité

- ✅ Row Level Security (RLS) activé
- ✅ Vérification des soldes avant débit
- ✅ Limites anti-abus (retraits mensuels)
- ✅ KYC requis pour retraits > 100€
- ✅ Webhooks Stripe signés

## Tests

### Test manuel

1. Créer un compte utilisateur
2. Vérifier le wallet (devrait avoir 50 QP de bienvenue)
3. Acheter un pack QP via Stripe
4. Dépenser des QP pour une analyse IA
5. Créer un abonnement Premium
6. Vérifier les transactions

### Test webhook local

Utilisez Stripe CLI :

```bash
stripe listen --forward-to localhost:8080/api/economy/qp/purchase/webhook
```

## Support

Pour toute question ou problème :
- Voir [ECONOMIC_SYSTEM.md](./ECONOMIC_SYSTEM.md) pour la documentation technique
- Voir [ENV_SETUP.md](./ENV_SETUP.md) pour la configuration

## Prochaines étapes

- [ ] Interface utilisateur pour le wallet
- [ ] Dashboard admin pour gérer les retraits
- [ ] Système de referral
- [ ] Promotions et codes promo
- [ ] Gift cards
