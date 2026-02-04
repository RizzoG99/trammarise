import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/lib/components/ui/Modal';
import type { HistorySession } from '../types/history';
import { formatDate } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: HistorySession | null;
  isDeleting?: boolean;
  count?: number;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  session,
  isDeleting = false,
  count,
}: DeleteConfirmModalProps) {
  if (!session && !count) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={count ? `Delete ${count} Recordings?` : 'Delete Recording?'}
      actions={[
        {
          label: 'Cancel',
          onClick: onClose,
          variant: 'outline',
        },
        {
          label: isDeleting ? 'Deleting...' : 'Delete',
          onClick: onConfirm,
          variant: 'danger',
        },
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white mb-2">
              {count
                ? `Are you sure you want to delete ${count} recordings? This action cannot be undone.`
                : 'Are you sure you want to delete this recording? This action cannot be undone.'}
            </p>
          </div>
        </div>

        {session && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recording:
              </span>
              <p className="text-gray-900 dark:text-white truncate">{session.audioName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <p className="text-gray-900 dark:text-white">{formatDate(session.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <p className="text-gray-900 dark:text-white capitalize">{session.contentType}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
