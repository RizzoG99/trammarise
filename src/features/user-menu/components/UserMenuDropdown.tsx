// src/features/user-menu/components/UserMenuDropdown.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Key, CreditCard, LogOut, Sparkles, History } from 'lucide-react';
import { clearApiConfig } from '@/utils/session-storage';
import { deleteSavedApiKey } from '@/utils/api';
import { supabaseClient } from '@/lib/supabase/client';
import { ROUTES } from '@/types/routing';

interface UserMenuDropdownProps {
  isSubscribed: boolean;
  onClose: () => void;
}

export function UserMenuDropdown({ isSubscribed, onClose }: UserMenuDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      clearApiConfig();
      await deleteSavedApiKey();
    } catch (error) {
      console.error('Error clearing API keys on logout:', error);
    }
    await supabaseClient.auth.signOut();
    onClose();
  };

  const navigateTo = (section: string) => {
    navigate(`${ROUTES.ACCOUNT}?section=${section}`);
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: t('userMenu.menuItems.profile', 'Profile Settings'),
      action: () => navigateTo('profile'),
    },
    {
      icon: Key,
      label: t('userMenu.menuItems.apiKeys', 'API Keys'),
      action: () => navigateTo('apiKeys'),
    },
    {
      icon: CreditCard,
      label: isSubscribed
        ? t('userMenu.menuItems.billing', 'Usage & Billing')
        : t('userMenu.menuItems.usage', 'Usage'),
      action: () => navigateTo('plan'),
    },
  ];

  if (!isSubscribed) {
    menuItems.push({
      icon: Sparkles,
      label: t('userMenu.menuItems.pricing', 'Pricing'),
      action: () => {
        navigate(ROUTES.PRICING);
        onClose();
      },
    });
  }

  return (
    <div
      role="menu"
      aria-label={t('userMenu.ariaLabel')}
      className="absolute right-0 mt-2 w-56 py-2 bg-bg-surface border border-border rounded-lg shadow-xl z-50 backdrop-blur-md animate-dropdown-enter"
    >
      <button
        type="button"
        role="menuitem"
        className="md:hidden w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-hover transition-colors"
        onClick={() => {
          navigate(ROUTES.HISTORY);
          onClose();
        }}
      >
        <History className="w-4 h-4" />
        <span>{t('nav.history', 'History')}</span>
      </button>
      <div className="md:hidden my-1 border-t border-border" />
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
      <div className="my-1 border-t border-border" />
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
