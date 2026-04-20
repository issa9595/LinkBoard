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
          <DialogTitle
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            }}
          >
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
