import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AIConfiguration } from '../../../../types/audio';
import { MarkdownToPdf } from './MarkdownToPdf';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metadata: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 8,
  },
});

interface ResultPdfDocumentProps {
  summary: string;
  transcript: string;
  config: AIConfiguration;
  fileName: string;
}

/**
 * PDF Document component using @react-pdf/renderer.
 * Renders the summary (with remark-based markdown parsing) and transcript.
 */
export function ResultPdfDocument({
  summary,
  transcript,
  config,
  fileName,
}: ResultPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{fileName || 'Trammarise Summary'}</Text>
          <Text style={styles.metadata}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.metadata}>Type: {config.contentType}</Text>
          <Text style={styles.metadata}>Model: {config.model}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <MarkdownToPdf content={summary} />
        </View>

        {/* Transcript Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Transcript</Text>
          <Text style={styles.paragraph}>{transcript}</Text>
        </View>
      </Page>
    </Document>
  );
}
