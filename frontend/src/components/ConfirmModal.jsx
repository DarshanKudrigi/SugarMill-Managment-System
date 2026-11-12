import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable destructive-action confirmation modal.
 * Usage:
 *   <ConfirmModal
 *     isOpen={show}
 *     onClose={() => setShow(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Item"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"
 *   />
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
          <AlertTriangle className="text-red-500" size={24} />
        </div>
        <p className="text-sm text-slate-600 text-center">{message}</p>
        <div className="flex gap-3 w-full pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
