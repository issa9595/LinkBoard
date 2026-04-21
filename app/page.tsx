'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Plus, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CategoryColumn } from '@/components/CategoryColumn'
import { EmptyState } from '@/components/EmptyState'
import { AddLinkModal } from '@/components/AddLinkModal'
import { AddCategoryModal } from '@/components/AddCategoryModal'
import { EditCategoryModal } from '@/components/EditCategoryModal'
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal'
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
import { DND_ID, parseDragId, byOrder } from '@/lib/utils'
import type { Category, Link } from '@/lib/types'

// Génère un identifiant unique simple
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function HomePage() {
  const [categories, setCategories] = useLocalStorage<Category[]>('linkboard:categories', [])
  const [links, setLinks] = useLocalStorage<Link[]>('linkboard:links', [])

  // One-time migration for existing data that predates the order field
  useEffect(() => {
    if (categories.some(c => c.order === undefined)) {
      setCategories(prev => prev.map((c, i) => ({ ...c, order: c.order ?? i })))
    }
    if (links.some(l => l.order === undefined)) {
      setLinks(prev => prev.map((l, i) => ({ ...l, order: l.order ?? i })))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // --- Handlers catégories ---

  const handleAddCategory = useCallback((name: string, color: string) => {
    setCategories((prev) => [
      ...prev,
      { id: uid(), name, color, createdAt: Date.now(), order: prev.length },
    ])
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
    setLinks((prev) => {
      const order = prev.filter(l => l.categoryId === categoryId).length
      return [...prev, { id: uid(), url, title, description, categoryId, createdAt: Date.now(), order }]
    })
  }, [setLinks])

  const handleDeleteLink = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId))
  }, [setLinks])

  const openAddLink = useCallback((categoryId?: string) => {
    setDefaultCategoryId(categoryId)
    setAddLinkOpen(true)
  }, [])

  // --- Handlers DnD ---

  function handleDragStart({ active }: DragStartEvent) {
    setActiveDragId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeParsed = parseDragId(active.id as string)
    const overParsed = parseDragId(over.id as string)

    if (activeParsed.type !== 'link') return

    setLinks(prev => {
      const activeLink = prev.find(l => l.id === activeParsed.rawId)
      if (!activeLink) return prev

      let targetCatId: string | null = null
      if (overParsed.type === 'category') {
        targetCatId = overParsed.rawId
      } else if (overParsed.type === 'link') {
        targetCatId = prev.find(l => l.id === overParsed.rawId)?.categoryId ?? null
      }

      if (!targetCatId || targetCatId === activeLink.categoryId) return prev

      const order = prev.filter(l => l.categoryId === targetCatId).length
      return prev.map(l =>
        l.id === activeParsed.rawId ? { ...l, categoryId: targetCatId!, order } : l
      )
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDragId(null)
    if (!over || active.id === over.id) return

    const activeParsed = parseDragId(active.id as string)
    const overParsed = parseDragId(over.id as string)

    if (activeParsed.type === 'category' && overParsed.type === 'category') {
      setCategories(prev => {
        const sorted = [...prev].sort(byOrder)
        const oldIndex = sorted.findIndex(c => c.id === activeParsed.rawId)
        const newIndex = sorted.findIndex(c => c.id === overParsed.rawId)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(sorted, oldIndex, newIndex).map((cat, i) => ({ ...cat, order: i }))
      })
      return
    }

    if (activeParsed.type === 'link' && overParsed.type === 'link') {
      setLinks(prev => {
        const activeLink = prev.find(l => l.id === activeParsed.rawId)
        const overLink = prev.find(l => l.id === overParsed.rawId)
        if (!activeLink || !overLink || activeLink.categoryId !== overLink.categoryId) return prev
        const catLinks = [...prev.filter(l => l.categoryId === activeLink.categoryId)].sort(byOrder)
        const oldIndex = catLinks.findIndex(l => l.id === activeParsed.rawId)
        const newIndex = catLinks.findIndex(l => l.id === overParsed.rawId)
        if (oldIndex === -1 || newIndex === -1) return prev
        const reordered = arrayMove(catLinks, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }))
        return prev.map(l => reordered.find(r => r.id === l.id) ?? l)
      })
    }
  }

  const sortedCategories = useMemo(
    () => [...categories].sort(byOrder),
    [categories]
  )

  const linksByCategory = useMemo(() => {
    const map = new Map<string, Link[]>()
    for (const cat of sortedCategories) map.set(cat.id, [])
    for (const link of links) {
      const arr = map.get(link.categoryId)
      if (arr) arr.push(link)
    }
    for (const arr of map.values()) arr.sort(byOrder)
    return map
  }, [links, sortedCategories])

  const activeDragParsed = useMemo(
    () => (activeDragId ? parseDragId(activeDragId) : null),
    [activeDragId]
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header sticky */}
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
            style={{
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
              color: 'var(--color-text-primary)',
            }}
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
            className="text-xs"
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
        {sortedCategories.length === 0 ? (
          <EmptyState onCreateCategory={() => setAddCategoryOpen(true)} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedCategories.map(c => DND_ID.category(c.id))}
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
              {activeDragParsed?.type === 'category' && (() => {
                const cat = sortedCategories.find(c => c.id === activeDragParsed.rawId)
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
                      <span className="text-xs font-semibold" style={{ color: cat.color }}>
                        {cat.name}
                      </span>
                    </div>
                  </div>
                )
              })()}
              {activeDragParsed?.type === 'link' && (() => {
                const link = links.find(l => l.id === activeDragParsed.rawId)
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
