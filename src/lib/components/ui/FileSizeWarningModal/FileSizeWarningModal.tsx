import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Modal } from '../Modal';
import type { FileSizeStatus } from '../../../../utils/fileSize';

/**
 * FileSizeWarningModal component properties
 */
export interface FileSizeWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** File size status with formatted size and recommendations */
  fileSizeStatus: FileSizeStatus;
  /** Callback when user chooses to proceed without compression */
  onProceed: () => void;
  /** Callback when user chooses to compress the file */
  onCompress: () => void;
}

/**
 * Warning icon for large files
 */
const WarningIcon = () => (
  <AlertTriangle className="w-16 h-16 text-amber-500" data-testid="warning-icon" />
);

/**
 * Error icon for files that are too large
 */
const ErrorIcon = () => <XCircle className="w-16 h-16 text-red-500" data-testid="error-icon" />;

/**
 * Modal dialog for warning users about large file sizes.
 *
 * Features:
 * - **Two states**: Warning (large file) and Error (file too large)
 * - **File info**: Displays formatted size and estimated processing time
 * - **Recommendations**: Provides compression recommendations
 * - **Benefits list**: Shows advantages of compression for large files
 * - **Action buttons**: Compress, Continue Anyway (warning only), Cancel
 * - **Dark mode**: Supports light and dark themes
 *
 * @example
 * ```tsx
 * <FileSizeWarningModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   fileSizeStatus={{
 *     formattedSize: '28.5 MB',
 *     isTooLarge: false,
 *     estimatedTime: '~2 minutes',
 *     recommendation: 'We recommend compressing this file...'
 *   }}
 *   onProceed={handleProceed}
 *   onCompress={handleCompress}
 * />
 * ```
 *
 * @param props - FileSizeWarningModal properties
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback when modal should close
 * @param props.fileSizeStatus - File size status with formatted size and recommendations
 * @param props.onProceed - Callback when user chooses to proceed without compression
 * @param props.onCompress - Callback when user chooses to compress the file
 *
 * @returns Modal dialog for file size warnings
 */
export const FileSizeWarningModal: React.FC<FileSizeWarningModalProps> = ({
  isOpen,
  onClose,
  fileSizeStatus,
  onProceed,
  onCompress,
}) => {
  const { t } = useTranslation();
  const { formattedSize, isTooLarge, estimatedTime, recommendation } = fileSizeStatus;

  const actions = isTooLarge
    ? [
        {
          label: t('fileSizeWarning.buttons.compress'),
          onClick: onCompress,
          variant: 'primary' as const,
        },
        { label: t('common.cancel'), onClick: onClose, variant: 'outline' as const },
      ]
    : [
        {
          label: t('fileSizeWarning.buttons.compressContinue'),
          onClick: onCompress,
          variant: 'primary' as const,
        },
        {
          label: t('fileSizeWarning.buttons.continueAnyway'),
          onClick: onProceed,
          variant: 'outline' as const,
        },
        { label: t('common.cancel'), onClick: onClose, variant: 'outline' as const },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTooLarge ? t('fileSizeWarning.titles.tooLarge') : t('fileSizeWarning.titles.large')}
      actions={actions}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {isTooLarge ? <ErrorIcon /> : <WarningIcon />}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">
              {t('fileSizeWarning.labels.fileSize')}
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
              {formattedSize}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">
              {t('fileSizeWarning.labels.estimatedTime')}
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
              {estimatedTime}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/40 border-l-4 border-amber-500 rounded text-left">
          <p className="m-0 font-medium text-amber-800 dark:text-amber-100">{recommendation}</p>
        </div>

        {!isTooLarge && (
          <div className="text-left bg-green-50 dark:bg-green-900/40 border-l-4 border-emerald-500 rounded p-4 mb-4">
            <h4 className="m-0 mb-3 text-emerald-800 dark:text-emerald-100 text-base">
              {t('fileSizeWarning.benefits.title')}
            </h4>
            <ul className="m-0 pl-6 text-emerald-700 dark:text-emerald-200 list-disc">
              <li className="my-2 text-sm">{t('fileSizeWarning.benefits.faster')}</li>
              <li className="my-2 text-sm">{t('fileSizeWarning.benefits.lowerMemory')}</li>
              <li className="my-2 text-sm">{t('fileSizeWarning.benefits.optimized')}</li>
              <li className="my-2 text-sm">{t('fileSizeWarning.benefits.noImpact')}</li>
            </ul>
          </div>
        )}

        {isTooLarge && (
          <div className="text-left bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 rounded p-4 mb-4">
            <p className="m-0 text-red-800 dark:text-red-200 text-sm">
              <strong className="text-red-900 dark:text-red-100">
                {t('fileSizeWarning.note.label')}
              </strong>{' '}
              {t('fileSizeWarning.note.text')}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
