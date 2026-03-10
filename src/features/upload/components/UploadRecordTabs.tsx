import { useState } from 'react';
import type { ReactNode } from 'react';
import { Upload, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UploadRecordTabsProps {
  uploadPanel: ReactNode;
  recordPanel: ReactNode;
}

export function UploadRecordTabs({ uploadPanel, recordPanel }: UploadRecordTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');

  return (
    <>
      {/* Mobile view (< lg): Tabs */}
      <div className="lg:hidden flex flex-col gap-6">
        <div
          role="tablist"
          aria-label={t('home.tabs.ariaLabel', 'Upload or Record Audio')}
          className="relative flex bg-bg-secondary/50 p-1 rounded-xl border border-border-subtle w-full max-w-sm mx-auto"
        >
          {/* Sliding pill */}
          <div
            aria-hidden="true"
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-bg-tertiary shadow-sm transition-transform duration-200 ease-out ${
              activeTab === 'record' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          <button
            role="tab"
            aria-selected={activeTab === 'upload'}
            aria-controls="panel-upload"
            id="tab-upload"
            onClick={() => setActiveTab('upload')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === 'upload'
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Upload className="w-4 h-4" />
            {t('home.tabs.upload', 'Upload File')}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'record'}
            aria-controls="panel-record"
            id="tab-record"
            onClick={() => setActiveTab('record')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === 'record'
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Mic className="w-4 h-4" />
            {t('home.tabs.record', 'Record Audio')}
          </button>
        </div>

        <div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="animate-tab-switch"
        >
          {activeTab === 'upload' ? uploadPanel : recordPanel}
        </div>
      </div>

      {/* Desktop view (>= lg): Side-by-side */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {uploadPanel}
        {recordPanel}
      </div>
    </>
  );
}
