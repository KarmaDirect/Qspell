# 🎨 Design System QSPELL - Electric Rift

## 📋 Vue d'ensemble

Le design **"Electric Rift"** de QSPELL est basé sur une palette dark moderne avec des accents purple/gold inspirés de League of Legends.

---

## 🎨 Palette de Couleurs

### Couleurs Principales

| Couleur | OKLCH | Usage |
|---------|-------|-------|
| **Background** | `oklch(0.12 0 0)` | Fond principal (noir profond) |
| **Card** | `oklch(0.17 0 0)` | Cartes et surfaces élevées |
| **Primary** | `oklch(0.62 0.24 286)` | Purple électrique (actions principales) |
| **Accent** | `oklch(0.75 0.15 85)` | Gold (éléments importants) |
| **Success** | `oklch(0.65 0.20 145)` | Vert (succès, gains) |
| **Foreground** | `oklch(0.98 0 0)` | Texte principal (blanc) |
| **Muted** | `oklch(0.64 0 0)` | Texte secondaire (gris) |

### Exemples d'utilisation

```tsx
// Texte principal
<p className="text-foreground">Texte principal</p>

// Texte secondaire
<p className="text-muted-foreground">Texte secondaire</p>

// Bouton principal (purple)
<Button>Action principale</Button>

// Badge gold
<Badge className="gradient-gold">Admin</Badge>
```

---

## 🌟 Classes Utilitaires Personnalisées

### Gradients

```css
.gradient-hero        /* Purple → Blue (hero sections) */
.gradient-card        /* Purple transparent (cards hover) */
.gradient-gold        /* Gold gradient (badges) */
```

**Exemples :**

```tsx
// Hero section avec gradient purple/blue
<div className="gradient-hero">...</div>

// Badge admin avec gradient gold
<Badge className="gradient-gold glow-gold">Admin CEO</Badge>
```

### Effets Glow

```css
.glow-purple          /* Glow violet (icônes, badges) */
.glow-gold            /* Glow doré (éléments importants) */
.glow-pulse           /* Glow animé (notifications) */
```

**Exemples :**

```tsx
// Logo avec glow purple
<Zap className="h-6 w-6 text-primary glow-purple" />

// Badge admin avec glow gold
<Badge className="gradient-gold glow-gold">Admin</Badge>

// Notification avec pulse
<div className="glow-pulse">Nouveau message</div>
```

### Glass Effect

```css
.glass                /* Effet verre dépoli (navbar, cards) */
```

**Exemple :**

```tsx
// Header avec effet glass
<header className="glass border-b border-border/40">...</header>
```

### Bordures Animées

```css
.border-animated      /* Bordure gradient animée (cards importantes) */
```

**Exemple :**

```tsx
// Stat card avec bordure animée
<div className="border-animated rounded-lg p-4">...</div>
```

---

## 🧩 Composants Principaux

### 1. Header (`src/components/layout/Header.tsx`)

**Caractéristiques :**
- ✅ Sticky top avec effet glass
- ✅ Logo avec glow purple
- ✅ Navigation avec underline animée au hover
- ✅ Badge admin gold avec glow

**Personnalisation :**

```tsx
// Changer la couleur du badge admin
<Badge className="gradient-gold glow-gold">
  <Shield className="h-3 w-3 mr-1" />
  Admin CEO
</Badge>

// Ajouter un lien dans la navigation
<NavLink href="/nouvelle-page" icon={Star}>
  Nouvelle Page
</NavLink>
```

### 2. HeroSection (`src/components/dashboard/HeroSection.tsx`)

**Caractéristiques :**
- ✅ Gradient animé purple/blue
- ✅ Orbes flous en arrière-plan
- ✅ Avatar avec bordure glow
- ✅ 4 stats cards avec hover scale

**Personnalisation :**

```tsx
// Ajouter une nouvelle stat
<StatCard 
  icon={Star} 
  label="Niveau" 
  value="42" 
  trend="+2"
/>

// Changer le message de bienvenue
<h1 className="text-4xl font-bold text-white">
  Salut {username}, prêt à dominer ?
</h1>
```

### 3. QuickActions (`src/components/dashboard/QuickActions.tsx`)

**Caractéristiques :**
- ✅ Cards avec gradient hover
- ✅ Icônes avec fond gradient
- ✅ Flèche animée au hover
- ✅ Responsive grid

**Personnalisation :**

```tsx
// Ajouter une nouvelle action
{
  icon: Settings,
  title: 'Paramètres',
  description: 'Configurer votre compte',
  gradient: 'from-gray-600 to-slate-600',
  href: '/settings'
}
```

### 4. EventCalendar (`src/components/dashboard/EventCalendar.tsx`)

**Caractéristiques :**
- ✅ Calendrier interactif
- ✅ Jours avec événements (point doré)
- ✅ Activité récente avec icônes colorées
- ✅ Glass effect

**Personnalisation :**

```tsx
// Ajouter une activité
<ActivityItem
  icon={Trophy}
  title="Tournoi gagné"
  time="Aujourd'hui"
  status="victory"  // 'victory' | 'info' | 'success'
/>
```

---

## 🔧 Modifier le Thème

### Changer les Couleurs Principales

Éditez `src/app/globals.css` :

```css
:root {
  /* Exemple : Changer le purple en cyan */
  --primary: oklch(0.65 0.25 200);  /* Cyan au lieu de Purple */
  
  /* Exemple : Changer le gold en rouge */
  --accent: oklch(0.65 0.25 25);     /* Rouge au lieu de Gold */
}
```

### Variantes de Couleurs Prédéfinies

#### Variante "Rift Prestige" (Purple/Gold intense)

```css
--primary: oklch(0.65 0.28 286);    /* Purple plus intense */
--accent: oklch(0.80 0.20 85);      /* Gold plus brillant */
```

#### Variante "Cyber Arena" (Cyan/Purple futuriste)

```css
--primary: oklch(0.65 0.25 200);    /* Cyan */
--accent: oklch(0.70 0.25 290);     /* Purple accent */
```

#### Variante "Classic LoL" (Blue/Gold officiel)

```css
--primary: oklch(0.60 0.25 240);    /* Blue LoL */
--accent: oklch(0.75 0.15 80);      /* Gold LoL */
```

---

## 📱 Responsive Design

Tous les composants sont responsive par défaut avec Tailwind :

```tsx
// Mobile → Tablette → Desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Breakpoints Tailwind :**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎭 Animations

### Hover Effects

```tsx
// Scale au hover
<div className="hover:scale-105 transition-transform">

// Translate au hover
<ArrowRight className="group-hover:translate-x-1 transition-all" />

// Opacity au hover
<div className="opacity-0 group-hover:opacity-10 transition-opacity">
```

### Animations Personnalisées

```css
/* Dans globals.css */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px oklch(0.62 0.24 286 / 0.3);
  }
  50% {
    box-shadow: 0 0 40px oklch(0.62 0.24 286 / 0.5);
  }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

---

## 🚀 Exemples Complets

### Card avec tous les effets

```tsx
<div className="glass rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 border-animated glow-purple">
  <h3 className="text-lg font-bold mb-2">Titre</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Bouton avec gradient et glow

```tsx
<Button className="gradient-hero glow-purple">
  <Zap className="h-4 w-4 mr-2" />
  Action Spéciale
</Button>
```

### Badge Admin personnalisé

```tsx
<Badge className="gradient-gold glow-gold animate-pulse">
  <Crown className="h-3 w-3 mr-1" />
  VIP Gold
</Badge>
```

---

## 📦 Structure des Fichiers

```
src/
├── app/
│   ├── globals.css              # ← Thème et couleurs
│   └── page.tsx                 # ← Page dashboard
├── components/
│   ├── layout/
│   │   └── Header.tsx           # ← Navigation
│   └── dashboard/
│       ├── HeroSection.tsx      # ← Section hero
│       ├── QuickActions.tsx     # ← Actions rapides
│       └── EventCalendar.tsx    # ← Calendrier
```

---

## 🐛 Troubleshooting

### Les couleurs ne s'appliquent pas

1. Vérifiez que `globals.css` est bien importé dans `layout.tsx`
2. Redémarrez le serveur : `npm run dev`
3. Videz le cache du navigateur

### Les animations ne fonctionnent pas

1. Vérifiez que `tw-animate-css` est installé : `npm install tw-animate-css`
2. Vérifiez l'import dans `globals.css` : `@import "tw-animate-css";`

### Les gradients ne s'affichent pas

Utilisez `bg-linear-to-*` (Tailwind v4) au lieu de `bg-gradient-to-*` :

```tsx
❌ <div className="bg-gradient-to-r from-purple-600 to-blue-600">
✅ <div className="bg-linear-to-r from-purple-600 to-blue-600">
```

---

## 📚 Ressources

- **Tailwind CSS v4** : https://tailwindcss.com
- **OKLCH Colors** : https://oklch.com
- **Lucide Icons** : https://lucide.dev
- **Radix UI** : https://radix-ui.com

---

## 🎯 Prochaines Étapes

1. **Intégrer l'authentification** : Récupérer le vrai user depuis Supabase
2. **Connecter les stats** : Afficher les vraies stats depuis la DB
3. **Ajouter les événements** : Récupérer les vrais événements du calendrier
4. **Créer les autres pages** : Appliquer le design aux pages tournaments, teams, etc.

---

**Design par Cursor AI** | **Palette Electric Rift** | **QSPELL 2024** ⚡
