import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

/**
 * Feature gate hook for tier-based access control
 *
 * @param feature - Feature key to check (must match features in TIER_FEATURES)
 * @returns Object with hasAccess boolean and upgrade function
 *
 * @example
 * const { hasAccess, upgrade } = useFeatureGate('team-collaboration');
 *
 * if (!hasAccess) {
 *   return <UpgradePrompt onUpgrade={upgrade} />;
 * }
 */
export function useFeatureGate(feature: string): {
  hasAccess: boolean;
  upgrade: () => void;
} {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();

  const hasAccess = hasFeature(feature);

  function upgrade() {
    navigate('/pricing');
  }

  return { hasAccess, upgrade };
}
