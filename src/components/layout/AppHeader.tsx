import { AudioWaveform } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUser';
import { ThemeToggle } from '@/lib';
import { useTheme } from '../../hooks/useTheme';
import { LanguageSwitcher } from '../../features/i18n/components/LanguageSwitcher';
import { CustomUserMenu } from '../../features/user-menu';
import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '@/types/routing';

export function AppHeader() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useUser();

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
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} onThemeChange={setTheme} />

            {/* Authentication - MOVED TO LAST */}
            {isSignedIn && <CustomUserMenu />}
          </div>
        </div>
      </div>
    </header>
  );
}
