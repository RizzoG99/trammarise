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

export function HistoryPage() {
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
  const { selectedIds, toggleSelection, clearSelection, hasSelection } = useHistorySelection();

  const [sessionToDelete, setSessionToDelete] = useState<HistorySession | null>(null);
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

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} recordings?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Execute deletions in sequence or parallel depending on backend/storage limits
      // Using Promise.all for parallel since it's local storage
      await Promise.all(Array.from(selectedIds).map((id) => deleteSession(id)));

      setSnackbar({
        message: `${selectedIds.size} recordings deleted successfully`,
        variant: 'success',
      });
      clearSelection();
    } catch {
      setSnackbar({ message: 'Failed to delete some recordings', variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSession(sessionToDelete.sessionId);
      setSnackbar({ message: 'Recording deleted successfully', variant: 'success' });
      setSessionToDelete(null);
      // Also remove from selection if present
      if (selectedIds.has(sessionToDelete.sessionId)) {
        toggleSelection(sessionToDelete.sessionId);
      }
    } catch {
      setSnackbar({ message: 'Failed to delete recording', variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setSessionToDelete(null);
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recording History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your recordings and generated summaries
            </p>
          </div>

          {hasAnySessions && (
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full self-start md:self-auto">
              {sessions.length} {sessions.length === 1 ? 'recording' : 'recordings'}
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
              {selectedIds.size} selected
            </span>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <Button
              variant="ghost"
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selection
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
        isOpen={!!sessionToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        session={sessionToDelete}
        isDeleting={isDeleting}
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
