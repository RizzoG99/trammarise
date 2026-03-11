// src/features/user-menu/components/UserMenuTrigger.tsx
import { ChevronDown } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
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

  // TODO: restore avatar once COEP/CORS is solved for lh3.googleusercontent.com.
  // Google's avatar CDN doesn't send CORS headers, so COEP (required for FFmpeg
  // SharedArrayBuffer) blocks the image. Options: proxy via Supabase Storage or
  // an Edge Function, or serve avatars from a COEP-exempt subdomain.
  //
  // const [avatarError, setAvatarError] = useState(false);
  // const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  // const showAvatar = avatarUrl && !avatarError;
  //
  // {showAvatar ? (
  //   <img
  //     src={avatarUrl}
  //     alt={fullName}
  //     crossOrigin="anonymous"
  //     onError={() => setAvatarError(true)}
  //     className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-border"
  //   />
  // ) : ( ... initials ... )}

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'User';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1 rounded-full border border-transparent hover:border-border hover:bg-bg-surface/70 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label="User menu"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <TierBadge tier={tier} />
      <span className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-border bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
        {fullName.charAt(0).toUpperCase()}
      </span>
      <ChevronDown
        className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
