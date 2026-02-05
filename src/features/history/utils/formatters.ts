/**
 * Formats a timestamp for display in history cards
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string like "Today at 3:45 PM" or "Jan 28, 2026"
 */
export function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp || timestamp <= 0 || isNaN(timestamp)) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();

  // Use calendar-day boundaries for consistent grouping
  const dateDay = new Date(date);
  dateDay.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (dateDay.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  } else if (dateDay.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`;
  } else {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Formats duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "3m 24s" or "1h 15m 30s"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0 || isNaN(seconds)) {
    return '';
  }

  if (seconds === 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Formats file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string like "5.2 MB" or "245 KB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0 || isNaN(bytes)) {
    return '';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(1)} GB`;
  } else if (bytes >= MB) {
    return `${(bytes / MB).toFixed(1)} MB`;
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(1)} KB`;
  } else {
    return `${bytes} B`;
  }
}
