import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './AppLayout';
import { ROUTES } from '../types/routing';
import { cleanupOldSessions } from '../utils/session-manager';

// Import route pages
import { UploadRecordPage } from './routes/UploadRecordPage';
import { AudioEditingPage } from './routes/AudioEditingPage';
import { ProcessingPage } from './routes/ProcessingPage';
import { ResultsPage } from './routes/ResultsPage';
import { PreviewPage } from '../pages/PreviewPage';

// Placeholder for Configuration page (will be enhanced later)
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { GlassCard } from '../components/ui/GlassCard';

function ConfigurationPlaceholder() {
  return (
    <div className="w-full max-w-[800px] mx-auto">
      <GlassCard variant="light" className="p-8">
        <Heading level="h1" className="mb-4">Configuration</Heading>
        <Text variant="body" color="secondary">
          AI provider selection page - will be enhanced in Phase 3
        </Text>
      </GlassCard>
    </div>
  );
}

function App() {
  // Cleanup old sessions on app mount
  useEffect(() => {
    cleanupOldSessions();
  }, []);

  return (
    <Routes>
      {/* Dev preview route */}
      {import.meta.env.DEV && (
        <Route path={ROUTES.PREVIEW} element={<PreviewPage />} />
      )}

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
      </Route>

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;
