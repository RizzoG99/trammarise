import { useUser } from '@/hooks/useUser';
import { useTranslation } from 'react-i18next';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';

export function ProfileTab() {
  const { user } = useUser();
  const { t } = useTranslation();

  if (!user) return null;

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
  const email = user.email ?? null;
  // TODO: restore avatar once COEP/CORS is solved for lh3.googleusercontent.com.
  // Google's avatar CDN doesn't send CORS headers required by COEP (needed for FFmpeg SharedArrayBuffer).
  // const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const createdAt = user.created_at ?? null;

  const infoItems = [
    { icon: UserIcon, label: t('userMenu.profile.name'), value: fullName || 'N/A' },
    { icon: Mail, label: t('userMenu.profile.email'), value: email || 'N/A' },
    {
      icon: Calendar,
      label: t('userMenu.profile.memberSince'),
      value: createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        {/* TODO: show avatar img once COEP/CORS issue with Google CDN is resolved */}
        <span className="w-20 h-20 rounded-full border-2 border-border bg-primary/20 flex items-center justify-center text-2xl font-medium text-primary">
          {(fullName ?? email ?? 'U').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-text-primary truncate">{fullName ?? email}</h3>
          <p className="text-sm text-text-secondary truncate">{email}</p>
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
    </div>
  );
}
