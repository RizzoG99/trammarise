import { ChevronDown } from 'lucide-react';
import { useUser } from '@clerk/react';
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
      className="flex items-center gap-2 px-2 py-1 rounded-full border border-transparent hover:border-border hover:bg-bg-surface/70 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label="User menu"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <TierBadge tier={tier} />
      <img
        src={user.imageUrl}
        alt={user.fullName || 'User avatar'}
        className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-border"
      />
      <ChevronDown
        className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
