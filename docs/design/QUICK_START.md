# 🚀 Démarrage Rapide - Nouveau Design QSPELL

## ✅ Le design "Electric Rift" est déjà appliqué !

Vous n'avez **rien à configurer**, tout est prêt. Il suffit de lancer le serveur.

---

## 🎯 Lancer le Projet

### Option 1 : Depuis le PC (Recommandé)

```bash
# 1. Ouvrir un terminal dans le projet
cd c:\Users\hatim\Desktop\parias

# 2. Lancer le serveur (port 8080)
npm run dev

# 3. Ouvrir dans le navigateur
http://localhost:8080
```

### Option 2 : Accéder depuis votre téléphone

Si vous voulez tester sur votre téléphone (même WiFi) :

```bash
# 1. Trouver l'IP de votre PC
ipconfig
# Cherchez "IPv4 Address" : 192.168.X.X

# 2. Modifiez package.json si besoin :
"dev": "next dev --port 8080 -H 0.0.0.0"

# 3. Sur votre téléphone, ouvrez :
http://192.168.X.X:8080
```

---

## 🎨 Ce que vous allez voir

### 1. **Header**
- Logo QSPELL avec effet glow violet
- Navigation (Accueil, Tournois, Équipes, etc.)
- Badge "Admin CEO" doré si vous êtes admin
- Boutons Profil et Déconnexion

### 2. **Hero Section**
- Gradient animé purple/blue
- Message "Bienvenue, hatim !"
- 4 cartes de statistiques :
  - 📊 Tournois joués : 12
  - 🏆 Victoires : 8
  - 💰 Cash gagné : 450€ (+15%)
  - 📈 Win Rate : 66.7%

### 3. **Actions Rapides**
5 cartes colorées pour :
- 🏆 Tournois (purple/blue)
- 👤 Mon profil (blue/cyan)
- 👥 Trouver des coéquipiers (cyan/teal)
- 📊 Classements (orange/red)
- 🎓 Coaching (pink/purple)

### 4. **Calendrier des Événements**
- Calendrier mensuel avec jours interactifs
- Points dorés sur les jours avec événements
- Activité récente sur le côté

### 5. **Background Effects**
- Orbes flous violet et bleu
- Ambiance "Gaming Platform"

---

## 🔍 Vérifier que tout fonctionne

```bash
# Test 1 : Build
npm run build
# ✅ Doit afficher "Compiled successfully"

# Test 2 : Lint
npm run lint
# ✅ Doit ne rien afficher (pas d'erreurs)

# Test 3 : Dev
npm run dev
# ✅ Doit afficher "Ready in X ms" puis l'URL
```

---

## 🎨 Personnaliser le Design

### Changer les Couleurs

Ouvrez `src/app/globals.css` et modifiez :

```css
:root {
  /* Purple électrique (boutons, liens) */
  --primary: oklch(0.62 0.24 286);

  /* Gold (badges, accents) */
  --accent: oklch(0.75 0.15 85);
}
```

### Variantes Prédéfinies

#### 🟣 Rift Prestige (Purple/Gold intense)
```css
--primary: oklch(0.65 0.28 286);
--accent: oklch(0.80 0.20 85);
```

#### 🔵 Cyber Arena (Cyan/Purple)
```css
--primary: oklch(0.65 0.25 200);
--accent: oklch(0.70 0.25 290);
```

#### 🔷 Classic LoL (Blue/Gold)
```css
--primary: oklch(0.60 0.25 240);
--accent: oklch(0.75 0.15 80);
```

Après modification, **rechargez la page** (Ctrl+Shift+R)

---

## 📂 Structure des Nouveaux Fichiers

```
src/
├── app/
│   ├── globals.css              # ← Thème Electric Rift
│   └── page.tsx                 # ← Dashboard avec nouveaux composants
│
├── components/
│   ├── layout/
│   │   └── Header.tsx           # ← Navigation moderne
│   │
│   └── dashboard/
│       ├── HeroSection.tsx      # ← Hero avec stats
│       ├── QuickActions.tsx     # ← 5 actions rapides
│       └── EventCalendar.tsx    # ← Calendrier + activité

docs/design/
├── DESIGN_SYSTEM.md             # ← Guide complet du design
├── REFONTE_COMPLETE.md          # ← Détails de la refonte
├── RESUME_EXECUTIF.md           # ← Résumé pour CEO
└── QUICK_START.md               # ← Ce fichier
```

---

## 🧪 Tester les Fonctionnalités

### Test 1 : Navigation
- ✅ Cliquez sur "Tournois" dans le header
- ✅ Vérifiez que l'underline s'anime au hover
- ✅ Le lien doit changer de couleur

### Test 2 : Actions Rapides
- ✅ Survolez une card "Quick Actions"
- ✅ Elle doit légèrement s'agrandir (scale)
- ✅ La flèche doit glisser vers la droite
- ✅ Le fond doit s'éclaircir

### Test 3 : Calendrier
- ✅ Cliquez sur un jour
- ✅ Il doit s'agrandir au hover
- ✅ Les jours avec événements ont un point doré
- ✅ Le jour actuel (7) a une bordure violette

### Test 4 : Stats Cards
- ✅ Survolez une stat card
- ✅ Elle doit s'agrandir légèrement
- ✅ La bordure gradient doit être visible

---

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# 1. Vérifiez que le port 8080 est libre
netstat -ano | findstr :8080

# 2. Tuez le processus si nécessaire
taskkill /PID [PID_NUMBER] /F

# 3. Relancez
npm run dev
```

### Les couleurs ne s'appliquent pas

```bash
# 1. Videz le cache Next.js
rm -rf .next

# 2. Redémarrez le serveur
npm run dev

# 3. Videz le cache du navigateur
Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
```

### Les composants ne se chargent pas

```bash
# 1. Vérifiez que tous les fichiers existent
ls src/components/layout/Header.tsx
ls src/components/dashboard/HeroSection.tsx
ls src/components/dashboard/QuickActions.tsx
ls src/components/dashboard/EventCalendar.tsx

# 2. Vérifiez qu'il n'y a pas d'erreurs TypeScript
npm run build
```

### Erreur "Module not found"

```bash
# Réinstallez les dépendances
rm -rf node_modules
npm install
```

---

## 📚 Documentation Complète

- **Guide du Design System** : `docs/design/DESIGN_SYSTEM.md`
- **Détails de la Refonte** : `docs/design/REFONTE_COMPLETE.md`
- **Résumé Exécutif** : `docs/design/RESUME_EXECUTIF.md`

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Connecter l'authentification**
   - Récupérer le vrai user depuis Supabase
   - Afficher le vrai username et role

2. **Connecter les stats**
   - Récupérer les vraies stats depuis la DB
   - Afficher les vrais chiffres

3. **Ajouter les événements**
   - Récupérer les tournois depuis Supabase
   - Les afficher dans le calendrier

4. **Appliquer le design aux autres pages**
   - `/tournaments`
   - `/teams`
   - `/leaderboard`
   - `/coaching`
   - `/profile`

---

## ✅ Checklist de Démarrage

- [ ] Terminal ouvert dans le projet
- [ ] `npm install` exécuté (si première fois)
- [ ] `npm run dev` lancé
- [ ] Navigateur ouvert sur `http://localhost:8080`
- [ ] Design "Electric Rift" visible
- [ ] Header avec logo glow
- [ ] Hero section avec gradient
- [ ] Actions rapides avec hover effects
- [ ] Calendrier avec événements

**Si tous les ✅ sont cochés, c'est parfait ! 🎉**

---

## 🎨 Captures d'écran (À venir)

Une fois le serveur lancé, prenez des screenshots et partagez-les !

---

## 💡 Astuce Pro

Pour voir les changements en temps réel :

1. **Gardez le serveur lancé** (`npm run dev`)
2. **Modifiez un fichier** (par ex. changez une couleur)
3. **Sauvegardez** (Ctrl+S)
4. **La page se recharge automatiquement** ! 🔥

C'est le **Hot Reload** de Next.js, très pratique pour le développement.

---

## 🆘 Besoin d'Aide ?

1. **Consultez la doc** : `docs/design/DESIGN_SYSTEM.md`
2. **Vérifiez les erreurs** : `npm run build`
3. **Vérifiez le linter** : `npm run lint`
4. **Redémarrez le serveur** : Ctrl+C puis `npm run dev`

---

**Bon développement ! ⚡**
**QSPELL Design Electric Rift 2024**
