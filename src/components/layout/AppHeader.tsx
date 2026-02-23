import { FileDown, AudioWaveform } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SignInButton, useUser } from '@clerk/clerk-react';
import { ThemeToggle, Button, Input } from '@/lib';
import { useTheme } from '../../hooks/useTheme';
import { LanguageSwitcher } from '../../features/i18n/components/LanguageSwitcher';
import { CustomUserMenu } from '../../features/user-menu';
import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '@/types/routing';
import { useHeader } from '../../hooks/useHeader';

export function AppHeader() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useUser();
  // Consume global header context
  const { fileName, setFileName, onExport } = useHeader();

  // Local state for input field to avoid jitter, syncs with context on blur/enter or debounce could be used
  const [editValue, setEditValue] = useState(fileName);

  // Sync local state when context changes (e.g. initial load)
  useEffect(() => {
    setEditValue(fileName);
  }, [fileName]);

  const handleBlur = () => {
    if (editValue.trim()) {
      setFileName(editValue.trim());
    } else {
      setEditValue(fileName); // Revert if empty
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-glass backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + File Name */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
              <div className="size-8 flex items-center justify-center bg-primary rounded text-white group-hover:bg-primary-hover transition-colors">
                <AudioWaveform className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-text-primary group-hover:text-primary transition-colors">
                Trammarise
              </h1>
            </Link>

            {/* File Name (Results Page Only - presence of onExport implies "Results Mode" or similar context) */}
            {onExport && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="Enter file name..."
                    className="w-[300px]"
                    error={!editValue.trim() ? 'File name is required' : undefined}
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

          {/* Center Section: Navigation - Only show when authenticated */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-6">
              <NavLink
                to={ROUTES.HISTORY}
                className={({ isActive }) => `
                  px-3 py-1 text-sm font-medium border-b-2 transition-colors duration-200
                  ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }
                `}
              >
                {t('nav.history')}
              </NavLink>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Export Button (Results Page Only) */}
            {onExport && (
              <Button
                variant="outline"
                icon={<FileDown className="w-4 h-4" />}
                onClick={onExport}
                className="flex items-center gap-2"
                disabled={!editValue.trim()}
              >
                {t('header.export')}
              </Button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onThemeChange={setTheme} />

            {/* Authentication - MOVED TO LAST */}
            {isSignedIn ? (
              <CustomUserMenu />
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                  aria-label="Select language"
                >
                  <span className="text-sm font-medium">{t('auth.signIn')}</span>
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
