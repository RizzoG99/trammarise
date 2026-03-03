import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Key, Sparkles, ArrowLeft } from 'lucide-react';
import { GlassCard, Heading } from '@/lib';
import { ProfileTab } from '../user-menu/components/ProfileTab';
import { ApiKeysTab } from '../user-menu/components/ApiKeysTab';
import { UsageTab } from '../user-menu/components/UsageTab';

type Section = 'profile' | 'apiKeys' | 'plan';

const VALID_SECTIONS: Section[] = ['profile', 'apiKeys', 'plan'];

export function AccountBillingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramSection = searchParams.get('section') as Section | null;
  const initialSection: Section =
    paramSection && VALID_SECTIONS.includes(paramSection) ? paramSection : 'profile';

  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  const sections = [
    { id: 'profile' as Section, icon: User, label: t('account.nav.profile') },
    { id: 'apiKeys' as Section, icon: Key, label: t('account.nav.apiKeys') },
    { id: 'plan' as Section, icon: Sparkles, label: t('account.nav.plan') },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all cursor-pointer"
            aria-label={t('account.back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('account.back')}</span>
          </button>
        </div>

        <Heading level="h1" className="mb-8">
          {t('account.title')}
        </Heading>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* Sidebar nav */}
          <nav className="w-48 flex-shrink-0" aria-label={t('account.title')}>
            <ul className="space-y-1">
              {sections.map(({ id, icon: Icon, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all text-left cursor-pointer
                      ${
                        activeSection === id
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                      }
                    `}
                    aria-current={activeSection === id ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Section content */}
          <div className="flex-1 min-w-0">
            <GlassCard variant="dark" className="p-6">
              {activeSection === 'profile' && <ProfileTab />}
              {activeSection === 'apiKeys' && <ApiKeysTab />}
              {activeSection === 'plan' && <UsageTab />}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
