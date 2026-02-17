import { useTranslation } from 'react-i18next';
import { Modal } from '@/lib';
import { ProfileTab } from './ProfileTab';
import { ApiKeysTab } from './ApiKeysTab';
import { UsageTab } from './UsageTab';
import type { ModalTab } from '../hooks/useUserMenu';

interface ManageAccountModalProps {
  isOpen: boolean;
  activeTab: ModalTab;
  onClose: () => void;
  onTabChange: (tab: ModalTab) => void;
}

export function ManageAccountModal({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
}: ManageAccountModalProps) {
  const { t } = useTranslation();

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'profile', label: t('userMenu.tabs.profile') },
    { id: 'apiKeys', label: t('userMenu.tabs.apiKeys') },
    { id: 'usage', label: t('userMenu.tabs.usage') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('userMenu.manageAccount')}
      className="max-w-2xl w-full"
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'apiKeys' && <ApiKeysTab />}
        {activeTab === 'usage' && <UsageTab />}
      </div>
    </Modal>
  );
}
