import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-react';
import { User, Key, CreditCard, LogOut, Sparkles } from 'lucide-react';
import type { ModalTab } from '../hooks/useUserMenu';

interface UserMenuDropdownProps {
  isSubscribed: boolean;
  onNavigateToModal: (tab: ModalTab) => void;
  onClose: () => void;
}

export function UserMenuDropdown({
  isSubscribed,
  onNavigateToModal,
  onClose,
}: UserMenuDropdownProps) {
  const { t } = useTranslation();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: t('userMenu.menuItems.profile', 'Profile Settings'),
      action: () => onNavigateToModal('profile'),
    },
    {
      icon: Key,
      label: t('userMenu.menuItems.apiKeys', 'API Keys'),
      action: () => onNavigateToModal('apiKeys'),
    },
    {
      icon: CreditCard,
      label: isSubscribed
        ? t('userMenu.menuItems.billing', 'Usage & Billing')
        : t('userMenu.menuItems.usage', 'Usage'),
      action: () => onNavigateToModal('usage'),
    },
  ];

  // Add upgrade button for free tier
  if (!isSubscribed) {
    menuItems.push({
      icon: Sparkles,
      label: t('userMenu.menuItems.upgrade', 'Upgrade to Pro'),
      action: () => onNavigateToModal('usage'), // Opens usage tab with upgrade CTA
    });
  }

  return (
    <div
      role="menu"
      aria-label={t('userMenu.ariaLabel')}
      className="absolute right-0 mt-2 w-56 py-2 bg-bg-surface border border-border rounded-lg shadow-xl z-50 backdrop-blur-md"
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-hover transition-colors"
            onClick={item.action}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="my-1 border-t border-border" />

      {/* Sign Out */}
      <button
        type="button"
        role="menuitem"
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-error hover:bg-bg-hover transition-colors"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4" />
        <span>{t('userMenu.menuItems.signOut', 'Sign Out')}</span>
      </button>
    </div>
  );
}
