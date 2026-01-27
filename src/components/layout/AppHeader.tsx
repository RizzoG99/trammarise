import { Bell, User, FileDown, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard, ThemeToggle, Button } from '@/lib';
import { useTheme } from '../../hooks/useTheme';
import { LanguageSwitcher } from '../../features/i18n/components/LanguageSwitcher';
import { useNavigate } from 'react-router-dom';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(fileName || '');

  const handleSave = () => {
    if (onFileNameChange && editValue.trim()) {
      onFileNameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(fileName || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

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
              <h1 className="text-xl font-semibold text-text-primary">Trammarise</h1>
            </div>

            {/* File Name (Results Page Only) */}
            {fileName && (
              <div className="flex items-center gap-2 flex-1 min-w-0 mx-6">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      autoFocus
                      className="
                        flex-1 px-3 py-1 rounded-lg
                        bg-[var(--color-background)]
                        border border-[var(--color-border)]
                        text-[var(--color-text)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                      "
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSave}
                      className="p-1"
                      aria-label="Save file name"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      className="p-1"
                      aria-label="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-text-secondary truncate">{fileName}</span>
                    {onFileNameChange && (
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="p-1"
                        aria-label="Edit file name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Export Button (Results Page Only) */}
              {onExport && (
                <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('header.export')}</span>
                </Button>
              )}

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  icon={<Bell className="w-5 h-5" fill="currentColor" />}
                  aria-label={t('header.notifications')}
                />
                {/* Notification Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle theme={theme} onThemeChange={setTheme} />

              {/* User Avatar */}
              <Button
                onClick={() => navigate(ROUTES.SETUP)}
                variant="ghost"
                aria-label={t('header.userMenu')}
                icon={
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-light))',
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </header>
  );
}
