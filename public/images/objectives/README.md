# Images des Objectifs League of Legends

Ce dossier contient les icônes des objectifs du jeu.

## 📋 Fichiers requis

Placez les images suivantes dans ce dossier :

### ✅ Prioritaire
- **`baron.png`** - Icône du Baron Nashor (purple, tête de monstre avec cornes)
  - **Format** : PNG avec transparence
  - **Taille recommandée** : 24x24px à 32x32px
  - **Couleur** : Purple (#8A2BE2 ou similaire)

### 📦 Optionnels (fallback sur emoji)
- **`dragon.png`** - Icône du Dragon (fallback: 🐉)
- **`elder.png`** - Icône de l'Elder Dragon (fallback: 🔥)
- **`tower.png`** - Icône des Tours (fallback: 🗼)
- **`inhibitor.png`** - Icône des Inhibiteurs (fallback: ⚡)

## 🎨 Format recommandé

- **Taille** : 24x24px à 32x32px
- **Format** : PNG avec transparence
- **Style** : Flat design, couleur unie ou dégradé simple
- **Fond** : Transparent

## 🔄 Fallback automatique

Si une image n'est pas trouvée, le composant `ObjectiveIcon` utilisera automatiquement un emoji comme fallback. Aucune action requise de votre part !

## 📍 Emplacement

Placez votre image `baron.png` directement dans ce dossier :
```
public/images/objectives/baron.png
```

## ✅ Utilisation

Les images sont automatiquement chargées par le composant `ObjectiveIcon` dans :
- `src/components/match/MatchResultCompact.tsx`
- `src/components/match/MatchResultUltraCompact.tsx`

Une fois l'image placée, elle apparaîtra automatiquement dans l'interface !

