import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { ClerkProvider, useUser } from '@clerk/react';
import { identifyUser, resetAnalytics } from '../lib/analytics';
import { AppLayout } from './AppLayout';
import { ROUTES } from '../types/routing';
import { WelcomePage } from '../pages/WelcomePage';

import { useStorageMonitor, type StorageWarningLevel } from '@/hooks/useStorageMonitor';
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
const DocsPage = lazy(() =>
  import('../pages/DocsPage').then((module) => ({ default: module.DocsPage }))
);
const PricingPage = lazy(() =>
  import('./routes/PricingPage').then((module) => ({ default: module.PricingPage }))
);
const OnboardingPage = lazy(() =>
  import('./routes/OnboardingPage').then((module) => ({ default: module.OnboardingPage }))
);
const AccountBillingPage = lazy(() =>
  import('./routes/AccountBillingPage').then((module) => ({ default: module.AccountBillingPage }))
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

import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';

import { migrateFromSessionStorage } from '@/utils/session-manager';
import { HeaderProvider } from '@/context/HeaderContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
// ApiKeyOnboardingModal replaced by OnboardingPage route redirect

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY. Authentication features will be disabled.');
}

function AppRoutes() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { needsOnboarding, isCheckingOnboarding } = useOnboarding();
  const navigate = useNavigate();
  const [showStorageWarning, setShowStorageWarning] = useState(false);
  const [clerkTimedOut, setClerkTimedOut] = useState(false);

  // If Clerk's script fails to load (e.g. 530 network error), isLoaded never
  // becomes true. After 10 s we stop showing the spinner and surface an error.
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setClerkTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  const handleStorageWarning = useCallback((level: StorageWarningLevel) => {
    if (level === 'high' || level === 'critical') {
      setShowStorageWarning(true);
    }
  }, []);

  // Monitor storage usage
  const { quota, warningLevel } = useStorageMonitor({
    checkInterval: 60000,
    onWarning: handleStorageWarning,
  });

  // Run migration on mount
  useEffect(() => {
    migrateFromSessionStorage();
  }, []);

  // Identify user in analytics when signed in, reset on sign-out
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      identifyUser(user.id, { email: user.primaryEmailAddress?.emailAddress });
    } else {
      resetAnalytics();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleCleanup = async () => {
    // Implement cleanup logic
    setShowStorageWarning(false);
    navigate(ROUTES.HISTORY);
  };

  if (!isLoaded || isCheckingOnboarding) {
    if (clerkTimedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Authentication service unavailable
          </p>
          <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Could not connect to the authentication service. Please check your internet connection
            and try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors duration-150"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Retry
          </button>
        </div>
      );
    }
    return <PageLoader />;
  }

  // If signed in and needs onboarding, redirect to onboarding page
  if (isSignedIn && needsOnboarding) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Onboarding wizard */}
          <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
          {/* Redirect everything else to onboarding */}
          <Route path="*" element={<Navigate to={ROUTES.ONBOARDING} replace />} />
        </Routes>
      </Suspense>
    );
  }

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

          {/* Authenticated Routes */}
          {isSignedIn ? (
            <>
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

                {/* Documentation route */}
                <Route path={ROUTES.DOCS} element={<DocsPage />} />

                {/* Pricing route */}
                <Route path="/pricing" element={<PricingPage />} />

                {/* Account & Billing route */}
                <Route path={ROUTES.ACCOUNT} element={<AccountBillingPage />} />
              </Route>

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </>
          ) : (
            <>
              {/* Unauthenticated Routes */}
              <Route path="/" element={<WelcomePage />} />

              {/* Redirect any other access to Welcome Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SubscriptionProvider>
        <OnboardingProvider>
          <HeaderProvider>
            <AppRoutes />
          </HeaderProvider>
        </OnboardingProvider>
      </SubscriptionProvider>
    </ClerkProvider>
  );
}

export default App;
