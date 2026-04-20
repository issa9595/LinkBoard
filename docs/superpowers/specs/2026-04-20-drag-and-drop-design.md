# Drag and Drop — LinkBoard

**Date:** 2026-04-20  
**Status:** Approved

## Objectif

Permettre à l'utilisateur de :
1. Déplacer un lien d'une catégorie à une autre par glisser-déposer
2. Réordonner les liens à l'intérieur d'une catégorie
3. Réordonner les colonnes de catégories

## Bibliothèque

**dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)  
Moderne, légère, compatible React 19, activement maintenue.

## Modèle de données

Ajout d'un champ `order: number` sur `Link` et `Category` dans `lib/types.ts`.

```typescript
type Category = { id, name, color, createdAt, order: number }
type Link     = { id, url, title, description?, categoryId, createdAt, order: number }
```

**Migration des données existantes :** au premier chargement, si `order` est absent, on l'assigne selon l'index dans le tableau localStorage. Transparent, aucune perte de données.

## Architecture des composants

```
DndContext (page.tsx)
  SortableContext (catégories — horizontal)
    CategoryColumn  ← useSortable, poignée = en-tête
      SortableContext (liens de la colonne — vertical)
        LinkItem    ← useSortable, poignée = toute la carte
  DragOverlay       ← fantôme visuel pendant le drag
```

- `page.tsx` est le seul gestionnaire d'état DnD (handlers sur `DndContext`)
- `CategoryColumn` et `LinkItem` reçoivent `attributes`, `listeners`, `setNodeRef`, `transform` via `useSortable`
- Le `DragOverlay` rend une copie de l'élément dragué pour un retour visuel propre

## Identification des items draggables

Pour distinguer liens et catégories dans les handlers DnD :
- Catégories : id préfixé `category-<id>`
- Liens : id préfixé `link-<id>`

## Logique onDragEnd

### Cas 1 — Réordonnement dans une catégorie
Lien déposé sur un autre lien de la **même** catégorie :
- `arrayMove` sur les liens de cette catégorie
- Recalcul des `order` (index dans le nouveau tableau)
- Sauvegarde en localStorage

### Cas 2 — Déplacement entre catégories
Lien déposé sur une **colonne différente** (ou un lien d'une autre colonne) :
- Mise à jour du `categoryId` du lien
- Insertion en fin de liste de la catégorie cible (`order = max + 1`)
- Sauvegarde en localStorage

### Cas 3 — Réordonnement de colonnes
Colonne déposée sur une autre colonne :
- `arrayMove` sur les catégories
- Recalcul des `order`
- Sauvegarde en localStorage

## Gestion du onDragOver

Pour le Cas 2, `onDragOver` met à jour l'état de façon optimiste : le lien apparaît dans la catégorie cible pendant le drag (avant `onDragEnd`). Cela donne un retour visuel immédiat.

## Styles

- L'item dragué est rendu semi-transparent (`opacity: 0.4`) dans sa position d'origine
- Le `DragOverlay` affiche une copie avec une légère ombre portée (`shadow-lg`)
- Pas de changement de layout pendant le drag (pas de redimensionnement des colonnes)

## Persistance

Tout est sauvegardé via les hooks `useLocalStorage` existants. Aucune nouvelle couche de persistance nécessaire.

## Ce qui ne change pas

- Les modals (AddLink, EditCategory, etc.) — inchangées
- La logique d'ajout/suppression de liens et catégories — inchangée
- Le layout général (grille CSS) — inchangé
