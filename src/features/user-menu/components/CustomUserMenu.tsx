import { useSubscription } from '@/context/SubscriptionContext';
import { UserMenuTrigger } from './UserMenuTrigger';
import { UserMenuDropdown } from './UserMenuDropdown';
import { ManageAccountModal } from './ManageAccountModal';
import { useUserMenu } from '../hooks/useUserMenu';

export function CustomUserMenu() {
  const { subscription, isSubscribed } = useSubscription();
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    isModalOpen,
    activeTab,
    setActiveTab,
    openModal,
    closeModal,
  } = useUserMenu();

  if (!subscription) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <UserMenuTrigger
          tier={subscription.tier}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          isOpen={isDropdownOpen}
        />

        {isDropdownOpen && (
          <UserMenuDropdown
            isSubscribed={isSubscribed}
            onNavigateToModal={openModal}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      <ManageAccountModal
        isOpen={isModalOpen}
        activeTab={activeTab}
        onClose={closeModal}
        onTabChange={setActiveTab}
      />
    </>
  );
}
