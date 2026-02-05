import { FileDown, AudioWaveform } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, Button } from '@/lib';
import { useTheme } from '../../hooks/useTheme';
import { LanguageSwitcher } from '../../features/i18n/components/LanguageSwitcher';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/types/routing';

/**
 * Props for AppHeader component
 */
interface AppHeaderProps {
  /** Optional: File name for results page (editable) */
  fileName?: string;
  /** Optional: Handler when file name is edited */
  onFileNameChange?: (newName: string) => void;
  /** Optional: Handler for export button */
  onExport?: () => void;
}

export function AppHeader({ fileName, onFileNameChange, onExport }: AppHeaderProps = {}) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [editValue, setEditValue] = useState(fileName || '');

  const isHistoryPage = location.pathname === ROUTES.HISTORY;
  const isSettingsPage = location.pathname === ROUTES.SETUP;

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-glass backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + File Name */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="size-8 flex items-center justify-center bg-primary rounded text-white cursor-pointer"
                onClick={() => navigate(ROUTES.HOME)}
              >
                <AudioWaveform className="w-5 h-5" />
              </div>
              <h1
                className="text-xl font-bold tracking-tight text-text-primary cursor-pointer"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Trammarise
              </h1>
            </div>

            {/* File Name (Results Page Only) */}
            {fileName && onFileNameChange && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditValue(value);
                      onFileNameChange(value.trim());
                    }}
                    className={`
                      px-3 py-1 rounded-lg
                      bg-bg-primary
                      border ${!editValue.trim() ? 'border-accent-error' : 'border-border'}
                      text-text-primary
                      text-sm
                      focus:outline-none focus:ring-2 ${!editValue.trim() ? 'focus:ring-accent-error' : 'focus:ring-primary'}
                    `}
                    style={{ width: '300px' }}
                    placeholder="Enter file name..."
                  />
                  <span className="text-sm text-text-secondary">.pdf</span>
                </div>
                <div className="h-4">
                  {!editValue.trim() && (
                    <span className="text-xs text-accent-error">File name is required</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center Section: Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: t('nav.history'), path: ROUTES.HISTORY, active: isHistoryPage },
              { label: t('nav.settings'), path: ROUTES.SETUP, active: isSettingsPage },
            ].map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  px-3 py-1 text-sm font-medium border-b-2 transition-colors duration-200
                  ${
                    tab.active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Export Button (Results Page Only) */}
            {onExport && (
              <Button
                variant="outline"
                icon={<FileDown className="w-4 h-4" />}
                onClick={onExport}
                className="flex items-center gap-2"
                disabled={!!(fileName && !editValue.trim())}
              >
                {t('header.export')}
              </Button>
            )}

            {/* Notifications - Hidden until implemented
            <div className="relative">
              <Button
                variant="ghost"
                icon={<Bell className="w-5 h-5" fill="currentColor" />}
                aria-label={t('header.notifications')}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
            </div>
            */}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
      </div>
    </header>
  );
}
