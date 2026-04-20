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

  // Liens par catégorie
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
        {categories.length === 0 ? (
          <EmptyState onCreateCategory={() => setAddCategoryOpen(true)} />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
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
