import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input, GlassCard } from '@/lib';
import type { HistorySession } from '../types/history';
import { formatDate } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: HistorySession | null;
  sessions?: HistorySession[];
  isDeleting?: boolean;
  count?: number;
  confirmPhrase?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  session,
  sessions,
  isDeleting = false,
  count,
}: DeleteConfirmModalProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');

  if (!session && !count) return null;

  const isBulk = count && count > 1;
  const requiresConfirmPhrase = count !== undefined && count >= 5;
  const isConfirmEnabled = !requiresConfirmPhrase || confirmText === 'DELETE';

  const handleConfirm = () => {
    if (!isConfirmEnabled || isDeleting) return;
    onConfirm();
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isBulk
          ? t('deleteConfirmModal.titleBulk', 'Delete {{count}} Recordings?', { count })
          : t('deleteConfirmModal.titleSingle', 'Delete Recording?')
      }
      hideHeader
      className="max-w-md p-2"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-5 flex-shrink-0">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isBulk
            ? t('deleteConfirmModal.titleBulk', 'Delete {{count}} Recordings?', { count })
            : t('deleteConfirmModal.titleSingle', 'Delete Recording?')}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {isBulk
            ? t(
                'deleteConfirmModal.messageBulk',
                'Are you sure you want to delete {{count}} recordings? This action cannot be undone.',
                { count }
              )
            : t(
                'deleteConfirmModal.messageSingle',
                'Are you sure you want to delete this recording? This action cannot be undone.'
              )}
        </p>

        {session && !isBulk && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2 text-left w-full mb-8 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('deleteConfirmModal.recordingLabel', 'Recording:')}
              </span>
              <span className="text-sm text-gray-900 dark:text-white truncate font-medium">
                {session.audioName}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('deleteConfirmModal.createdLabel', 'Created:')}
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {formatDate(session.createdAt)}
              </span>
            </div>
          </div>
        )}

        {isBulk && sessions && sessions.length > 0 && (
          <GlassCard variant="dark" className="w-full mb-6 p-4 text-left">
            <p className="text-sm font-semibold text-text-primary mb-3">
              {t('deleteConfirmModal.affectedItems', 'Recordings to be deleted:')}
            </p>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {sessions.map((s) => (
                <li key={s.sessionId} className="text-sm text-text-secondary truncate">
                  {s.audioName}
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        {requiresConfirmPhrase && (
          <div className="w-full mb-6">
            <Input
              label={t('deleteConfirmModal.typeToConfirm', 'Type DELETE to confirm')}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t('deleteConfirmModal.typeToConfirmPlaceholder', 'Type DELETE here')}
            />
          </div>
        )}

        <div className="flex flex-col w-full gap-3 mt-2">
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting || !isConfirmEnabled}
            className="w-full"
          >
            {isDeleting
              ? t('deleteConfirmModal.confirmingButton', 'Deleting...')
              : t('deleteConfirmModal.confirmButton', 'Yes, Delete')}
          </Button>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting} className="w-full">
            {t('deleteConfirmModal.cancelButton', 'Cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
