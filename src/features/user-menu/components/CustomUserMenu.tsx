import { useSubscription } from '@/context/SubscriptionContext';
import { UserMenuTrigger } from './UserMenuTrigger';
import { UserMenuDropdown } from './UserMenuDropdown';
import { useUserMenu } from '../hooks/useUserMenu';

export function CustomUserMenu() {
  const { subscription, isSubscribed } = useSubscription();
  const { isDropdownOpen, setIsDropdownOpen, dropdownRef } = useUserMenu();

  if (!subscription) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <UserMenuTrigger
        tier={subscription.tier}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        isOpen={isDropdownOpen}
      />

      {isDropdownOpen && (
        <UserMenuDropdown isSubscribed={isSubscribed} onClose={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}
