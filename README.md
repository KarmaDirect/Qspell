# QSPELL - Plateforme Esport League of Legends

![QSPELL](https://img.shields.io/badge/QSPELL-v2.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 🎮 Description

QSPELL est une plateforme esport française dédiée à League of Legends. Elle permet aux joueurs de créer des équipes, lier leurs comptes Riot Games et participer à la vie de la communauté.

## ✨ Fonctionnalités

### 👥 Gestion d'équipes
- Créer et gérer votre équipe
- Inviter des membres
- Définir un tag et une région
- Gérer les rôles (Capitaine, Membre)

### 🎮 Intégration Riot Games
- Lier plusieurs comptes LoL
- Synchronisation automatique des stats
- Affichage du rang et des performances

### 📅 Calendrier d'événements
- Événements publics de la communauté
- Filtrage par type d'événement
- Notifications

### 🛡️ Espace Admin
- Gestion des utilisateurs et rôles
- Gestion du calendrier
- Statistiques de la plateforme

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Compte Supabase
- Clé API Riot Games

### Installation

```bash
# Cloner le repo
git clone https://github.com/your-repo/qspell.git
cd qspell

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer le serveur de dev
npm run dev
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RIOT_API_KEY=your_riot_api_key
```

## 📁 Structure du projet

```
src/
├── app/
│   ├── (auth)/          # Pages d'authentification
│   ├── (dashboard)/     # Dashboard utilisateur
│   │   └── dashboard/
│   │       ├── admin/   # Espace admin
│   │       ├── calendar/# Calendrier
│   │       ├── profile/ # Profil utilisateur
│   │       └── teams/   # Équipes
│   └── api/             # Routes API
├── components/
│   ├── admin/           # Composants admin
│   ├── auth/            # Composants auth
│   ├── calendar/        # Calendrier
│   ├── profile/         # Profil
│   ├── teams/           # Équipes
│   └── ui/              # Composants UI
└── lib/
    ├── auth/            # Gestion des rôles
    ├── riot-api/        # Client Riot API
    └── supabase/        # Clients Supabase
```

## 🎨 Design System

- **Couleur primaire**: Purple (#9333EA)
- **Accent**: Gold/Orange
- **Background**: Dark (#0a0a0a)
- **UI Framework**: shadcn/ui + Tailwind CSS

## 🔐 Rôles utilisateur

| Rôle | Description |
|------|-------------|
| `user` | Utilisateur standard |
| `admin` | Administrateur |
| `ceo` | Super administrateur |

## 📝 Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter
```

## 🛠️ Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **API externe**: Riot Games API
- **State**: Zustand, React Query

## 📄 Licence

Tous droits réservés © 2024 QSPELL

---

*QSPELL n'est pas affilié à Riot Games. League of Legends et Riot Games sont des marques déposées de Riot Games, Inc.*
