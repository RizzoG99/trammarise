import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AppLayout } from './AppLayout';
import { ROUTES } from '../types/routing';
import { cleanupOldSessions } from '../utils/session-manager';
import { LoadingSpinner } from '@/lib';

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

// Placeholder for Configuration page (will be enhanced later)
import { Heading, Text, GlassCard } from '@/lib';

function ConfigurationPlaceholder() {
  return (
    <div className="w-full max-w-[800px] mx-auto">
      <GlassCard variant="light" className="p-8">
        <Heading level="h1" className="mb-4">
          Configuration
        </Heading>
        <Text variant="body" color="secondary">
          AI provider selection page - will be enhanced in Phase 3
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

function App() {
  // Cleanup old sessions on app mount
  useEffect(() => {
    cleanupOldSessions();
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dev preview route */}
        {import.meta.env.DEV && <Route path={ROUTES.PREVIEW} element={<PreviewPage />} />}

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
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
