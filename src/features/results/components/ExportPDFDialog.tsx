import { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@react-pdf/renderer';
import { Modal, Input, Button, Text } from '@/lib';
import { ResultPdfDocument } from './pdf/ResultPdfDocument';
import type { AIConfiguration } from '../../../types/audio';

interface ExportPDFDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialFileName: string;
  onExport: (fileName: string) => void;
  isExporting?: boolean;
  summary: string;
  transcript: string;
  config: AIConfiguration;
}

/**
 * Dialog for configuring and triggering PDF export.
 *
 * Opens when the Export button in the header is clicked.
 * Shows a live PDF preview and lets the user confirm/edit the filename before downloading.
 */
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
  // Modal unmounts children when closed, so useState always initializes fresh on open
  const [fileName, setFileName] = useState(initialFileName);
  // Debounced filename for the preview to avoid thrashing while the user types
  const [previewFileName, setPreviewFileName] = useState(initialFileName);

  useEffect(() => {
    const timerId = setTimeout(() => setPreviewFileName(fileName), 400);
    return () => clearTimeout(timerId);
  }, [fileName]);

  const isValid = fileName.trim().length > 0;

  const handleDownload = () => {
    if (!isValid || isExporting) return;
    onExport(fileName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDownload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('header.exportDialogTitle', 'Export PDF')}>
      <div className="space-y-6 pt-2">
        {/* PDF Preview */}
        <div className="w-full h-[500px] border border-[var(--color-border)] rounded-lg overflow-hidden">
          <PDFViewer width="100%" height="100%">
            <ResultPdfDocument
              summary={summary}
              transcript={transcript}
              config={config}
              fileName={previewFileName}
            />
          </PDFViewer>
        </div>

        {/* Filename field */}
        <div className="space-y-2">
          <Text variant="caption" color="secondary" className="block font-medium">
            {t('header.exportFileName', 'File name')}
          </Text>
          <div className="flex items-center gap-2">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('header.exportFileNamePlaceholder', 'Enter file name...')}
              error={
                !isValid ? t('header.exportFileNameError', 'File name is required') : undefined
              }
            />
            <span className="text-sm text-text-secondary shrink-0">.pdf</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="primary"
            icon={<FileDown className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!isValid || isExporting}
            className="flex items-center gap-2"
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
