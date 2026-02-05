import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AppLayout } from './AppLayout';
import { ROUTES } from '../types/routing';
import { LoadingSpinner } from '@/lib';
import { useStorageMonitor } from '@/hooks/useStorageMonitor';
import { StorageWarning } from '@/components/StorageWarning';

// Lazy load route pages
const UploadRecordPage = lazy(() =>
  import('./routes/UploadRecordPage').then((module) => ({ default: module.UploadRecordPage }))
);
const AudioEditingPage = lazy(() =>
  import('./routes/AudioEditingPage').then((module) => ({ default: module.AudioEditingPage }))
);
const ProcessingPage = lazy(() =>
  import('./routes/ProcessingPage').then((module) => ({ default: module.ProcessingPage }))
);
const ResultsPage = lazy(() =>
  import('./routes/ResultsPage').then((module) => ({ default: module.ResultsPage }))
);
const PreviewPage = lazy(() =>
  import('../pages/PreviewPage').then((module) => ({ default: module.PreviewPage }))
);
const ApiKeySetupPage = lazy(() =>
  import('../pages/ApiKeySetupPage').then((module) => ({ default: module.ApiKeySetupPage }))
);
const PdfPreviewPage = lazy(() =>
  import('../pages/debug/PdfPreviewPage').then((module) => ({ default: module.PdfPreviewPage }))
);
const HistoryPage = lazy(() =>
  import('./routes/HistoryPage').then((module) => ({ default: module.HistoryPage }))
);

// Placeholder for Configuration page (will be enhanced later)
import { Heading, Text, GlassCard } from '@/lib';
import { useTranslation } from 'react-i18next';

function ConfigurationPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-[800px] mx-auto">
      <GlassCard variant="light" className="p-8">
        <Heading level="h1" className="mb-4">
          {t('configPlaceholder.title')}
        </Heading>
        <Text variant="body" color="secondary">
          {t('configPlaceholder.description')}
        </Text>
      </GlassCard>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

import { migrateFromSessionStorage } from '@/utils/session-manager';

function App() {
  const navigate = useNavigate();
  const [showStorageWarning, setShowStorageWarning] = useState(false);

  // Monitor storage usage
  const { quota, warningLevel } = useStorageMonitor({
    checkInterval: 60000, // Check every minute
    onWarning: (level) => {
      if (level === 'high' || level === 'critical') {
        setShowStorageWarning(true);
      }
    },
  });

  // Run migration on mount
  useEffect(() => {
    migrateFromSessionStorage();
  }, []);

  const handleCleanup = () => {
    setShowStorageWarning(false);
    navigate(ROUTES.HISTORY);
  };

  return (
    <>
      {showStorageWarning && quota && (
        <StorageWarning
          level={warningLevel}
          quota={quota}
          onDismiss={() => setShowStorageWarning(false)}
          onCleanup={handleCleanup}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Dev preview route */}
          {import.meta.env.DEV && <Route path={ROUTES.PREVIEW} element={<PreviewPage />} />}
          {/* PDF Debug route */}
          {import.meta.env.DEV && <Route path="/debug/pdf" element={<PdfPreviewPage />} />}

          {/* Main app routes with AppLayout wrapper */}
          <Route element={<AppLayout />}>
            {/* Home/Upload page with split-screen */}
            <Route path={ROUTES.HOME} element={<UploadRecordPage />} />

            {/* Audio editing route */}
            <Route path={ROUTES.AUDIO} element={<AudioEditingPage />} />

            {/* Configuration route */}
            <Route path={ROUTES.CONFIGURE} element={<ConfigurationPlaceholder />} />

            {/* Processing route with step checklist */}
            <Route path={ROUTES.PROCESSING} element={<ProcessingPage />} />

            {/* Results route */}
            <Route path={ROUTES.RESULTS} element={<ResultsPage />} />

            {/* API Key Setup route */}
            <Route path={ROUTES.SETUP} element={<ApiKeySetupPage />} />

            {/* History route */}
            <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          </Route>

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
