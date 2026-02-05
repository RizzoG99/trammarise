import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { HistoryFilters } from '@/features/history/components/HistoryFilters';
import { HistoryList } from '@/features/history/components/HistoryList';
import { HistoryEmptyState } from '@/features/history/components/HistoryEmptyState';
import { DeleteConfirmModal } from '@/features/history/components/DeleteConfirmModal';
import { HistoryDashboard } from '@/features/history/components/HistoryDashboard';
import { LoadingSpinner } from '@/lib/components/ui/LoadingSpinner';
import { Snackbar } from '@/lib/components/ui/Snackbar';
import { Button } from '@/lib/components/ui/Button';
import { Trash2, X } from 'lucide-react';

import { useHistorySessions } from '@/features/history/hooks/useHistorySessions';
import { useHistoryFilters } from '@/features/history/hooks/useHistoryFilters';
import { useHistorySelection } from '@/features/history/hooks/useHistorySelection';
import { groupSessionsByDate } from '@/features/history/utils/sessionGrouping';
import type { HistorySession } from '@/features/history/types/history';
import { useTranslation } from 'react-i18next';

export function HistoryPage() {
  const { t } = useTranslation();
  const { sessions, isLoading, error, deleteSession } = useHistorySessions();
  const {
    searchQuery,
    contentTypeFilter,
    sortBy,
    filteredSessions,
    hasActiveFilters,
    setSearchQuery,
    setContentTypeFilter,
    setSortBy,
    clearFilters,
  } = useHistoryFilters(sessions);

  // Bulk Selection State
  const { selectedIds, toggleSelection, selectAll, clearSelection, hasSelection } =
    useHistorySelection();

  const [sessionToDelete, setSessionToDelete] = useState<HistorySession | null>(null);
  const [bulkDeleteCount, setBulkDeleteCount] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    variant: 'success' | 'error';
  } | null>(null);

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const handleDeleteClick = (sessionId: string) => {
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      setSessionToDelete(session);
    }
  };

  // Bulk Delete — opens modal instead of window.confirm
  const handleBulkDelete = () => {
    setBulkDeleteCount(selectedIds.size);
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIds);

    try {
      const results = await Promise.allSettled(idsToDelete.map((id) => deleteSession(id)));

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed === 0) {
        setSnackbar({
          message: t('history.messages.deleteSuccess', { count: succeeded }),
          variant: 'success',
        });
        clearSelection();
      } else if (succeeded === 0) {
        setSnackbar({
          message: t('history.messages.deleteFailed'),
          variant: 'error',
        });
      } else {
        // Partial success: clear only the successfully deleted IDs
        const failedIds = new Set(
          idsToDelete.filter((_, idx) => results[idx].status === 'rejected')
        );
        // Update selection to only keep failed IDs
        clearSelection();
        failedIds.forEach((id) => toggleSelection(id));

        setSnackbar({
          message: t('history.messages.deletePartial', { succeeded, failed }),
          variant: 'error',
        });
      }
    } catch {
      setSnackbar({ message: t('history.messages.deleteGenericError'), variant: 'error' });
    } finally {
      setIsDeleting(false);
      setBulkDeleteCount(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSession(sessionToDelete.sessionId);
      setSnackbar({ message: t('history.messages.deleteSingleSuccess'), variant: 'success' });
      setSessionToDelete(null);
      // Also remove from selection if present
      if (selectedIds.has(sessionToDelete.sessionId)) {
        toggleSelection(sessionToDelete.sessionId);
      }
    } catch {
      setSnackbar({ message: t('history.messages.deleteSingleError'), variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setSessionToDelete(null);
    setBulkDeleteCount(null);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Failed to load history
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </PageLayout>
    );
  }

  const hasAnySessions = sessions.length > 0;
  const hasFilteredResults = filteredSessions.length > 0;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-32 relative overscroll-y-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('history.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('history.description')}</p>
          </div>

          {hasAnySessions && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full self-start md:self-auto">
              {t('history.stats.recordingCount', { count: sessions.length })}
            </div>
          )}
        </div>

        {/* New Insights Dashboard */}
        {hasAnySessions && <HistoryDashboard sessions={sessions} />}

        {hasAnySessions && (
          <HistoryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            contentTypeFilter={contentTypeFilter}
            onContentTypeChange={setContentTypeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* Batch Action Floating Bar */}
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${hasSelection ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4">
            <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {t('history.batch.selected', { count: selectedIds.size })}
            </span>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <Button
              variant="ghost"
              onClick={
                selectedIds.size === filteredSessions.length
                  ? clearSelection
                  : () => selectAll(filteredSessions.map((s) => s.sessionId))
              }
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full"
            >
              {selectedIds.size === filteredSessions.length
                ? t('history.batch.deselectAll')
                : t('history.batch.selectAll')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('history.batch.delete')}
            </Button>
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="ml-2 !p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasFilteredResults ? (
          <HistoryList
            groupedSessions={groupedSessions}
            onDelete={handleDeleteClick}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            selectionMode={hasSelection}
          />
        ) : (
          <HistoryEmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!sessionToDelete || !!bulkDeleteCount}
        onClose={handleDeleteCancel}
        onConfirm={bulkDeleteCount ? handleBulkDeleteConfirm : handleDeleteConfirm}
        session={sessionToDelete}
        isDeleting={isDeleting}
        count={bulkDeleteCount ?? undefined}
      />

      {snackbar && (
        <Snackbar
          isOpen={true}
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={() => setSnackbar(null)}
        />
      )}
    </PageLayout>
  );
}
