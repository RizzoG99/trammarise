/**
 * Content-type specific logic for PDF generation
 * Handles extraction and formatting based on content type
 */

import type { ContentType } from '../../types';

export interface TemplateConfig {
  includeActionItems: boolean;
  includeKeyPoints: boolean;
  includeLearningObjectives: boolean;
  includeParticipants: boolean;
  includeQA: boolean;
  includeTopics: boolean;
  disclaimerText?: string;
}

/**
 * Get template configuration for a content type
 */
export function getTemplateForContentType(contentType: ContentType): TemplateConfig {
  const templates: Record<ContentType, TemplateConfig> = {
    meeting: {
      includeActionItems: true,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: true,
      includeQA: false,
      includeTopics: false,
    },
    lecture: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: true,
      includeParticipants: false,
      includeQA: false,
      includeTopics: true,
    },
    interview: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: true,
      includeTopics: false,
    },
    podcast: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: false,
      includeTopics: true,
    },
    'voice-memo': {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: false,
      includeTopics: false,
    },
    'sales-call': {
      includeActionItems: true,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: true,
      includeQA: false,
      includeTopics: false,
    },
    medical: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: false,
      includeTopics: false,
      disclaimerText:
        'This document is for informational purposes only and does not constitute medical advice.',
    },
    legal: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: false,
      includeTopics: false,
      disclaimerText:
        'This document is for informational purposes only and does not constitute legal advice.',
    },
    other: {
      includeActionItems: false,
      includeKeyPoints: true,
      includeLearningObjectives: false,
      includeParticipants: false,
      includeQA: false,
      includeTopics: false,
    },
  };

  return templates[contentType] || templates.other;
}

/**
 * Extract action items from summary text using regex patterns
 */
export function extractActionItems(summary: string): string[] {
  const patterns = [
    /(?:^|\n)[-•*]\s*(?:Action|TODO|Task|Follow-up):\s*(.+?)(?=\n|$)/gi,
    /(?:^|\n)(?:\d+\.)\s*(?:Action|TODO|Task|Follow-up):\s*(.+?)(?=\n|$)/gi,
    /(?:^|\n)[-•*]\s*(.+?)\s*(?:should|must|will|need to)\s+(.+?)(?=\n|$)/gi,
  ];

  const items: string[] = [];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(summary)) !== null) {
      const item = match[1]?.trim() || match[0]?.trim();
      if (item && item.length > 5 && !items.includes(item)) {
        items.push(item);
      }
    }
  });

  return items.slice(0, 10); // Limit to 10 items
}

/**
 * Extract key points from summary text
 */
export function extractKeyPoints(summary: string): string[] {
  const lines = summary.split('\n');
  const keyPoints: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match bullet points
    if (/^[-•*]\s+/.test(trimmed)) {
      const point = trimmed.replace(/^[-•*]\s+/, '').trim();
      if (point.length > 10 && !point.toLowerCase().startsWith('action')) {
        keyPoints.push(point);
      }
    }

    // Match numbered lists
    else if (/^\d+\.\s+/.test(trimmed)) {
      const point = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (point.length > 10 && !point.toLowerCase().startsWith('action')) {
        keyPoints.push(point);
      }
    }
  }

  return keyPoints.slice(0, 15); // Limit to 15 points
}

/**
 * Extract topics from summary text
 */
export function extractTopics(summary: string): string[] {
  const patterns = [
    /(?:Topics? covered|Discussed|Topics?):\s*(.+?)(?=\n\n|\n[A-Z]|$)/is,
    /(?:^|\n)[-•*]\s*(?:Topic|Subject):\s*(.+?)(?=\n|$)/gi,
  ];

  const topics: string[] = [];

  patterns.forEach((pattern) => {
    const match = pattern.exec(summary);
    if (match && match[1]) {
      const topicText = match[1].trim();
      const topicLines = topicText
        .split(/\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 5);
      topics.push(...topicLines);
    }
  });

  return topics.slice(0, 10); // Limit to 10 topics
}

/**
 * Format content type for display
 */
export function formatContentType(contentType: ContentType): string {
  const labels: Record<ContentType, string> = {
    meeting: 'Meeting',
    lecture: 'Lecture',
    interview: 'Interview',
    podcast: 'Podcast',
    'voice-memo': 'Voice Memo',
    'sales-call': 'Sales Call',
    medical: 'Medical',
    legal: 'Legal',
    other: 'Other',
  };

  return labels[contentType] || 'Document';
}
