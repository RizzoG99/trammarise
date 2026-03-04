import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Persistent Header */}
      <AppHeader />

      {/* Main content area - rendered by routes */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  );
}
