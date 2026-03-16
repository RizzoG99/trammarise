import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { User, Key, Sparkles } from 'lucide-react';
import { GlassCard, Heading } from '@/lib';
import { ProfileTab } from '../user-menu/components/ProfileTab';
import { ApiKeysTab } from '../user-menu/components/ApiKeysTab';
import { UsagePanel } from './components/UsagePanel';

type Section = 'profile' | 'apiKeys' | 'plan';

const VALID_SECTIONS: Section[] = ['profile', 'apiKeys', 'plan'];

export function AccountBillingPage() {
  const { t } = useTranslation();
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
    <div className="bg-bg-primary">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Heading level="h1" className="mb-8">
          {t('account.title')}
        </Heading>

        {/* Mobile horizontal tab bar */}
        <nav
          className="sm:hidden flex border-b border-border mb-6 overflow-x-auto"
          aria-label={t('account.title')}
        >
          {sections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors cursor-pointer shrink-0 min-h-11
                ${
                  activeSection === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary'
                }
              `}
              aria-current={activeSection === id ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Two-column layout (desktop) / stacked (mobile) */}
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Sidebar nav — desktop only */}
          <nav className="hidden sm:block w-48 shrink-0" aria-label={t('account.title')}>
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
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Section content */}
          <div className="flex-1 min-w-0">
            <GlassCard variant="dark" className="p-4 sm:p-6">
              {activeSection === 'profile' && <ProfileTab />}
              {activeSection === 'apiKeys' && <ApiKeysTab />}
              {activeSection === 'plan' && <UsagePanel />}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
