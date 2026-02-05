import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/lib/components/ui/Button';
import { ROUTES } from '@/types/routing';

interface HistoryEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

import { useTranslation } from 'react-i18next';

export function HistoryEmptyState({ hasFilters, onClearFilters }: HistoryEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-primary" />
      </div>

      {hasFilters ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('history.empty.noMatchingTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            {t('history.empty.noMatchingDesc')}
          </p>
          <Button onClick={onClearFilters} variant="outline">
            {t('history.empty.clearFilters')}
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('history.empty.noRecordingsTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            {t('history.empty.noRecordingsDesc')}
          </p>
          <Link to={ROUTES.HOME}>
            <Button>{t('history.empty.createAction')}</Button>
          </Link>
        </>
      )}
    </div>
  );
}
