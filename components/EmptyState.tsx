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
        <FolderOpen size={48} style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
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
