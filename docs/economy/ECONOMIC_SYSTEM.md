# 💰 Système Économique QSPELL - Documentation

## Vue d'ensemble

Le système économique QSPELL utilise une **double monnaie** :
- **QP (QSPELL Points)** : Monnaie virtuelle achetée avec de l'argent réel, non récupérable
- **Cash** : Argent réel gagné via les tournois, récupérable via retrait

## Architecture

### Tables principales

1. **user_wallets** : Portefeuilles des utilisateurs (QP + Cash)
2. **qp_transactions** : Historique des transactions QP
3. **cash_transactions** : Historique des transactions Cash
4. **qp_packages** : Packs de QP disponibles à l'achat
5. **subscriptions** : Abonnements Premium
6. **products** : Produits/services disponibles
7. **tournament_entries** : Inscriptions aux tournois avec paiement QP
8. **tournament_prize_pool** : Prize pools des tournois
9. **withdrawal_requests** : Demandes de retrait

### Fonctions SQL

- `debit_qp()` : Débite des QP
- `credit_qp()` : Crédite des QP
- `credit_cash()` : Crédite du Cash
- `debit_cash()` : Débite du Cash
- `has_premium_subscription()` : Vérifie si un utilisateur a Premium
- `calculate_qp_bonus()` : Calcule le bonus QP selon le prix

## APIs disponibles

### Wallet

- `GET /api/economy/wallet` : Récupère le wallet de l'utilisateur

### QP (Points Virtuels)

- `GET /api/economy/qp/packages` : Liste des packs QP disponibles
- `POST /api/economy/qp/purchase` : Crée une session Stripe pour acheter des QP
- `POST /api/economy/qp/purchase/webhook` : Webhook Stripe pour traiter les paiements
- `POST /api/economy/qp/spend` : Dépense des QP pour un service
- `GET /api/economy/qp/transactions` : Historique des transactions QP

### Cash (Argent Réel)

- `GET /api/economy/cash/transactions` : Historique des transactions Cash
- `POST /api/economy/withdrawal/request` : Crée une demande de retrait
- `GET /api/economy/withdrawal/request` : Liste des demandes de retrait

### Abonnements Premium

- `POST /api/economy/subscription/premium` : Crée un abonnement Premium
- `GET /api/economy/subscription/premium` : Récupère l'abonnement actif
- `POST /api/economy/subscription/webhook` : Webhook Stripe pour les abonnements

### Tournois

- `POST /api/economy/tournament/prize` : Distribue les prix d'un tournoi (Admin)

## Configuration

### Variables d'environnement requises

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Constantes économiques

Définies dans `src/lib/economy/wallet.ts` :

- `QP_BASE_RATE`: 100 (100 QP = 1€)
- `PLATFORM_FEE_PERCENT`: 10 (10% sur retraits)
- `MIN_WITHDRAWAL`: 10€
- `MAX_WITHDRAWAL_MONTHLY`: 1000€
- `PREMIUM_PRICE`: 9.99€/mois
- `PREMIUM_QP_MONTHLY`: 500 QP/mois

## Flows monétaires

### 1. Achat QP

```
User → POST /api/economy/qp/purchase
  ↓
Stripe Checkout Session créée
  ↓
User paie via Stripe
  ↓
Webhook Stripe → POST /api/economy/qp/purchase/webhook
  ↓
credit_qp() appelé
  ↓
QP ajoutés au wallet
```

### 2. Dépense QP

```
User → POST /api/economy/qp/spend
  ↓
Vérification solde
  ↓
debit_qp() appelé
  ↓
QP débités
  ↓
Service activé
```

### 3. Abonnement Premium

```
User → POST /api/economy/subscription/premium
  ↓
Stripe Subscription créée
  ↓
Webhook → POST /api/economy/subscription/webhook
  ↓
Abonnement activé + 500 QP crédités
  ↓
Chaque mois : renouvellement + 500 QP
```

### 4. Gain Tournoi

```
Admin → POST /api/economy/tournament/prize
  ↓
Distribution calculée selon ranking
  ↓
credit_cash() pour chaque membre
  ↓
Cash ajouté aux wallets
```

### 5. Retrait Cash

```
User → POST /api/economy/withdrawal/request
  ↓
Vérification limites (min 10€, max 1000€/mois)
  ↓
Frais calculés (10%)
  ↓
debit_cash() appelé
  ↓
Demande créée (status: pending)
  ↓
Admin valide → Status: completed
```

## Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- Les utilisateurs ne peuvent voir que leurs propres transactions
- Les fonctions SQL utilisent `SECURITY DEFINER` pour les opérations critiques
- Vérification des soldes avant chaque débit
- Limites anti-abus (retraits mensuels, minimums, etc.)

## Migration

Pour appliquer le système économique :

```bash
# La migration SQL est dans :
supabase/migrations/20250113000000_economic_system.sql

# Appliquer via Supabase CLI :
supabase migration up
```

## Tests

### Tester l'achat QP

1. Créer un compte utilisateur
2. Appeler `POST /api/economy/qp/purchase` avec un `packageId`
3. Utiliser le `sessionId` pour rediriger vers Stripe Checkout
4. Simuler un paiement dans Stripe Dashboard
5. Vérifier que les QP sont crédités via `GET /api/economy/wallet`

### Tester la dépense QP

1. S'assurer d'avoir des QP dans le wallet
2. Appeler `POST /api/economy/qp/spend` avec `type: 'ai_analysis'`
3. Vérifier que les QP sont débités

### Tester Premium

1. Appeler `POST /api/economy/subscription/premium`
2. Compléter le paiement Stripe
3. Vérifier l'abonnement via `GET /api/economy/subscription/premium`
4. Vérifier que 500 QP sont crédités

## Notes importantes

- Les QP ne sont **pas** convertibles en Cash
- Les QP ne sont **pas** transférables entre utilisateurs
- Les retraits nécessitent une validation admin
- KYC requis pour retraits > 100€
- Les abonnements Premium se renouvellent automatiquement
- Les QP mensuels Premium sont crédités à chaque renouvellement
