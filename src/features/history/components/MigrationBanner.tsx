import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/lib/components/ui/Button';
import { getAllSessionIds, loadSessionMetadata } from '@/utils/session-manager';

interface MigrationBannerProps {
  onImportComplete?: () => void;
}

/**
 * MigrationBanner - Prompts authenticated users to import local sessions
 *
 * Shows a dismissible banner when:
 * 1. User is authenticated
 * 2. Local sessions exist in localStorage
 * 3. User hasn't dismissed the banner
 *
 * Features:
 * - One-click import of up to 50 sessions
 * - Progress indicator during import
 * - Success/error messages
 * - Persistent dismissal (stored in localStorage)
 */
export function MigrationBanner({ onImportComplete }: MigrationBannerProps) {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has dismissed the banner
    return localStorage.getItem('migration_banner_dismissed') === 'true';
  });

  // Count local sessions
  const localSessionCount = getAllSessionIds().length;

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    try {
      // Load all local sessions
      const sessionIds = getAllSessionIds();
      const localSessions = sessionIds
        .map((id) => {
          const metadata = loadSessionMetadata(id);
          if (!metadata) return null;

          return {
            sessionId: id,
            audioName: metadata.audioName || 'unknown.wav',
            fileSizeBytes: metadata.fileSizeBytes || 0,
            language: metadata.language || 'en',
            contentType: metadata.contentType || 'other',
            createdAt: metadata.createdAt,
            updatedAt: metadata.updatedAt,
            processingMode: metadata.processingMode,
            noiseProfile: metadata.noiseProfile,
            selectionMode: metadata.selectionMode,
            regionStart: metadata.regionStart,
            regionEnd: metadata.regionEnd,
            result: metadata.result,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      // Call import API
      const response = await fetch('/api/sessions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localSessions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import sessions');
      }

      const result = await response.json();

      setImported(true);
      setImporting(false);

      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        handleDismiss();
      }, 5000);

      console.log(`Successfully imported ${result.imported} sessions`);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to import sessions');
      setImporting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('migration_banner_dismissed', 'true');
  };

  // Don't show banner if:
  // - Already dismissed
  // - No local sessions
  // - Already imported successfully
  if (dismissed || localSessionCount === 0 || imported) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {imported ? (
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {imported
              ? t('history.migration.successTitle', 'Sessions Imported!')
              : t('history.migration.title', 'Sync Your Sessions')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {imported
              ? t(
                  'history.migration.successMessage',
                  'Your local sessions are now synced across all your devices.'
                )
              : t(
                  'history.migration.description',
                  'Import your {{count}} local session(s) to sync across devices and never lose your work.',
                  { count: localSessionCount }
                )}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!imported && (
            <div className="flex items-center gap-3">
              <Button onClick={handleImport} disabled={importing}>
                {importing
                  ? t('history.migration.importing', 'Importing...')
                  : t('history.migration.importButton', 'Import Now')}
              </Button>
              <Button variant="ghost" onClick={handleDismiss} disabled={importing}>
                {t('history.migration.dismissButton', 'Maybe Later')}
              </Button>
            </div>
          )}
        </div>

        {/* Close button */}
        {!importing && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
