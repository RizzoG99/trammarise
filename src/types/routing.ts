import type { AudioFile, AIConfiguration, ProcessingResult } from './audio';

/**
 * Session data stored in sessionStorage
 * Keyed by sessionId for persistence across page refreshes
 */
export interface SessionData {
  sessionId: string;
  audioFile: AudioFile;
  contextFiles: File[];
  configuration?: AIConfiguration;
  result?: ProcessingResult;
  createdAt: number;
  updatedAt: number;
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
