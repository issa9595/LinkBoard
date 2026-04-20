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
      className="relative flex items-start gap-3 p-3 rounded-md transition-all duration-150"
      style={{
        backgroundColor: hovered ? 'var(--color-surface)' : 'transparent',
        borderLeft: `3px solid ${hovered ? categoryColor : 'transparent'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Favicon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Actions visibles au hover */}
      <div
        className="flex items-center gap-1 flex-shrink-0 transition-opacity duration-150"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <TooltipProvider delay={300}>
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded transition-colors block"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <ExternalLink size={14} />
            </TooltipTrigger>
            <TooltipContent>Ouvrir dans un nouvel onglet</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-red)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  onClick={() => onDelete(link.id)}
                />
              }
            >
              <Trash2 size={14} />
            </TooltipTrigger>
            <TooltipContent>Supprimer ce lien</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
