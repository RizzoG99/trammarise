// File size constants (in bytes)
export const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 25 * 1024 * 1024, // 25 MB
  MAX_SIZE: 50 * 1024 * 1024, // 50 MB
  OPTIMAL_SIZE: 10 * 1024 * 1024, // 10 MB
} as const;

// Audio quality constants
export const AUDIO_QUALITY = {
  WHISPER_SAMPLE_RATE: 16000, // Whisper's optimal sample rate
  MAX_SAMPLE_RATE: 48000,
  TARGET_BITRATE: 128000, // 128 kbps for compressed audio
} as const;

/**
 * Format bytes to human-readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Estimate processing time based on file size
 */
export const estimateProcessingTime = (bytes: number): string => {
  // Rough estimate: 1 MB = ~6 seconds of audio at standard quality
  // Processing time is roughly 0.5x the audio duration
  const audioMinutes = (bytes / (1024 * 1024)) * 0.1;
  const processingMinutes = audioMinutes * 0.5;

  if (processingMinutes < 1) {
    return 'less than 1 minute';
  } else if (processingMinutes < 5) {
    return `${Math.ceil(processingMinutes)} minutes`;
  } else {
    return `${Math.ceil(processingMinutes)} minutes (consider splitting into smaller files)`;
  }
};

/**
 * Check if file size requires warning
 */
export const shouldWarnFileSize = (bytes: number): boolean => {
  return bytes > FILE_SIZE_LIMITS.WARNING_THRESHOLD;
};

/**
 * Check if file size exceeds maximum
 */
export const isFileTooLarge = (bytes: number): boolean => {
  return bytes > FILE_SIZE_LIMITS.MAX_SIZE;
};

/**
 * Get file size status
 */
export interface FileSizeStatus {
  size: number;
  formattedSize: string;
  isOptimal: boolean;
  needsWarning: boolean;
  isTooLarge: boolean;
  estimatedTime: string;
  recommendation: string;
}

export const getFileSizeStatus = (bytes: number): FileSizeStatus => {
  const formattedSize = formatFileSize(bytes);
  const isOptimal = bytes <= FILE_SIZE_LIMITS.OPTIMAL_SIZE;
  const needsWarning = shouldWarnFileSize(bytes);
  const isTooLarge = isFileTooLarge(bytes);
  const estimatedTime = estimateProcessingTime(bytes);

  let recommendation = '';
  if (isTooLarge) {
    recommendation = 'File is too large. Please compress or split it into smaller segments.';
  } else if (needsWarning) {
    recommendation = 'Large file detected. Consider compressing for faster processing.';
  } else if (isOptimal) {
    recommendation = 'File size is optimal for processing.';
  } else {
    recommendation = 'File size is acceptable.';
  }

  return {
    size: bytes,
    formattedSize,
    isOptimal,
    needsWarning,
    isTooLarge,
    estimatedTime,
    recommendation,
  };
};
