import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';

export function ProfileTab() {
  const { user } = useUser();
  const { t } = useTranslation();

  if (!user) return null;

  const infoItems = [
    { icon: UserIcon, label: t('userMenu.profile.name'), value: user.fullName || 'N/A' },
    {
      icon: Mail,
      label: t('userMenu.profile.email'),
      value: user.primaryEmailAddress?.emailAddress || 'N/A',
    },
    {
      icon: Calendar,
      label: t('userMenu.profile.memberSince'),
      value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <img
          src={user.imageUrl}
          alt={user.fullName || 'User'}
          className="w-20 h-20 rounded-full border-2 border-border"
        />
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{user.fullName}</h3>
          <p className="text-sm text-text-secondary">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
              <Icon className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{item.label}</p>
                <p className="text-sm font-medium text-text-primary">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Managed by Clerk Notice */}
      <p className="text-xs text-text-secondary text-center">
        {t('userMenu.profile.managedByClerk')}
      </p>
    </div>
  );
}
