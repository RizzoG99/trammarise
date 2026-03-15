import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { PageLayout } from '@/components/layout/PageLayout';
import { HistoryList } from '@/features/history/components/HistoryList';
import { HistoryEmptyState } from '@/features/history/components/HistoryEmptyState';
import { DeleteConfirmModal } from '@/features/history/components/DeleteConfirmModal';
import { HistoryDashboard } from '@/features/history/components/HistoryDashboard';
import { HistoryFilterPanel } from '@/features/history/components/HistoryFilterPanel';
import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';
import { Snackbar } from '@/lib/components/ui/Snackbar';
import { Button } from '@/lib/components/ui/Button';
import { Alert } from '@/lib/components/ui/Alert/Alert';
import { Trash2, Search, Lock, SlidersHorizontal } from 'lucide-react';

import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeModal } from '@/components/marketing/UpgradeModal';

import { Select } from '@/lib/components/ui/Select';
import { GlassCard } from '@/lib/components/ui/GlassCard';

import { useHistorySessions } from '@/features/history/hooks/useHistorySessions';
import { useHistoryFilters } from '@/features/history/hooks/useHistoryFilters';
import { useHistorySelection } from '@/features/history/hooks/useHistorySelection';
import { useBlobDownload } from '@/features/history/hooks/useBlobDownload';
import { groupSessionsByDate } from '@/features/history/utils/sessionGrouping';
import { loadSessionMetadata } from '@/utils/session-manager';
import type { ContentType } from '@/types/content-types';
import type { HistorySession, SortOption } from '@/features/history/types/history';
import { useTranslation } from 'react-i18next';

export function HistoryPage() {
  const { t } = useTranslation();
  useUser();
  const { subscription } = useSubscription();
  const userTier = subscription?.tier || 'free';
  const { sessions, isLoading, error, deleteSession, totalCount } = useHistorySessions();
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

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<HistorySession | null>(null);
  const [bulkDeleteCount, setBulkDeleteCount] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    variant: 'success' | 'error';
  } | null>(null);

  const groupedSessions = groupSessionsByDate(filteredSessions);
  const { download } = useBlobDownload({ onError: (err) => console.error(err) });

  const handleDownload = async (sessionId: string, audioName: string) => {
    try {
      await download(sessionId, audioName);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleCopySummary = async (sessionId: string) => {
    try {
      const data = loadSessionMetadata(sessionId);
      if (data?.result?.summary) {
        await navigator.clipboard.writeText(data.result.summary);
      }
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

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
        <PageLoader fullHeight />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <Alert variant="error">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('history.error.title')}</h2>
              <p className="text-sm">{error}</p>
            </div>
          </Alert>
        </div>
      </PageLayout>
    );
  }

  // Check if we need to show the locked history banner
  const showLockedHistoryBanner = userTier === 'free' && totalCount > 5;

  return (
    <PageLayout>
      <div className="bg-bg-primary text-text-primary p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">{t('history.title')}</h1>
            <HistoryDashboard sessions={sessions} />
          </div>

          {/* Filters & Search */}
          <div className="sticky top-4 z-30">
            <GlassCard
              variant="glow"
              className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              {/* Mobile: search + filter toggle */}
              <div className="flex items-center gap-2 w-full sm:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('history.searchPlaceholder')}
                    className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-bg-secondary/50 border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={() => setIsFilterPanelOpen((v) => !v)}
                  className={`w-[38px] h-[38px] shrink-0 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    isFilterPanelOpen || hasActiveFilters
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-bg-surface border-border text-text-tertiary hover:text-text-primary'
                  }`}
                  aria-label={t('history.filter.toggleAriaLabel')}
                  aria-expanded={isFilterPanelOpen}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop: full search + sort dropdowns */}
              <div className="hidden sm:flex items-center gap-4 w-full">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('history.searchPlaceholder')}
                    className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-bg-secondary/50 border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select
                    value={contentTypeFilter}
                    onChange={(value) => setContentTypeFilter(value as ContentType | 'all')}
                    className="w-44"
                    options={[
                      { value: 'all', label: t('history.filter.allTypes') },
                      { value: 'meeting', label: t('history.filter.type.meeting') },
                      { value: 'lecture', label: t('history.filter.type.lecture') },
                      { value: 'interview', label: t('history.filter.type.interview') },
                      { value: 'podcast', label: t('history.filter.type.podcast') },
                      { value: 'voice-memo', label: t('history.filter.type.voice-memo') },
                      { value: 'other', label: t('history.filter.type.other') },
                    ]}
                  />
                  <Select
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortOption)}
                    className="w-48"
                    options={[
                      { value: 'newest', label: t('history.sort.newest') },
                      { value: 'oldest', label: t('history.sort.oldest') },
                      { value: 'a-z', label: t('history.sort.nameAsc') },
                      { value: 'z-a', label: t('history.sort.nameDesc') },
                    ]}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Mobile filter panel */}
            <div className="sm:hidden">
              <HistoryFilterPanel
                isOpen={isFilterPanelOpen}
                contentTypeFilter={contentTypeFilter}
                onContentTypeChange={setContentTypeFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClose={() => setIsFilterPanelOpen(false)}
              />
            </div>
          </div>

          {/* Selection Bar */}
          {hasSelection && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
              <GlassCard
                variant="primary"
                className="p-4 flex items-center justify-between shadow-2xl shadow-primary/40 border-primary/20 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="text-primary font-medium px-3 py-1 bg-primary/20 rounded-full text-sm">
                    {t('history.batch.selected', { count: selectedIds.size })}
                  </span>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary hover:bg-primary/20 px-3 py-1 text-sm h-auto"
                    onClick={() => selectAll(filteredSessions.map((s) => s.sessionId))}
                  >
                    {t('history.batch.selectAll')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary hover:bg-primary/20 px-3 py-1 text-sm h-auto"
                    onClick={clearSelection}
                  >
                    {t('history.batch.deselectAll')}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    onClick={handleBulkDelete}
                    className="bg-accent-error/20 text-accent-error hover:bg-accent-error/30 border border-accent-error/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('history.menu.delete')}
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Pro Banner */}
          {showLockedHistoryBanner && (
            <GlassCard
              variant="primary"
              className="p-6 border-accent-warning/20"
              style={{ backgroundColor: 'var(--color-accent-warning-alpha-10)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-full text-accent-warning"
                  style={{ backgroundColor: 'var(--color-accent-warning-alpha-20)' }}
                >
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {t('history.proBanner.title')}
                  </h3>
                  <p className="text-text-secondary">{t('history.proBanner.description')}</p>
                </div>
                <Button
                  className="ml-auto border-0"
                  style={{
                    backgroundColor: 'var(--color-accent-warning)',
                    color: 'var(--color-bg-primary)',
                  }}
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  {t('history.proBanner.cta')}
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Grid Content */}
          {filteredSessions.length > 0 ? (
            <HistoryList
              groupedSessions={groupedSessions}
              onDelete={handleDeleteClick}
              onDownload={handleDownload}
              onCopySummary={handleCopySummary}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              selectionMode={hasSelection}
            />
          ) : (
            <HistoryEmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
          )}
        </div>
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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        trigger="history_limit"
      />
    </PageLayout>
  );
}
