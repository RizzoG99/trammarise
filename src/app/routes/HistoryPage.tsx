import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { HistoryFilters } from '@/features/history/components/HistoryFilters';
import { HistoryList } from '@/features/history/components/HistoryList';
import { HistoryEmptyState } from '@/features/history/components/HistoryEmptyState';
import { DeleteConfirmModal } from '@/features/history/components/DeleteConfirmModal';
import { HistoryDashboard } from '@/features/history/components/HistoryDashboard';
import { MigrationBanner } from '@/features/history/components/MigrationBanner';
import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';
import { Snackbar } from '@/lib/components/ui/Snackbar';
import { Button } from '@/lib/components/ui/Button';
import { Trash2, X, Search, Filter, Lock, FileAudio } from 'lucide-react';

import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeModal } from '@/components/marketing/UpgradeModal';

import { Input } from '@/lib/components/ui/Input';
import { Select } from '@/lib/components/ui/Select';
import { GlassCard } from '@/lib/components/ui/GlassCard';
import { EmptyState } from '@/lib/components/ui/EmptyState';

import { useHistorySessions } from '@/features/history/hooks/useHistorySessions';
import { useHistoryFilters } from '@/features/history/hooks/useHistoryFilters';
import { useHistorySelection } from '@/features/history/hooks/useHistorySelection';
import { groupSessionsByDate } from '@/features/history/utils/sessionGrouping';
import type { HistorySession } from '@/features/history/types/history';
import { useTranslation } from 'react-i18next';

export function HistoryPage() {
  const { t } = useTranslation();
  const { isSignedIn } = useUser();
  const { subscription } = useSubscription();
  const userTier = subscription?.tier || 'free';
  const { sessions, isLoading, error, deleteSession, reload, totalCount } = useHistorySessions();
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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
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
        <PageLoader fullHeight />
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
  
  // Check if we need to show the locked history banner
  const showLockedHistoryBanner = userTier === 'free' && totalCount > 5;
  const lockedCount = Math.max(0, totalCount - 5);

  return (
    <PageLayout>
      <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
              {t('history.title')}
            </h1>
            <p className="text-slate-400">
              {t('history.subtitle', { count: totalCount })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Batch Actions will go here */}
          </div>
        </div>

        {/* Filters & Search */}
        <GlassCard variant="glow" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('history.searchPlaceholder')}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900/50 border-white/10 text-slate-300"
             >
                <option value="date-desc">{t('history.sort.newest')}</option>
                <option value="date-asc">{t('history.sort.oldest')}</option>
                <option value="name-asc">{t('history.sort.nameAsc')}</option>
                <option value="name-desc">{t('history.sort.nameDesc')}</option>
             </Select>
             {/* Additional Filters can be added here */}
          </div>
        </GlassCard>

        {/* Selection Bar */}
        {hasSelection && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
              <GlassCard variant="primary" className="p-4 flex items-center justify-between shadow-2xl shadow-blue-900/40 border-blue-500/20 backdrop-blur-xl">
                 <div className="flex items-center gap-4">
                    <span className="text-blue-100 font-medium px-3 py-1 bg-blue-500/20 rounded-full text-sm">
                       {selectedIds.size} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={selectAll} className="text-blue-200 hover:text-white hover:bg-blue-500/20">
                       Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="text-blue-200 hover:text-white hover:bg-blue-500/20">
                       Clear
                    </Button>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button 
                       variant="destructive" 
                       onClick={handleBulkDelete}
                       className="bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30"
                    >
                       <Trash2 className="w-4 h-4 mr-2" />
                       Delete
                    </Button>
                 </div>
              </GlassCard>
           </div>
        )}

        {/* Pro Banner */}
        {showLockedHistoryBanner && (
          <GlassCard variant="primary" className="p-6 border-amber-500/20 bg-amber-500/5">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full text-amber-400">
                   <Lock className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-amber-100">Unlock Full History</h3>
                   <p className="text-amber-200/70">Upgrade to Pro to access all your past recordings forever.</p>
                </div>
                <Button className="ml-auto bg-amber-500 text-black hover:bg-amber-400 border-0" onClick={() => setIsUpgradeModalOpen(true)}>
                   Upgrade Now
                </Button>
             </div>
          </GlassCard>
        )}

        {/* Grid Content */}
        {filteredSessions.length > 0 ? (
           <HistoryList
              groupedSessions={groupedSessions}
              onDelete={handleDeleteClick}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              selectionMode={hasSelection}
           />
        ) : (
           <HistoryEmptyState 
              hasFilters={hasActiveFilters} 
              onClearFilters={clearFilters} 
           />
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
```
