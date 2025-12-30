import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { buildRoutePath, ROUTES } from '../types/routing';

/**
 * Hook for managing route state
 * Extracts sessionId from URL and provides navigation helpers
 */
export function useRouteState() {
  const params = useParams();
  const navigate = useNavigate();

  const sessionId = params.sessionId || null;

  // Navigate to a route with sessionId
  const navigateToRoute = useCallback(
    (route: string, routeSessionId?: string) => {
      const id = routeSessionId || sessionId;
      if (!id) {
        console.error('No sessionId provided for navigation');
        return;
      }

      const path = buildRoutePath(route, { sessionId: id });
      navigate(path);
    },
    [sessionId, navigate]
  );

  // Navigate to specific states
  const goToAudio = useCallback(
    (id?: string) => navigateToRoute(ROUTES.AUDIO, id),
    [navigateToRoute]
  );

  const goToConfigure = useCallback(
    (id?: string) => navigateToRoute(ROUTES.CONFIGURE, id),
    [navigateToRoute]
  );

  const goToProcessing = useCallback(
    (id?: string) => navigateToRoute(ROUTES.PROCESSING, id),
    [navigateToRoute]
  );

  const goToResults = useCallback(
    (id?: string) => navigateToRoute(ROUTES.RESULTS, id),
    [navigateToRoute]
  );

  const goToHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  return {
    sessionId,
    goToAudio,
    goToConfigure,
    goToProcessing,
    goToResults,
    goToHome,
    navigateToRoute,
  };
}
