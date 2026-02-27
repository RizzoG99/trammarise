import { FileText, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TranscriptTab = 'transcript' | 'diarization';

export interface TranscriptTabBarProps {
  activeTab: TranscriptTab;
  onTabChange: (tab: TranscriptTab) => void;
  hasDiarization: boolean;
}

export function TranscriptTabBar({
  activeTab,
  onTabChange,
  hasDiarization,
}: TranscriptTabBarProps) {
  const { t } = useTranslation();

  if (!hasDiarization) return null;

  return (
    <div className="flex bg-bg-secondary/50 p-1 rounded-xl border border-border-subtle w-full max-w-[400px] mb-4">
      <button
        role="tab"
        aria-selected={activeTab === 'transcript'}
        aria-controls="panel-transcript"
        id="tab-transcript"
        onClick={() => onTabChange('transcript')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'transcript'
            ? 'bg-bg-primary text-text-primary shadow border border-border-subtle'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
        }`}
      >
        <FileText className="w-4 h-4" />
        {t('results.tabs.transcript', 'Transcript')}
      </button>

      <button
        role="tab"
        aria-selected={activeTab === 'diarization'}
        aria-controls="panel-diarization"
        id="tab-diarization"
        onClick={() => onTabChange('diarization')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'diarization'
            ? 'bg-bg-primary text-text-primary shadow border border-border-subtle'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
        }`}
      >
        <Users className="w-4 h-4" />
        {t('results.tabs.diarization', 'Diarization')}
      </button>
    </div>
  );
}
