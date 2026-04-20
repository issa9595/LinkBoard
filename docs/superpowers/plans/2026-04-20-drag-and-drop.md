# Drag and Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le glisser-déposer pour réordonner les liens dans une catégorie, déplacer des liens entre catégories, et réordonner les colonnes de catégories.

**Architecture:** Un `DndContext` global dans `page.tsx` orchestre tout via `onDragStart`/`onDragOver`/`onDragEnd`. Chaque `CategoryColumn` est un item sortable + une zone droppable pour les liens. Chaque `LinkItem` est un item sortable. L'ordre est persisté via un champ `order: number` sur `Link` et `Category`.

**Tech Stack:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, React 19, Next.js, TypeScript, localStorage.

---

## File Map

| Fichier | Action | Rôle |
|---|---|---|
| `lib/types.ts` | Modifier | Ajouter `order: number` à `Category` et `Link` |
| `app/page.tsx` | Modifier | Migration, handlers DnD, DndContext, DragOverlay, sortedCategories |
| `components/CategoryColumn.tsx` | Modifier | useSortable (colonne) + useDroppable (zone liens) |
| `components/LinkItem.tsx` | Modifier | useSortable (lien) |

---

## Task 1: Installer les dépendances dnd-kit

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Installer les packages**

```bash
cd /Users/madayev/Dev/LinkBoard
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected output: `added 3 packages` (ou similaire, pas d'erreur)

- [ ] **Step 2: Vérifier l'installation**

```bash
node -e "require('@dnd-kit/core'); require('@dnd-kit/sortable'); require('@dnd-kit/utilities'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit/core, sortable, utilities"
```

---

## Task 2: Mettre à jour les types

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Ajouter `order` aux deux types**

Remplacer le contenu de `lib/types.ts` par :

```typescript
export type Category = {
  id: string
  name: string
  color: string // hex de la palette Atlassian
  createdAt: number
  order: number
}

export type Link = {
  id: string
  url: string
  title: string
  description?: string
  categoryId: string
  createdAt: number
  order: number
}
```

- [ ] **Step 2: Vérifier que TypeScript compile**

```bash
cd /Users/madayev/Dev/LinkBoard
npx tsc --noEmit 2>&1 | head -30
```

Expected: erreurs sur `handleAddCategory` et `handleAddLink` dans `page.tsx` car ils ne fournissent pas encore `order`. C'est attendu — on les corrige à la tâche suivante.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add order field to Category and Link types"
```

---

## Task 3: Migration des données + handlers mis à jour + tri

**Files:**
- Modify: `app/page.tsx`

Cette tâche fait 3 choses atomiquement liées : migrer les données existantes sans `order`, mettre à jour les handlers de création, et trier avant le rendu.

- [ ] **Step 1: Renommer les hooks localStorage et ajouter la migration**

Remplacer les lignes 21-22 de `app/page.tsx` :

```typescript
const [categories, setCategories] = useLocalStorage<Category[]>('linkboard:categories', [])
const [links, setLinks] = useLocalStorage<Link[]>('linkboard:links', [])
```

par :

```typescript
const [categories, setCategories] = useLocalStorage<Category[]>('linkboard:categories', [])
const [links, setLinks] = useLocalStorage<Link[]>('linkboard:links', [])

// Migration : assigner order si absent (données existantes sans order)
useEffect(() => {
  if (categories.some(c => c.order === undefined)) {
    setCategories(prev => prev.map((c, i) => ({ ...c, order: c.order ?? i })))
  }
  if (links.some(l => l.order === undefined)) {
    setLinks(prev => prev.map((l, i) => ({ ...l, order: l.order ?? i })))
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

Et ajouter `useEffect` aux imports React ligne 3 :

```typescript
import { useState, useCallback, useEffect } from 'react'
```

- [ ] **Step 2: Mettre à jour `handleAddCategory` pour inclure `order`**

Remplacer le handler `handleAddCategory` (lignes 33-36) :

```typescript
const handleAddCategory = useCallback((name: string, color: string) => {
  const newCat: Category = { id: uid(), name, color, createdAt: Date.now(), order: categories.length }
  setCategories((prev) => [...prev, newCat])
}, [setCategories, categories.length])
```

- [ ] **Step 3: Mettre à jour `handleAddLink` pour inclure `order`**

Remplacer le handler `handleAddLink` (lignes 54-57) :

```typescript
const handleAddLink = useCallback((url: string, title: string, description: string, categoryId: string) => {
  const linksInCat = links.filter(l => l.categoryId === categoryId).length
  const newLink: Link = { id: uid(), url, title, description, categoryId, createdAt: Date.now(), order: linksInCat }
  setLinks((prev) => [...prev, newLink])
}, [setLinks, links])
```

- [ ] **Step 4: Trier les catégories et les liens par `order` avant le rendu**

Remplacer le bloc `linksByCategory` (lignes 70-77) par :

```typescript
// Catégories triées par order
const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

// Liens par catégorie, triés par order
const linksByCategory = new Map<string, Link[]>()
for (const cat of sortedCategories) {
  linksByCategory.set(cat.id, [])
}
for (const link of links) {
  const arr = linksByCategory.get(link.categoryId)
  if (arr) arr.push(link)
}
for (const arr of linksByCategory.values()) {
  arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
```

- [ ] **Step 5: Remplacer `categories` par `sortedCategories` dans le JSX**

Dans le `.map()` du rendu (ligne ~141), remplacer `categories.map` par `sortedCategories.map` :

```typescript
{sortedCategories.map((cat, index) => (
  <CategoryColumn
    key={cat.id}
    category={cat}
    links={linksByCategory.get(cat.id) ?? []}
    animationDelay={index * 50}
    onAddLink={openAddLink}
    onDeleteLink={handleDeleteLink}
    onRename={setEditCategory}
    onDelete={setDeleteCategory}
  />
))}
```

Aussi remplacer `categories.length === 0` par `sortedCategories.length === 0` dans la condition du EmptyState.

- [ ] **Step 6: Vérifier que TypeScript compile sans erreur**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erreurs.

- [ ] **Step 7: Démarrer le dev server et tester manuellement**

```bash
npm run dev
```

Ouvrir http://localhost:3000. Vérifier que les catégories et liens existants s'affichent correctement. Créer une nouvelle catégorie et un nouveau lien — ils doivent apparaître normalement.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add order migration, update creation handlers, sort by order"
```

---

## Task 4: Ajouter le DndContext et les handlers dans page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Ajouter les imports dnd-kit en haut de `page.tsx`**

Après les imports existants (avant `import type { Category, Link }`), ajouter :

```typescript
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
```

- [ ] **Step 2: Ajouter l'état et les senseurs DnD dans `HomePage`**

Après les useState existants (après ligne `const [defaultCategoryId, ...]`), ajouter :

```typescript
// DnD state
const [activeDragId, setActiveDragId] = useState<string | null>(null)

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
)
```

- [ ] **Step 3: Ajouter les trois handlers DnD**

Après `openAddLink` (après la ligne `}, [])`) et avant le bloc `sortedCategories`, ajouter :

```typescript
// --- Handlers DnD ---

function handleDragStart({ active }: DragStartEvent) {
  setActiveDragId(active.id as string)
}

function handleDragOver({ active, over }: DragOverEvent) {
  if (!over) return
  const activeStr = active.id as string
  const overStr = over.id as string

  if (!activeStr.startsWith('link-')) return

  const activeLinkId = activeStr.replace('link-', '')
  const activeLink = links.find(l => l.id === activeLinkId)
  if (!activeLink) return

  let targetCatId: string | null = null
  if (overStr.startsWith('category-')) {
    targetCatId = overStr.replace('category-', '')
  } else if (overStr.startsWith('link-')) {
    const overLink = links.find(l => l.id === overStr.replace('link-', ''))
    targetCatId = overLink?.categoryId ?? null
  }

  if (!targetCatId || targetCatId === activeLink.categoryId) return

  const linksInTarget = links.filter(l => l.categoryId === targetCatId)
  setLinks(prev =>
    prev.map(l =>
      l.id === activeLinkId ? { ...l, categoryId: targetCatId!, order: linksInTarget.length } : l
    )
  )
}

function handleDragEnd({ active, over }: DragEndEvent) {
  setActiveDragId(null)
  if (!over || active.id === over.id) return

  const activeStr = active.id as string
  const overStr = over.id as string

  // Réordonner les catégories
  if (activeStr.startsWith('category-') && overStr.startsWith('category-')) {
    const activeCatId = activeStr.replace('category-', '')
    const overCatId = overStr.replace('category-', '')
    setCategories(prev => {
      const sorted = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const oldIndex = sorted.findIndex(c => c.id === activeCatId)
      const newIndex = sorted.findIndex(c => c.id === overCatId)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(sorted, oldIndex, newIndex).map((cat, i) => ({ ...cat, order: i }))
    })
    return
  }

  // Réordonner les liens dans la même catégorie (onDragOver a déjà géré le cross-category)
  if (activeStr.startsWith('link-') && overStr.startsWith('link-')) {
    const activeLinkId = activeStr.replace('link-', '')
    const overLinkId = overStr.replace('link-', '')
    setLinks(prev => {
      const activeLink = prev.find(l => l.id === activeLinkId)
      const overLink = prev.find(l => l.id === overLinkId)
      if (!activeLink || !overLink || activeLink.categoryId !== overLink.categoryId) return prev
      const catLinks = [...prev.filter(l => l.categoryId === activeLink.categoryId)]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const oldIndex = catLinks.findIndex(l => l.id === activeLinkId)
      const newIndex = catLinks.findIndex(l => l.id === overLinkId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const reordered = arrayMove(catLinks, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }))
      return prev.map(l => reordered.find(r => r.id === l.id) ?? l)
    })
  }
}
```

- [ ] **Step 4: Envelopper le rendu principal avec `DndContext` + `SortableContext` pour les catégories**

Dans le JSX, remplacer la `<div className="grid ...">` et son contenu par :

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={sortedCategories.map(c => `category-${c.id}`)}
    strategy={horizontalListSortingStrategy}
  >
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {sortedCategories.map((cat, index) => (
        <CategoryColumn
          key={cat.id}
          category={cat}
          links={linksByCategory.get(cat.id) ?? []}
          animationDelay={index * 50}
          onAddLink={openAddLink}
          onDeleteLink={handleDeleteLink}
          onRename={setEditCategory}
          onDelete={setDeleteCategory}
        />
      ))}
    </div>
  </SortableContext>

  <DragOverlay>
    {activeDragId?.startsWith('category-') && (() => {
      const cat = sortedCategories.find(c => `category-${c.id}` === activeDragId)
      if (!cat) return null
      return (
        <div
          className="rounded-lg overflow-hidden shadow-xl opacity-90"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${cat.color}`,
            minHeight: '80px',
            width: '280px',
          }}
        >
          <div className="px-4 py-3">
            <span
              className="text-xs font-semibold"
              style={{ color: cat.color }}
            >
              {cat.name}
            </span>
          </div>
        </div>
      )
    })()}
    {activeDragId?.startsWith('link-') && (() => {
      const link = links.find(l => `link-${l.id}` === activeDragId)
      if (!link) return null
      const cat = categories.find(c => c.id === link.categoryId)
      return (
        <div
          className="flex items-start gap-3 p-3 rounded-md shadow-xl"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${cat?.color ?? 'var(--color-border)'}`,
            width: '260px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=16`}
            alt=""
            width={16}
            height={16}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {link.title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {link.url}
            </p>
          </div>
        </div>
      )
    })()}
  </DragOverlay>
</DndContext>
```

- [ ] **Step 5: Vérifier que TypeScript compile**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 erreurs.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add DndContext, sortable categories, drag handlers and DragOverlay"
```

---

## Task 5: Rendre CategoryColumn sortable et droppable

**Files:**
- Modify: `components/CategoryColumn.tsx`

- [ ] **Step 1: Ajouter les imports dnd-kit**

En haut de `components/CategoryColumn.tsx`, après les imports existants, ajouter :

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
```

- [ ] **Step 2: Mettre à jour l'interface `CategoryColumnProps`**

Aucun changement d'interface — `category.id` suffit pour dériver l'id DnD.

- [ ] **Step 3: Ajouter `useSortable` et `useDroppable` dans le composant**

Au début de la fonction `CategoryColumn`, après `const [menuOpen, setMenuOpen] = useState(false)`, ajouter :

```typescript
// Sortable pour la colonne elle-même
const {
  attributes,
  listeners,
  setNodeRef: setSortableRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: `category-${category.id}` })

// Droppable pour la zone des liens (permet le drop sur colonne vide)
const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `category-${category.id}` })

const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
}
```

- [ ] **Step 4: Appliquer le ref sortable sur la div racine et le drag handle sur l'en-tête**

Remplacer la div racine :

```tsx
<div
  ref={setSortableRef}
  style={{
    ...style,
    animationDelay: `${animationDelay}ms`,
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderLeft: `3px solid ${category.color}`,
    minHeight: '200px',
  }}
  className="column-enter flex flex-col rounded-lg overflow-hidden"
>
```

Remplacer la div header (la `<div className="flex items-center justify-between px-4 py-3 gap-2"`) par :

```tsx
<div
  className="flex items-center justify-between px-4 py-3 gap-2 cursor-grab active:cursor-grabbing"
  style={{ borderBottom: '1px solid var(--color-border)' }}
  {...attributes}
  {...listeners}
>
```

**Important :** le bouton `MoreHorizontal` (menu contextuel) est à l'intérieur de cet en-tête draggable. Il faut lui ajouter `onPointerDown={(e) => e.stopPropagation()}` pour que cliquer dessus n'enclenche pas le drag. Remplacer la div `className="relative shrink-0"` qui contient le menu par :

```tsx
<div className="relative shrink-0" onPointerDown={(e) => e.stopPropagation()}>
```

- [ ] **Step 5: Envelopper la liste des liens avec `SortableContext` + `useDroppable` ref**

Remplacer la div du corps `<div className="flex-1 flex flex-col p-2 gap-0.5">` par :

```tsx
<SortableContext
  items={(links ?? []).map(l => `link-${l.id}`)}
  strategy={verticalListSortingStrategy}
>
  <div
    ref={setDropRef}
    className="flex-1 flex flex-col p-2 gap-0.5"
    style={{
      minHeight: '60px',
      outline: isOver ? `2px dashed ${category.color}` : 'none',
      borderRadius: '6px',
      transition: 'outline 0.1s ease',
    }}
  >
    {links.length === 0 ? (
      <div className="flex flex-col items-center justify-center flex-1 py-6 gap-2">
        <p
          className="text-xs text-center"
          style={{
            color: 'var(--color-text-secondary)',
            border: `1px dashed var(--color-border)`,
            borderRadius: '6px',
            padding: '12px 16px',
            width: '100%',
          }}
        >
          Aucun lien dans cette catégorie
        </p>
        <button
          className="text-xs transition-colors"
          style={{ color: 'var(--color-blue-light)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-blue-light)')}
          onClick={() => onAddLink(category.id)}
        >
          + Ajouter un lien
        </button>
      </div>
    ) : (
      links.map((link) => (
        <LinkItem
          key={link.id}
          link={link}
          categoryColor={category.color}
          onDelete={onDeleteLink}
        />
      ))
    )}
  </div>
</SortableContext>
```

- [ ] **Step 6: Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 erreurs.

- [ ] **Step 7: Commit**

```bash
git add components/CategoryColumn.tsx
git commit -m "feat: make CategoryColumn sortable and droppable for DnD"
```

---

## Task 6: Rendre LinkItem sortable

**Files:**
- Modify: `components/LinkItem.tsx`

- [ ] **Step 1: Ajouter les imports dnd-kit**

En haut de `components/LinkItem.tsx`, après les imports existants, ajouter :

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
```

- [ ] **Step 2: Ajouter `useSortable` dans le composant**

Au début de la fonction `LinkItem`, après `const [hovered, setHovered] = useState(false)`, ajouter :

```typescript
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: `link-${link.id}` })

const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
  cursor: isDragging ? 'grabbing' : 'grab',
}
```

- [ ] **Step 3: Appliquer les props sortable sur la div racine**

Remplacer la div racine de `LinkItem` :

```tsx
<div
  ref={setNodeRef}
  style={{
    ...style,
    backgroundColor: hovered ? 'var(--color-surface)' : 'transparent',
    borderLeft: `3px solid ${hovered ? categoryColor : 'transparent'}`,
  }}
  className="relative flex items-start gap-3 p-3 rounded-md transition-all duration-150"
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  {...attributes}
  {...listeners}
>
```

- [ ] **Step 4: Protéger les actions cliquables contre le drag**

Les boutons et liens (Ouvrir, Supprimer) doivent arrêter la propagation pour ne pas déclencher le drag. Ajouter `onPointerDown={(e) => e.stopPropagation()}` sur la div des actions :

```tsx
<div
  className="flex items-center gap-1 flex-shrink-0 transition-opacity duration-150"
  style={{ opacity: hovered ? 1 : 0 }}
  onPointerDown={(e) => e.stopPropagation()}
>
```

- [ ] **Step 5: Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 erreurs.

- [ ] **Step 6: Commit**

```bash
git add components/LinkItem.tsx
git commit -m "feat: make LinkItem sortable for DnD"
```

---

## Task 7: Vérification manuelle complète

**Files:** aucun fichier modifié — vérification uniquement.

- [ ] **Step 1: Lancer le dev server**

```bash
npm run dev
```

- [ ] **Step 2: Tester les 3 interactions**

Ouvrir http://localhost:3000 et vérifier :

1. **Réordonner des liens dans une catégorie** — glisser un lien vers le haut ou le bas dans la même colonne. L'ordre doit être persisté après rechargement de page.

2. **Déplacer un lien entre catégories** — glisser un lien vers une autre colonne (avec des liens OU vide). Le lien doit apparaître dans la nouvelle catégorie. Persisté après rechargement.

3. **Réordonner les colonnes** — glisser une colonne par son en-tête (le titre/badge). Les colonnes changent d'ordre. Persisté après rechargement.

- [ ] **Step 3: Tester les cas limites**

- Drag annulé (Escape ou drop hors zone) → état inchangé
- Colonne avec 1 seul lien → drag fonctionne
- Colonne vide → peut recevoir un lien (outline dashed visible au hover)
- Actions hover (ouvrir, supprimer) toujours cliquables sans déclencher le drag

- [ ] **Step 4: Vérifier le build de production**

```bash
npm run build
```

Expected: build sans erreur.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: drag-and-drop complet — liens et catégories réordonnables"
```
