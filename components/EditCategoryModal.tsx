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
          <DialogTitle
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            }}
          >
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
