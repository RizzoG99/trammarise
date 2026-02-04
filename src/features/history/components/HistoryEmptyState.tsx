import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/lib/components/ui/Button';
import { ROUTES } from '@/types/routing';

interface HistoryEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function HistoryEmptyState({ hasFilters, onClearFilters }: HistoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-primary" />
      </div>

      {hasFilters ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Matching Recordings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            No recordings match your current filters. Try adjusting your search or filter criteria.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Recordings Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            Start by uploading or recording your first audio file to transcribe and summarize.
          </p>
          <Link to={ROUTES.HOME}>
            <Button>Create New Recording</Button>
          </Link>
        </>
      )}
    </div>
  );
}
