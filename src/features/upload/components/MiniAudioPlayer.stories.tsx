import type { Meta, StoryObj } from '@storybook/react-vite';
import { MiniAudioPlayer } from './MiniAudioPlayer';

// Minimal silent audio blob (WAV header, ~0.1s of silence)
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

const meta: Meta<typeof MiniAudioPlayer> = {
  title: 'Upload/MiniAudioPlayer',
  component: MiniAudioPlayer,
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
};

export default meta;
type Story = StoryObj<typeof MiniAudioPlayer>;

const audioFile = new File([silentAudioBlob()], 'sample-recording.wav', { type: 'audio/wav' });

export const Default: Story = {
  args: { file: audioFile },
};

export const InCard: Story = {
  args: { file: audioFile },
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

export const Blob: Story = {
  args: { file: silentAudioBlob() },
};
