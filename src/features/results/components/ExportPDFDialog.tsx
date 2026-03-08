import { useState, useEffect } from 'react';
import { FileDown, LayoutTemplate, AlignLeft, FileText, Settings2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@react-pdf/renderer';
import { Modal, Button } from '@/lib';
import { ResultPdfDocument } from './pdf/ResultPdfDocument';
import type { AIConfiguration } from '../../../types/audio';

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

  const SECTIONS = [
    {
      key: 'summary' as const,
      label: t('export.summary', 'Executive Summary'),
      value: includeSummary,
      onChange: setIncludeSummary,
    },
    {
      key: 'transcript' as const,
      label: t('export.transcript', 'Full Transcript'),
      value: includeTranscript,
      onChange: setIncludeTranscript,
    },
    {
      key: 'metadata' as const,
      label: t('export.metadata', 'Metadata'),
      value: includeMetadata,
      onChange: setIncludeMetadata,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('header.exportDialogTitle', 'Export PDF')}
      className="max-w-md"
    >
      {/* Hidden PDFViewer — needed for download generation, hidden from UI */}
      <div className="hidden" aria-hidden="true">
        <PDFViewer width="100%" height="100%">
          <ResultPdfDocument
            summary={includeSummary ? summary : ''}
            transcript={includeTranscript ? transcript : ''}
            config={{ ...config, contentType: selectedTemplate }}
            fileName={previewFileName}
            includeMetadata={includeMetadata}
          />
        </PDFViewer>
      </div>

      <div className="flex flex-col gap-5 pt-2">
        {/* Accent top bar */}
        <div className="-mx-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* File name */}
        <div className="space-y-1.5">
          <label
            htmlFor="export-filename"
            className="block text-[10px] font-mono font-semibold uppercase tracking-widest text-text-tertiary"
          >
            {t('export.fileName', 'File name')}
          </label>
          <div
            className={`
              flex items-center rounded-lg border bg-bg-surface
              transition-all duration-150
              focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20
              ${!isValid && !fileName.trim() ? 'border-accent-error' : 'border-border'}
            `}
          >
            <input
              id="export-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('header.exportFileNamePlaceholder', 'Enter file name...')}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
            />
            <span className="shrink-0 px-3 py-2.5 text-[12px] font-mono text-text-tertiary border-l border-border select-none">
              .pdf
            </span>
          </div>
          {!isValid && !fileName.trim() && (
            <p className="text-[12px] text-accent-error">
              {t('header.exportFileNameError', 'File name is required')}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Include Sections — toggleable chips */}
        <div className="space-y-2.5">
          <span className="block text-[10px] font-mono font-semibold uppercase tracking-widest text-text-tertiary">
            {t('export.includeSections', 'Include Sections')}
          </span>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(({ key, label, value, onChange }) => (
              <button
                key={key}
                onClick={() => onChange(!value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  border cursor-pointer transition-all duration-150
                  ${
                    value
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border'
                  }
                `}
              >
                {value ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 shrink-0 rounded border border-current opacity-40 inline-block" />
                )}
                {label}
              </button>
            ))}
          </div>
          {!includeSummary && !includeTranscript && (
            <p className="text-[12px] text-accent-error">
              {t('export.errorNoSections', 'Select at least one section')}
            </p>
          )}
        </div>

        {/* Template Style — horizontal pill row */}
        <div className="space-y-2.5">
          <span className="block text-[10px] font-mono font-semibold uppercase tracking-widest text-text-tertiary">
            {t('export.template', 'Template Style')}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`
                    flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border
                    cursor-pointer transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-medium leading-none">{tmpl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Actions */}
        <div className="flex gap-2.5">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 justify-center"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="primary"
            icon={<FileDown className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!isValid || isExporting}
            className="flex-1 justify-center"
          >
            {isExporting
              ? t('header.exporting', 'Exporting...')
              : t('header.downloadPDF', 'Download PDF')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
