import { useUser } from '@clerk/clerk-react';
import { TierBadge } from './TierBadge';
import type { SubscriptionTier } from '@/context/subscription-types';

interface UserMenuTriggerProps {
  tier: SubscriptionTier;
  onClick: () => void;
  isOpen: boolean;
}

export function UserMenuTrigger({ tier, onClick, isOpen }: UserMenuTriggerProps) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className="relative focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
      aria-label="User menu"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <div className="relative">
        <img
          src={user.imageUrl}
          alt={user.fullName || 'User avatar'}
          className="w-8 h-8 rounded-full border-2 border-transparent hover:border-primary transition-colors"
        />
        <TierBadge tier={tier} />
      </div>
    </button>
  );
}
