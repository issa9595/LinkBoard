'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
            className="text-xs font-semibold shrink-0 truncate max-w-[140px]"
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
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/5"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => setMenuOpen((v) => !v)}
                  />
                }
              >
                <MoreHorizontal size={16} />
              </TooltipTrigger>
              <TooltipContent>Options</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {menuOpen && (
            <>
              {/* Overlay pour fermer le menu en cliquant ailleurs */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
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
