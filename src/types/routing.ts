import type { AudioFile, AIConfiguration, ProcessingResult } from './audio';
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
  language: string; // Language code (e.g., 'en', 'es', 'auto') - supports 50+ languages
  contentType: ContentType;
  processingMode: ProcessingMode;
  noiseProfile?: string; // Audio environment profile
  enableSpeakerDiarization?: boolean; // Speaker identification
  speakersExpected?: number; // Expected number of speakers (2-10)

  // Audio editing fields (set in AudioEditingPage)
  selectionMode?: 'full' | 'selection';
  regionStart?: number;
  regionEnd?: number;

  // Optional fields set later in the flow
  configuration?: AIConfiguration;
  result?: ProcessingResult;

  createdAt: number;
  updatedAt: number;
  audioName?: string;
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
  HISTORY: '/history',
  SETUP: '/setup-api-key',
  DOCS: '/docs',
  PRICING: '/pricing',
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
