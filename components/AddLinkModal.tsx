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
          <DialogTitle
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            }}
          >
            Ajouter un lien
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              URL *
            </label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Titre *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du lien"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Description{' '}
              <span style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>(optionnel)</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description…"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Catégorie *
            </label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
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
