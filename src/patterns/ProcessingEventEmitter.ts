import { EventEmitter } from './EventEmitter';
import type { ProcessingStateData } from '../types/audio';

/**
 * Processing event types
 */
export interface ProcessingEvents {
  'progress': ProcessingProgressEvent;
  'step-change': ProcessingStepChangeEvent;
  'complete': ProcessingCompleteEvent;
  'error': ProcessingErrorEvent;
  'cancel': ProcessingCancelEvent;
}

/**
 * Progress update event
 */
export interface ProcessingProgressEvent {
  step: ProcessingStateData['step'];
  progress: number;
  message?: string;
}

/**
 * Step change event
 */
export interface ProcessingStepChangeEvent {
  previousStep: ProcessingStateData['step'];
  currentStep: ProcessingStateData['step'];
}

/**
 * Processing complete event
 */
export interface ProcessingCompleteEvent {
  transcript: string;
  summary: string;
  duration: number; // Processing duration in milliseconds
}

/**
 * Processing error event
 */
export interface ProcessingErrorEvent {
  error: Error;
  step: ProcessingStateData['step'];
  recoverable: boolean;
}

/**
 * Processing cancel event
 */
export interface ProcessingCancelEvent {
  step: ProcessingStateData['step'];
  reason?: string;
}

/**
 * Specialized event emitter for audio processing workflow
 * Provides type-safe event handling for processing stages
 */
export class ProcessingEventEmitter extends EventEmitter<ProcessingEvents> {
  private startTime: number | null = null;
  private currentStep: ProcessingStateData['step'] = 'loading';

  /**
   * Start processing and record start time
   */
  start(): void {
    this.startTime = Date.now();
    this.currentStep = 'loading';
  }

  /**
   * Update progress for current step
   */
  updateProgress(progress: number, message?: string): void {
    this.emit('progress', {
      step: this.currentStep,
      progress: Math.min(100, Math.max(0, progress)),
      message,
    });
  }

  /**
   * Change to a new processing step
   */
  changeStep(newStep: ProcessingStateData['step']): void {
    const previousStep = this.currentStep;
    this.currentStep = newStep;
    this.emit('step-change', { previousStep, currentStep: newStep });
  }

  /**
   * Mark processing as complete
   */
  complete(transcript: string, summary: string): void {
    const duration = this.startTime ? Date.now() - this.startTime : 0;
    this.emit('complete', { transcript, summary, duration });
    this.reset();
  }

  /**
   * Report a processing error
   */
  error(error: Error, recoverable: boolean = false): void {
    this.emit('error', { error, step: this.currentStep, recoverable });
    if (!recoverable) {
      this.reset();
    }
  }

  /**
   * Cancel processing
   */
  cancel(reason?: string): void {
    this.emit('cancel', { step: this.currentStep, reason });
    this.reset();
  }

  /**
   * Reset the emitter state
   */
  private reset(): void {
    this.startTime = null;
    this.currentStep = 'loading';
  }

  /**
   * Get current step
   */
  getCurrentStep(): ProcessingStateData['step'] {
    return this.currentStep;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedTime(): number {
    return this.startTime ? Date.now() - this.startTime : 0;
  }
}

// Export singleton instance
export const processingEventEmitter = new ProcessingEventEmitter();
