import { useState, useEffect } from 'react';
import { FileDown, LayoutTemplate, AlignLeft, FileText, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@react-pdf/renderer';
import { Modal, Input, Button, Text } from '@/lib';
import { GlassCard } from '@/lib/components/ui/GlassCard/GlassCard';
import { ResultPdfDocument } from './pdf/ResultPdfDocument';
import type { AIConfiguration } from '../../../types/audio';
import { ToggleSwitch } from '@/lib/components/form/ToggleSwitch/ToggleSwitch';

export interface ExportOptions {
  includeSummary: boolean;
  includeTranscript: boolean;
  includeMetadata: boolean;
  template: string;
}

interface ExportPDFDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialFileName: string;
  onExport: (fileName: string, options: ExportOptions) => void;
  isExporting?: boolean;
  summary: string;
  transcript: string;
  config: AIConfiguration;
}

export function ExportPDFDialog({
  isOpen,
  onClose,
  initialFileName,
  onExport,
  isExporting = false,
  summary,
  transcript,
  config,
}: ExportPDFDialogProps) {
  const { t } = useTranslation();

  const TEMPLATES = [
    { id: 'meeting', label: t('export.templates.meeting', 'Meeting'), icon: LayoutTemplate },
    { id: 'lecture', label: t('export.templates.lecture', 'Academic'), icon: FileText },
    { id: 'interview', label: t('export.templates.interview', 'Q&A'), icon: AlignLeft },
    { id: 'generic', label: t('export.templates.generic', 'Standard'), icon: Settings2 },
  ];

  const [fileName, setFileName] = useState(initialFileName);
  const [previewFileName, setPreviewFileName] = useState(initialFileName);

  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(config.contentType || 'generic');

  useEffect(() => {
    const timerId = setTimeout(() => setPreviewFileName(fileName), 400);
    return () => clearTimeout(timerId);
  }, [fileName]);

  const isValid = fileName.trim().length > 0 && (includeSummary || includeTranscript);

  const handleDownload = () => {
    if (!isValid || isExporting) return;
    onExport(fileName.trim(), {
      includeSummary,
      includeTranscript,
      includeMetadata,
      template: selectedTemplate,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDownload();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('header.exportDialogTitle', 'Export PDF')}
      className="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 pt-2">
        {/* Left Panel: Settings */}
        <GlassCard variant="dark" className="p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <Text
              variant="body"
              className="text-white text-sm uppercase tracking-wider font-semibold"
            >
              {t('export.includeSections', 'Include Sections')}
            </Text>

            <ToggleSwitch
              label={t('export.summary', 'Executive Summary')}
              checked={includeSummary}
              onChange={setIncludeSummary}
            />
            <ToggleSwitch
              label={t('export.transcript', 'Full Transcript')}
              checked={includeTranscript}
              onChange={setIncludeTranscript}
            />
            <ToggleSwitch
              label={t('export.metadata', 'Document Metadata')}
              description={t('export.metadataDesc', 'Date, AI Model, Content Type')}
              checked={includeMetadata}
              onChange={setIncludeMetadata}
            />
          </div>

          <div className="space-y-4">
            <Text
              variant="body"
              className="text-white text-sm uppercase tracking-wider font-semibold"
            >
              {t('export.template', 'Template Style')}
            </Text>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-bg-secondary/50 border-white/5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Right Panel: Preview & Actions */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('header.exportFileNamePlaceholder', 'Enter file name...')}
                error={
                  !isValid && !includeSummary && !includeTranscript
                    ? t('export.errorNoSections', 'Select at least one section')
                    : !isValid
                      ? t('header.exportFileNameError', 'File name is required')
                      : undefined
                }
                className="flex-grow"
              />
              <span className="text-sm text-text-secondary shrink-0 font-medium bg-bg-secondary/50 px-3 py-2.5 rounded-md border border-border-subtle">
                .pdf
              </span>
            </div>
          </div>

          <div className="flex-grow bg-neutral-200 dark:bg-neutral-700 rounded-xl overflow-hidden shadow-inner border border-border-subtle min-h-[500px] relative">
            <PDFViewer width="100%" height="100%" className="absolute inset-0 border-none">
              <ResultPdfDocument
                summary={includeSummary ? summary : ''}
                transcript={includeTranscript ? transcript : ''}
                config={{ ...config, contentType: selectedTemplate }}
                fileName={previewFileName}
                includeMetadata={includeMetadata}
              />
            </PDFViewer>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isExporting}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="primary"
              icon={<FileDown className="w-4 h-4" />}
              onClick={handleDownload}
              disabled={!isValid || isExporting}
              className="px-6"
            >
              {isExporting
                ? t('header.exporting', 'Exporting...')
                : t('header.downloadPDF', 'Download PDF')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
