import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import type { AIConfiguration } from '../../../../../types/audio';
import { MarkdownToPdf } from '../MarkdownToPdf';
import { pdfStyles as styles } from '../pdfStyles';

export interface PdfTemplateProps {
  summary: string;
  transcript: string;
  config: AIConfiguration;
  fileName: string;
  tier?: 'free' | 'pro' | 'team';
  includeMetadata?: boolean;
}

const Watermark = ({ tier }: { tier?: 'free' | 'pro' | 'team' }) => {
  if (tier !== 'free') return null;
  return (
    <Text style={styles.watermark} fixed>
      Created with Trammarise Free
    </Text>
  );
};

// Helper to format date
const formatDate = () =>
  new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Default Template - Generic clean layout
 */
export const DefaultTemplate: React.FC<PdfTemplateProps> = ({
  summary,
  transcript,
  config,
  fileName,
  tier,
  includeMetadata,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark tier={tier} />
      <View style={styles.header}>
        <Text style={styles.title}>{fileName || 'Trammarise Summary'}</Text>
        {includeMetadata !== false && (
          <>
            <View style={styles.metadataRow}>
              <Text style={styles.metadata}>Date: {formatDate()}</Text>
              <Text style={styles.metadata}>Type: {config.contentType}</Text>
            </View>
            <Text style={styles.metadata}>Model: {config.model}</Text>
          </>
        )}
      </View>

      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <MarkdownToPdf content={summary} />
        </View>
      )}

      {transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <Text style={styles.paragraph}>{transcript}</Text>
        </View>
      )}

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

/**
 * Meeting Template - Emphasizes Action Items and Decisions
 */
export const MeetingTemplate: React.FC<PdfTemplateProps> = ({
  summary,
  transcript,
  config,
  fileName,
  tier,
  includeMetadata,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark tier={tier} />
      <View style={[styles.header, { borderBottomColor: '#2563eb' }]}>
        <Text style={[styles.subtitle, { color: '#2563eb', marginBottom: 0 }]}>MEETING REPORT</Text>
        <Text style={styles.title}>{fileName || 'Meeting Notes'}</Text>
        {includeMetadata !== false && (
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Text style={styles.metadata}>📅 {formatDate()}</Text>
            <Text style={styles.metadata}>🤖 {config.model}</Text>
          </View>
        )}
      </View>

      {summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#2563eb' }]}>Meeting Summary</Text>
          <MarkdownToPdf content={summary} />
        </View>
      )}

      {transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Discussion</Text>
          <Text style={styles.paragraph}>{transcript}</Text>
        </View>
      )}

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `Meeting Report • ${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

/**
 * Lecture Template - Academic focus
 */
export const LectureTemplate: React.FC<PdfTemplateProps> = ({
  summary,
  transcript,
  config,
  fileName,
  tier,
  includeMetadata,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark tier={tier} />
      <View style={[styles.header, { borderBottomColor: '#7c3aed' }]}>
        <Text style={[styles.subtitle, { color: '#7c3aed' }]}>ACADEMIC NOTE</Text>
        <Text style={styles.title}>{fileName || 'Lecture Notes'}</Text>
        {includeMetadata !== false && (
          <Text style={styles.metadata}>
            Recorded: {formatDate()} • Model: {config.model}
          </Text>
        )}
      </View>

      {summary && (
        <>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>💡 Study Guide</Text>
            <Text style={[styles.metadata, { fontStyle: 'italic' }]}>
              Review the summary below for key concepts and topics covered in this session.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#7c3aed' }]}>Key Concepts & Summary</Text>
            <MarkdownToPdf content={summary} />
          </View>
        </>
      )}

      {transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verbatim Transcript</Text>
          <Text style={styles.paragraph}>{transcript}</Text>
        </View>
      )}

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) =>
          `Trammarise Study Notes • ${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </Page>
  </Document>
);

/**
 * Interview Template - Q&A focus
 */
export const InterviewTemplate: React.FC<PdfTemplateProps> = ({
  summary,
  transcript,
  config,
  fileName,
  tier,
  includeMetadata,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Watermark tier={tier} />
      <View style={[styles.header, { borderBottomStyle: 'dashed' }]}>
        <Text style={styles.title}>{fileName || 'Interview Transcript'}</Text>
        {includeMetadata !== false && (
          <Text style={styles.metadata}>
            Date: {formatDate()} | AI: {config.model}
          </Text>
        )}
      </View>

      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <MarkdownToPdf content={summary} />
        </View>
      )}

      {transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Q&A Transcript</Text>
          <Text style={styles.paragraph}>{transcript}</Text>
        </View>
      )}

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `Interview Record • ${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);
