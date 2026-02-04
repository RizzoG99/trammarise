import type { AudioFile, AIConfiguration, ProcessingResult } from './audio';
import type { LanguageCode } from './languages';
import type { ContentType } from './content-types';
import type { ProcessingMode } from '../features/configuration/components/ProcessingModeSelector';

/**
 * Session data stored in sessionStorage
 * Keyed by sessionId for persistence across page refreshes
 */
export interface SessionData {
  sessionId: string;
  audioFile: AudioFile;
  contextFiles: File[];

  // Configuration fields captured during upload/record flow
  language: LanguageCode;
  contentType: ContentType;
  processingMode: ProcessingMode;
  noiseProfile?: string; // Audio environment profile

  // Audio editing fields (set in AudioEditingPage)
  selectionMode?: 'full' | 'selection';
  regionStart?: number;
  regionEnd?: number;

  // Optional fields set later in the flow
  configuration?: AIConfiguration;
  result?: ProcessingResult;

  createdAt: number;
  updatedAt: number;
  fileSizeBytes?: number;
}

/**
 * Route parameters extracted from URL
 */
export interface RouteParams {
  sessionId: string;
}

/**
 * Route paths as constants for type-safe navigation
 */
export const ROUTES = {
  HOME: '/',
  AUDIO: '/audio/:sessionId',
  CONFIGURE: '/configure/:sessionId',
  PROCESSING: '/processing/:sessionId',
  RESULTS: '/results/:sessionId',
  SETUP: '/setup-api-key',
  HISTORY: '/history',
  DOCS: '/docs',
  PREVIEW: '/preview', // Dev only
} as const;

/**
 * Helper to build route paths with parameters
 */
export function buildRoutePath(route: string, params: Record<string, string>): string {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}
