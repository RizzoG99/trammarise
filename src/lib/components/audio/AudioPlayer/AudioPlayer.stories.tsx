import type { Meta, StoryObj } from '@storybook/react-vite';
import { AudioPlayer } from './AudioPlayer';

// Minimal silent WAV blob (~0.5s silence)
function silentAudioBlob(): Blob {
  const sampleRate = 8000;
  const numSamples = sampleRate * 0.5;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  return new Blob([buffer], { type: 'audio/wav' });
}

const audioFile = new File([silentAudioBlob()], 'interview-2024-03.wav', { type: 'audio/wav' });

const meta: Meta<typeof AudioPlayer> = {
  title: 'Audio/AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#101622' },
        { name: 'light', value: '#f8fafc' },
      ],
    },
  },
  args: { file: audioFile },
};

export default meta;
type Story = StoryObj<typeof AudioPlayer>;

/** Uncontrolled — upload page style. Just a file, no extras. */
export const Default: Story = {};

/** With file name label shown above controls. */
export const WithFileName: Story = {
  args: { fileName: 'interview-2024-03.wav' },
};

/** Full results page configuration — skip buttons, speed control, file name. */
export const ResultsPage: Story = {
  args: {
    showSkipButtons: true,
    showSpeedControl: true,
    fileName: 'interview-2024-03.wav',
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-bg-glass backdrop-blur-md border-b border-border shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <Story />
        </div>
      </div>
    ),
  ],
};

/** Embedded in a card — upload page FilePreview context. */
export const InCard: Story = {
  decorators: [
    (Story) => (
      <div
        className="p-4 rounded-xl border border-border"
        style={{ backgroundColor: 'var(--color-bg-surface)', maxWidth: 480 }}
      >
        <Story />
      </div>
    ),
  ],
};

/** With a Blob instead of a File. */
export const FromBlob: Story = {
  args: { file: silentAudioBlob() },
};
