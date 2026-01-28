import type { AIConfiguration } from '../../../../types/audio';
import {
  DefaultTemplate,
  MeetingTemplate,
  LectureTemplate,
  InterviewTemplate,
  type PdfTemplateProps,
} from './templates/PdfTemplates';

interface ResultPdfDocumentProps {
  summary: string;
  transcript: string;
  config: AIConfiguration;
  fileName: string;
}

/**
 * PDF Document component using @react-pdf/renderer.
 * Dispatches to the appropriate template based on content type.
 */
export function ResultPdfDocument({
  summary,
  transcript,
  config,
  fileName,
}: ResultPdfDocumentProps) {
  const props: PdfTemplateProps = { summary, transcript, config, fileName };

  switch (config.contentType) {
    case 'meeting':
    case 'daily-stand-up':
    case 'focus-group':
      return <MeetingTemplate {...props} />;

    case 'lecture':
      return <LectureTemplate {...props} />;

    case 'interview':
    case 'podcast':
      return <InterviewTemplate {...props} />;

    case 'sales-call':
    case 'voice-memo':
    case 'medical-clinical':
    case 'legal':
    default:
      return <DefaultTemplate {...props} />;
  }
}
