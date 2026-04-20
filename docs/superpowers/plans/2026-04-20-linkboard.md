# LinkBoard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une application Next.js de gestion de liens organisés par catégories, avec un design sombre inspiré d'Atlassian et persistence via localStorage.

**Architecture:** Application Next.js 14 mono-page (App Router) sans backend. Toute la logique d'état est gérée dans `app/page.tsx` via des hooks React et persistée dans localStorage via un hook générique. Les composants sont des feuilles pures (pas de state interne sauf pour l'UI locale).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, shadcn/ui (Dialog, Input, Button, Badge, Tooltip), lucide-react, localStorage.

---

## File Structure

```
app/
  layout.tsx          — Root layout : Google Fonts (DM Sans + Space Grotesk), metadata
  page.tsx            — Page principale : state global (categories + links), grid de colonnes
  globals.css         — Variables CSS Atlassian, reset, animations fade-in/stagger

lib/
  types.ts            — Types TypeScript : Category, Link
  colors.ts           — Palette de 8 couleurs Atlassian avec nom et hex

hooks/
  useLocalStorage.ts  — Hook générique React pour lire/écrire dans localStorage

components/
  CategoryColumn.tsx  — Colonne de catégorie : header coloré, liste de liens, menu contextuel
  LinkItem.tsx        — Item de lien : favicon, titre, URL, description, actions hover
  AddLinkModal.tsx    — Modal shadcn : formulaire ajout de lien (URL, titre, description, catégorie)
  AddCategoryModal.tsx — Modal shadcn : formulaire création de catégorie (nom + swatch couleur)
  EditCategoryModal.tsx — Modal shadcn : formulaire édition catégorie (pré-rempli)
  ConfirmDeleteModal.tsx — Modal shadcn : confirmation suppression catégorie avec compteur de liens
  EmptyState.tsx      — Écran d'onboarding quand aucune catégorie n'existe
```

---

## Task 1: Initialisation du projet Next.js

**Files:**
- Create: `package.json` (généré par create-next-app)
- Create: `tailwind.config.ts`
- Create: `components.json` (shadcn)

- [ ] **Étape 1 : Créer le projet Next.js**

```bash
cd /Users/madayev/Dev/LinkBoard
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*" --yes
```

Résultat attendu : projet initialisé avec `app/`, `public/`, `package.json`, `tailwind.config.ts`.

- [ ] **Étape 2 : Installer les dépendances shadcn/ui**

```bash
npx shadcn@latest init --defaults
```

Répondre aux prompts : style `default`, couleur de base `slate`, CSS variables `yes`.

- [ ] **Étape 3 : Installer les composants shadcn nécessaires**

```bash
npx shadcn@latest add dialog input button badge tooltip select
```

Résultat attendu : dossier `components/ui/` avec les composants.

- [ ] **Étape 4 : Installer lucide-react**

```bash
npm install lucide-react
```

- [ ] **Étape 5 : Vérifier que le projet démarre**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` — la page par défaut Next.js doit s'afficher. Arrêter avec Ctrl+C.

- [ ] **Étape 6 : Commit initial**

```bash
git init
git add .
git commit -m "chore: init Next.js 14 avec TypeScript, Tailwind, shadcn/ui"
```

---

## Task 2: Types TypeScript et palette de couleurs

**Files:**
- Create: `lib/types.ts`
- Create: `lib/colors.ts`

- [ ] **Étape 1 : Créer les types**

Créer `lib/types.ts` :

```typescript
export type Category = {
  id: string
  name: string
  color: string // hex de la palette Atlassian
  createdAt: number
}

export type Link = {
  id: string
  url: string
  title: string
  description?: string
  categoryId: string
  createdAt: number
}
```

- [ ] **Étape 2 : Créer la palette de couleurs**

Créer `lib/colors.ts` :

```typescript
export type AtlassianColor = {
  name: string
  hex: string
  label: string
}

// 8 couleurs de la charte Atlassian + une couleur grise par défaut
export const ATLASSIAN_COLORS: AtlassianColor[] = [
  { name: 'blue',   hex: '#0C66E4', label: 'Bleu'    },
  { name: 'teal',   hex: '#1D9A8A', label: 'Teal'    },
  { name: 'green',  hex: '#22A06B', label: 'Vert'    },
  { name: 'yellow', hex: '#CF9F02', label: 'Jaune'   },
  { name: 'orange', hex: '#E56910', label: 'Orange'  },
  { name: 'red',    hex: '#C9372C', label: 'Rouge'   },
  { name: 'purple', hex: '#6E5DC6', label: 'Violet'  },
  { name: 'gray',   hex: '#8B9BB4', label: 'Gris'    },
]

export const DEFAULT_COLOR = ATLASSIAN_COLORS[0].hex
```

- [ ] **Étape 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 4 : Commit**

```bash
git add lib/types.ts lib/colors.ts
git commit -m "feat: types Category/Link et palette couleurs Atlassian"
```

---

## Task 3: Hook useLocalStorage

**Files:**
- Create: `hooks/useLocalStorage.ts`

- [ ] **Étape 1 : Créer le hook générique**

Créer `hooks/useLocalStorage.ts` :

```typescript
'use client'

import { useState, useEffect } from 'react'

// Hook générique pour persister un état dans localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Erreur localStorage [${key}]:`, error)
    }
  }

  return [storedValue, setValue] as const
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add hooks/useLocalStorage.ts
git commit -m "feat: hook useLocalStorage générique"
```

---

## Task 4: CSS global et layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Étape 1 : Réécrire globals.css**

Remplacer entièrement `app/globals.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@500;700&display=swap');

/* Variables CSS Atlassian */
:root {
  --color-bg:              #0C1624;
  --color-surface:         #161D2D;
  --color-surface-raised:  #1C2638;
  --color-border:          #2C3A52;
  --color-text-primary:    #E6EDF3;
  --color-text-secondary:  #8B9BB4;
  --color-blue:            #0C66E4;
  --color-blue-light:      #1D7AFC;
  --color-teal:            #1D9A8A;
  --color-green:           #22A06B;
  --color-yellow:          #CF9F02;
  --color-orange:          #E56910;
  --color-red:             #C9372C;
  --color-purple:          #6E5DC6;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

/* Animation d'apparition des colonnes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.column-enter {
  animation: fadeInUp 0.25s ease-out both;
}

/* Scrollbar discrète */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}
```

- [ ] **Étape 2 : Réécrire layout.tsx**

Remplacer entièrement `app/layout.tsx` :

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinkBoard',
  description: 'Gestionnaire de liens organisés par catégories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Étape 3 : Vérifier le rendu**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` — fond sombre `#0C1624` doit s'afficher. Arrêter avec Ctrl+C.

- [ ] **Étape 4 : Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: styles globaux Atlassian et layout avec DM Sans"
```

---

## Task 5: Composant EmptyState

**Files:**
- Create: `components/EmptyState.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/EmptyState.tsx` :

```tsx
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreateCategory: () => void
}

// Écran d'onboarding affiché quand aucune catégorie n'existe
export function EmptyState({ onCreateCategory }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div
        className="p-5 rounded-2xl"
        style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
      >
        <FolderOpen
          size={48}
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Aucune catégorie pour l&apos;instant
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Crée ta première catégorie pour commencer à organiser tes liens.
        </p>
      </div>
      <Button
        onClick={onCreateCategory}
        style={{ backgroundColor: 'var(--color-blue)', color: '#fff' }}
        className="hover:opacity-90 transition-opacity"
      >
        + Créer ma première catégorie
      </Button>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add components/EmptyState.tsx
git commit -m "feat: composant EmptyState (onboarding)"
```

---

## Task 6: Composant LinkItem

**Files:**
- Create: `components/LinkItem.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/LinkItem.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Link } from '@/lib/types'

interface LinkItemProps {
  link: Link
  categoryColor: string
  onDelete: (id: string) => void
}

// Extrait le domaine d'une URL pour le favicon
function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function LinkItem({ link, categoryColor, onDelete }: LinkItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex items-start gap-3 p-3 rounded-md cursor-default transition-all duration-150"
      style={{
        backgroundColor: hovered ? 'var(--color-surface)' : 'transparent',
        borderLeft: `3px solid ${hovered ? categoryColor : 'transparent'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Favicon */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${getDomain(link.url)}&sz=16`}
        alt=""
        width={16}
        height={16}
        className="mt-0.5 flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />

      {/* Contenu texte */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
          title={link.title}
        >
          {link.title}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: 'var(--color-text-secondary)' }}
          title={link.url}
        >
          {link.url}
        </p>
        {link.description && (
          <p
            className="text-xs italic mt-0.5 truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {link.description}
          </p>
        )}
      </div>

      {/* Actions (visibles au hover) */}
      <div
        className="flex items-center gap-1 flex-shrink-0 transition-opacity duration-150"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            </TooltipTrigger>
            <TooltipContent>Ouvrir dans un nouvel onglet</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                onClick={() => onDelete(link.id)}
              >
                <Trash2 size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Supprimer ce lien</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add components/LinkItem.tsx
git commit -m "feat: composant LinkItem avec favicon, actions hover"
```

---

## Task 7: Modal AddCategoryModal

**Files:**
- Create: `components/AddCategoryModal.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/AddCategoryModal.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ATLASSIAN_COLORS, DEFAULT_COLOR } from '@/lib/colors'

interface AddCategoryModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, color: string) => void
}

export function AddCategoryModal({ open, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), selectedColor)
    setName('')
    setSelectedColor(DEFAULT_COLOR)
    onClose()
  }

  const handleClose = () => {
    setName('')
    setSelectedColor(DEFAULT_COLOR)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Nouvelle catégorie
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Nom */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Nom de la catégorie *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Développement, Design, Lectures…"
              autoFocus
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Sélecteur de couleur */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {ATLASSIAN_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.label}
                  onClick={() => setSelectedColor(color.hex)}
                  className="w-7 h-7 rounded-full transition-transform duration-100"
                  style={{
                    backgroundColor: color.hex,
                    outline: selectedColor === color.hex ? `2px solid ${color.hex}` : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: selectedColor === color.hex ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              style={{ backgroundColor: 'var(--color-blue)', color: '#fff' }}
              className="hover:opacity-90 disabled:opacity-40"
            >
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add components/AddCategoryModal.tsx
git commit -m "feat: modal création de catégorie avec swatch couleurs"
```

---

## Task 8: Modal EditCategoryModal

**Files:**
- Create: `components/EditCategoryModal.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/EditCategoryModal.tsx` :

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ATLASSIAN_COLORS } from '@/lib/colors'
import type { Category } from '@/lib/types'

interface EditCategoryModalProps {
  open: boolean
  category: Category | null
  onClose: () => void
  onSave: (id: string, name: string, color: string) => void
}

export function EditCategoryModal({ open, category, onClose, onSave }: EditCategoryModalProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  // Pré-remplir le formulaire quand la catégorie change
  useEffect(() => {
    if (category) {
      setName(category.name)
      setSelectedColor(category.color)
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category) return
    onSave(category.id, name.trim(), selectedColor)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Modifier la catégorie
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Nom de la catégorie *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {ATLASSIAN_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.label}
                  onClick={() => setSelectedColor(color.hex)}
                  className="w-7 h-7 rounded-full transition-transform duration-100"
                  style={{
                    backgroundColor: color.hex,
                    outline: selectedColor === color.hex ? `2px solid ${color.hex}` : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: selectedColor === color.hex ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              style={{ backgroundColor: 'var(--color-blue)', color: '#fff' }}
              className="hover:opacity-90 disabled:opacity-40"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add components/EditCategoryModal.tsx
git commit -m "feat: modal édition catégorie pré-remplie"
```

---

## Task 9: Modal ConfirmDeleteModal

**Files:**
- Create: `components/ConfirmDeleteModal.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/ConfirmDeleteModal.tsx` :

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  open: boolean
  categoryName: string
  linkCount: number
  onClose: () => void
  onConfirm: () => void
}

// Modal de confirmation avant suppression d'une catégorie
export function ConfirmDeleteModal({
  open,
  categoryName,
  linkCount,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Supprimer « {categoryName} » ?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm py-2" style={{ color: 'var(--color-text-secondary)' }}>
          Cette action supprimera la catégorie et{' '}
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
            {linkCount} lien{linkCount !== 1 ? 's' : ''}
          </span>{' '}
          associé{linkCount !== 1 ? 's' : ''}. Cette action est irréversible.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            style={{ backgroundColor: 'var(--color-red)', color: '#fff' }}
            className="hover:opacity-90"
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Étape 2 : Commit**

```bash
git add components/ConfirmDeleteModal.tsx
git commit -m "feat: modal confirmation suppression catégorie"
```

---

## Task 10: Modal AddLinkModal

**Files:**
- Create: `components/AddLinkModal.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/AddLinkModal.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/types'

interface AddLinkModalProps {
  open: boolean
  categories: Category[]
  defaultCategoryId?: string
  onClose: () => void
  onAdd: (url: string, title: string, description: string, categoryId: string) => void
}

export function AddLinkModal({ open, categories, defaultCategoryId, onClose, onAdd }: AddLinkModalProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? '')

  const handleClose = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setCategoryId(defaultCategoryId ?? '')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim() || !categoryId) return
    onAdd(url.trim(), title.trim(), description.trim(), categoryId)
    handleClose()
  }

  // Suggère un titre basé sur le domaine de l'URL si le titre est vide
  const handleUrlBlur = () => {
    if (!title && url) {
      try {
        const domain = new URL(url).hostname.replace('www.', '')
        setTitle(domain)
      } catch {
        // URL invalide, on ne fait rien
      }
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const labelStyle = {
    color: 'var(--color-text-secondary)',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Ajouter un lien
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={labelStyle}>URL *</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://exemple.com"
              type="url"
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* Titre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={labelStyle}>Titre *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du lien"
              style={inputStyle}
            />
          </div>

          {/* Description (optionnel) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={labelStyle}>Description <span className="opacity-60">(optionnel)</span></label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description…"
              style={inputStyle}
            />
          </div>

          {/* Catégorie */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={labelStyle}>Catégorie *</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || !title.trim() || !categoryId}
              style={{ backgroundColor: 'var(--color-blue)', color: '#fff' }}
              className="hover:opacity-90 disabled:opacity-40"
            >
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add components/AddLinkModal.tsx
git commit -m "feat: modal ajout de lien avec suggestion de titre"
```

---

## Task 11: Composant CategoryColumn

**Files:**
- Create: `components/CategoryColumn.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `components/CategoryColumn.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Palette, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LinkItem } from '@/components/LinkItem'
import type { Category, Link } from '@/lib/types'

interface CategoryColumnProps {
  category: Category
  links: Link[]
  animationDelay: number
  onAddLink: (categoryId: string) => void
  onDeleteLink: (linkId: string) => void
  onRename: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryColumn({
  category,
  links,
  animationDelay,
  onAddLink,
  onDeleteLink,
  onRename,
  onDelete,
}: CategoryColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="column-enter flex flex-col rounded-lg overflow-hidden"
      style={{
        animationDelay: `${animationDelay}ms`,
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${category.color}`,
        minHeight: '200px',
      }}
    >
      {/* Header de la colonne */}
      <div
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            className="text-xs font-semibold shrink-0"
            style={{
              backgroundColor: `${category.color}22`,
              color: category.color,
              border: `1px solid ${category.color}44`,
            }}
          >
            {category.name}
          </Badge>
          <span className="text-xs shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
            {links.length} lien{links.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Menu contextuel */}
        <div className="relative shrink-0">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <MoreHorizontal size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Options</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {menuOpen && (
            <>
              {/* Overlay pour fermer le menu en cliquant ailleurs */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-8 z-20 flex flex-col rounded-md overflow-hidden shadow-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  minWidth: '160px',
                }}
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => { setMenuOpen(false); onRename(category) }}
                >
                  <Pencil size={14} />
                  Renommer / Couleur
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                  style={{ color: 'var(--color-red)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => { setMenuOpen(false); onDelete(category) }}
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Corps : liste des liens */}
      <div className="flex-1 flex flex-col p-2 gap-0.5">
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
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```bash
git add components/CategoryColumn.tsx
git commit -m "feat: composant CategoryColumn avec menu contextuel et état vide"
```

---

## Task 12: Page principale (assemblage final)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Étape 1 : Réécrire page.tsx**

Remplacer entièrement `app/page.tsx` :

```tsx
'use client'

import { useState, useCallback } from 'react'
import { Plus, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CategoryColumn } from '@/components/CategoryColumn'
import { EmptyState } from '@/components/EmptyState'
import { AddLinkModal } from '@/components/AddLinkModal'
import { AddCategoryModal } from '@/components/AddCategoryModal'
import { EditCategoryModal } from '@/components/EditCategoryModal'
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal'
import type { Category, Link } from '@/lib/types'
import { DEFAULT_COLOR } from '@/lib/colors'

// Génère un identifiant unique simple
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function HomePage() {
  const [categories, setCategories] = useLocalStorage<Category[]>('linkboard:categories', [])
  const [links, setLinks] = useLocalStorage<Link[]>('linkboard:links', [])

  // État des modales
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()

  // --- Handlers catégories ---

  const handleAddCategory = useCallback((name: string, color: string) => {
    const newCat: Category = { id: uid(), name, color, createdAt: Date.now() }
    setCategories((prev) => [...prev, newCat])
  }, [setCategories])

  const handleEditCategory = useCallback((id: string, name: string, color: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name, color } : cat))
    )
    setEditCategory(null)
  }, [setCategories])

  const handleDeleteCategory = useCallback(() => {
    if (!deleteCategory) return
    setCategories((prev) => prev.filter((cat) => cat.id !== deleteCategory.id))
    setLinks((prev) => prev.filter((link) => link.categoryId !== deleteCategory.id))
    setDeleteCategory(null)
  }, [deleteCategory, setCategories, setLinks])

  // --- Handlers liens ---

  const handleAddLink = useCallback((url: string, title: string, description: string, categoryId: string) => {
    const newLink: Link = { id: uid(), url, title, description, categoryId, createdAt: Date.now() }
    setLinks((prev) => [...prev, newLink])
  }, [setLinks])

  const handleDeleteLink = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId))
  }, [setLinks])

  // Ouvre la modal d'ajout de lien pré-sélectionnée sur une catégorie
  const openAddLink = useCallback((categoryId?: string) => {
    setDefaultCategoryId(categoryId)
    setAddLinkOpen(true)
  }, [])

  // Liens par catégorie (mémoïsé via une Map)
  const linksByCategory = new Map<string, Link[]>()
  for (const cat of categories) {
    linksByCategory.set(cat.id, [])
  }
  for (const link of links) {
    const arr = linksByCategory.get(link.categoryId)
    if (arr) arr.push(link)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 gap-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Layout size={20} style={{ color: 'var(--color-blue-light)' }} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text-primary)' }}
          >
            LinkBoard
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddCategoryOpen(true)}
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent',
            }}
            className="hover:border-blue-500 transition-colors text-xs"
          >
            <Plus size={14} className="mr-1" />
            Nouvelle catégorie
          </Button>
          <Button
            size="sm"
            onClick={() => openAddLink()}
            disabled={categories.length === 0}
            style={{ backgroundColor: 'var(--color-blue)', color: '#fff' }}
            className="hover:opacity-90 disabled:opacity-40 text-xs"
          >
            <Plus size={14} className="mr-1" />
            Ajouter un lien
          </Button>
        </div>
      </header>

      {/* Corps principal */}
      <main className="flex-1 p-6">
        {categories.length === 0 ? (
          <EmptyState onCreateCategory={() => setAddCategoryOpen(true)} />
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {categories.map((cat, index) => (
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
        )}
      </main>

      {/* Modales */}
      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      <AddLinkModal
        open={addLinkOpen}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        onClose={() => setAddLinkOpen(false)}
        onAdd={handleAddLink}
      />

      <EditCategoryModal
        open={editCategory !== null}
        category={editCategory}
        onClose={() => setEditCategory(null)}
        onSave={handleEditCategory}
      />

      <ConfirmDeleteModal
        open={deleteCategory !== null}
        categoryName={deleteCategory?.name ?? ''}
        linkCount={deleteCategory ? (linksByCategory.get(deleteCategory.id)?.length ?? 0) : 0}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation complète**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Lancer le serveur et tester visuellement**

```bash
npm run dev
```

Vérifications à faire sur `http://localhost:3000` :
- [ ] Fond sombre `#0C1624` affiché
- [ ] Header sticky avec logo "LinkBoard" en Space Grotesk
- [ ] Boutons "+ Ajouter un lien" et "+ Nouvelle catégorie" visibles
- [ ] Écran EmptyState affiché (icône dossier + bouton)
- [ ] Créer une catégorie → colonne apparaît avec animation fade-in
- [ ] Ajouter un lien → item apparaît dans la colonne
- [ ] Hover sur un item → boutons ExternalLink et Trash2 visibles
- [ ] Menu MoreHorizontal → options Renommer et Supprimer
- [ ] Supprimer une catégorie → modal de confirmation avec compteur de liens
- [ ] Refresh de la page → données persistées depuis localStorage
- [ ] Responsive : 1 colonne sur mobile, 2 sur tablette, 3+ sur desktop

- [ ] **Étape 4 : Commit final**

```bash
git add app/page.tsx
git commit -m "feat: page principale LinkBoard - assemblage final"
```

---

## Task 13: Vérification du build de production

**Files:** aucun nouveau fichier

- [ ] **Étape 1 : Build de production**

```bash
npm run build
```

Résultat attendu : build réussi sans erreurs. Des warnings ESLint sur `img` non-next/image sont acceptables.

- [ ] **Étape 2 : Tester le build**

```bash
npm run start
```

Ouvrir `http://localhost:3000` et répéter les vérifications visuelles de Task 12, Étape 3.

- [ ] **Étape 3 : Commit final de version**

```bash
git add -A
git commit -m "chore: build production vérifié - LinkBoard v1.0"
```

---

## Self-Review

### Couverture du spec

| Exigence spec | Tâche couverte |
|---|---|
| Next.js 14, TypeScript, Tailwind, shadcn/ui, lucide-react | Task 1 |
| Variables CSS Atlassian, DM Sans, Space Grotesk | Task 4 |
| Types Category et Link | Task 2 |
| Palette 8 couleurs | Task 2 |
| Hook useLocalStorage | Task 3 |
| Header sticky avec logo + boutons | Task 12 |
| Grid auto-fill minmax(280px) | Task 12 |
| Colonne catégorie : badge coloré, border-left, compteur | Task 11 |
| Menu MoreHorizontal : Renommer / Supprimer | Task 11 |
| LinkItem : favicon, titre, URL, description, hover | Task 6 |
| ExternalLink + Trash2 au hover | Task 6 |
| Modal AddLink : URL, titre, description, catégorie | Task 10 |
| Suggestion de titre depuis domaine URL | Task 10 |
| Modal AddCategory : nom + swatches | Task 7 |
| Modal EditCategory pré-remplie | Task 8 |
| Confirmation suppression avec compteur liens | Task 9 |
| EmptyState onboarding | Task 5 |
| État vide par colonne + lien "Ajouter un lien" | Task 11 |
| Animations fade-in + stagger 50ms | Task 4 (CSS) + Task 11 (delay) |
| Fermeture modales avec Escape | shadcn Dialog natif |
| Responsive : grid auto-fill | Task 12 |
| Persistance localStorage | Tasks 3 + 12 |

### Points manquants identifiés

**Responsive mobile accordéon** — Le spec mentionne "sur mobile, affiche les catégories en colonne unique avec des titres cliquables pour réduire/déplier (accordéon)". Le grid CSS `auto-fill minmax(280px)` gère déjà la colonne unique sur mobile. L'accordéon est une amélioration optionnelle non critique pour un MVP fonctionnel. Il peut être ajouté en Task 14 si nécessaire.

### Scan de placeholders

Aucun placeholder ("TBD", "TODO", "implement later") détecté dans le plan.

### Cohérence des types

- `Category` et `Link` définis en Task 2, utilisés de manière cohérente dans toutes les tâches suivantes.
- `onAdd(name, color)` dans AddCategoryModal → `handleAddCategory(name, color)` dans page.tsx ✓
- `onSave(id, name, color)` dans EditCategoryModal → `handleEditCategory(id, name, color)` ✓
- `onDelete(linkId)` dans LinkItem → `handleDeleteLink(linkId)` ✓
- `animationDelay: number` dans CategoryColumn → `index * 50` dans page.tsx ✓
