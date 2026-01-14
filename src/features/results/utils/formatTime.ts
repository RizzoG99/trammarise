/**
 * Format seconds into MM:SS or HH:MM:SS format
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "12:45" or "1:23:45")
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  // Format: HH:MM:SS if hours > 0, otherwise MM:SS
  if (hours > 0) {
    return hours + ':' + padZero(minutes) + ':' + padZero(secs);
  }

  return minutes + ':' + padZero(secs);
}
