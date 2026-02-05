import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Text } from '@/lib';
import { AppHeader } from '@/components/layout/AppHeader';
export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Persistent Header */}
      <AppHeader />

      {/* Main content area - rendered by routes */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-text-tertiary text-sm border-t border-bg-tertiary mt-auto">
        <Text variant="small" color="tertiary" as="p" className="m-0">
          {t('footer.copyright')}
        </Text>
      </footer>
    </div>
  );
}
