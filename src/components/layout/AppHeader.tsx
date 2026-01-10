import { Bell, User } from 'lucide-react';
import { GlassCard, ThemeToggle } from '@/lib';
import { useTheme } from '../../hooks/useTheme';

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md">
      <GlassCard variant="light" className="rounded-none border-x-0 border-t-0">
        <div className="mx-auto px-6 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <h1 className="text-xl font-semibold text-text-primary">
                Trammarise
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                className="p-2 rounded-lg hover:bg-[var(--color-bg-surface)] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-text-secondary" />
                {/* Notification Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle theme={theme} onThemeChange={setTheme} />

              {/* User Avatar */}
              <button
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-surface)] transition-colors"
                aria-label="User menu"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-light))' }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </header>
  );
}
