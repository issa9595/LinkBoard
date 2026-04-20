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
          <DialogTitle
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            }}
          >
            Nouvelle catégorie
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
              placeholder="Ex: Développement, Design, Lectures…"
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
