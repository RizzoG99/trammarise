import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RecordButton, PauseButton, StopButton } from './RecordingButtons';

const meta: Meta<typeof RecordButton> = {
  title: 'Core UI/RecordingButtons',
  component: RecordButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Audio recording control buttons with states and animations. Includes RecordButton, PauseButton, and StopButton components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecordButton>;

/**
 * Default record button ready to start recording.
 * Features pulse ring animation and primary color.
 */
export const RecordButtonDefault: Story = {
  name: 'Record Button - Default',
  args: {
    onClick: fn(),
  },
};

/**
 * Record button in recording state.
 * Disabled and grayed out with smaller size.
 */
export const RecordButtonRecording: Story = {
  name: 'Record Button - Recording',
  args: {
    onClick: fn(),
    isRecording: true,
  },
};

/**
 * Record button in disabled state.
 */
export const RecordButtonDisabled: Story = {
  name: 'Record Button - Disabled',
  args: {
    onClick: fn(),
    disabled: true,
  },
};

/**
 * Pause button ready to pause recording.
 */
export const PauseButtonDefault: Story = {
  name: 'Pause Button - Default',
  render: () => <PauseButton onClick={() => console.log('Pause clicked')} />,
};

/**
 * Pause button in paused state (shows resume icon).
 */
export const PauseButtonPaused: Story = {
  name: 'Pause Button - Paused',
  render: () => <PauseButton onClick={() => console.log('Resume clicked')} isPaused={true} />,
};

/**
 * Pause button in disabled state.
 */
export const PauseButtonDisabled: Story = {
  name: 'Pause Button - Disabled',
  render: () => <PauseButton onClick={() => console.log('Pause clicked')} disabled={true} />,
};

/**
 * Stop button ready to stop recording.
 */
export const StopButtonDefault: Story = {
  name: 'Stop Button - Default',
  render: () => <StopButton onClick={() => console.log('Stop clicked')} />,
};

/**
 * Stop button in disabled state.
 */
export const StopButtonDisabled: Story = {
  name: 'Stop Button - Disabled',
  render: () => <StopButton onClick={() => console.log('Stop clicked')} disabled={true} />,
};

/**
 * All recording buttons together in default states.
 */
export const AllButtonsDefault: Story = {
  name: 'All Buttons - Default',
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <RecordButton onClick={() => console.log('Record')} />
      <PauseButton onClick={() => console.log('Pause')} />
      <StopButton onClick={() => console.log('Stop')} />
    </div>
  ),
};

/**
 * Recording workflow: Record button disabled, Pause and Stop active.
 */
export const RecordingWorkflow: Story = {
  name: 'Workflow - Recording',
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <RecordButton onClick={() => {}} isRecording={true} />
      <PauseButton onClick={() => console.log('Pause')} />
      <StopButton onClick={() => console.log('Stop')} />
    </div>
  ),
};

/**
 * Paused workflow: Record button disabled, Pause shows resume, Stop active.
 */
export const PausedWorkflow: Story = {
  name: 'Workflow - Paused',
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <RecordButton onClick={() => {}} isRecording={true} />
      <PauseButton onClick={() => console.log('Resume')} isPaused={true} />
      <StopButton onClick={() => console.log('Stop')} />
    </div>
  ),
};

/**
 * All buttons disabled.
 */
export const AllButtonsDisabled: Story = {
  name: 'All Buttons - Disabled',
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <RecordButton onClick={() => {}} disabled={true} />
      <PauseButton onClick={() => {}} disabled={true} />
      <StopButton onClick={() => {}} disabled={true} />
    </div>
  ),
};

/**
 * Real-world recording panel example.
 */
export const RecordingPanel: Story = {
  name: 'Example - Recording Panel',
  render: () => (
    <div className="max-w-md mx-auto p-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Audio Recording
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Recording: 00:42</p>
        </div>

        {/* Waveform Placeholder */}
        <div className="h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg mb-6 flex items-center justify-center">
          <div className="flex gap-1 items-end h-16">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex gap-4 items-center justify-center">
          <RecordButton onClick={() => {}} isRecording={true} />
          <PauseButton onClick={() => console.log('Pause')} />
          <StopButton onClick={() => console.log('Stop')} />
        </div>
      </div>
    </div>
  ),
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      {/* Light Mode */}
      <div className="bg-white p-8 rounded-lg">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Light Mode</h4>
        <div className="flex gap-4 items-center justify-center">
          <RecordButton onClick={() => {}} />
          <PauseButton onClick={() => {}} />
          <StopButton onClick={() => {}} />
        </div>
      </div>

      {/* Dark Mode */}
      <div className="dark bg-slate-900 p-8 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-4">Dark Mode</h4>
        <div className="flex gap-4 items-center justify-center">
          <RecordButton onClick={() => {}} />
          <PauseButton onClick={() => {}} />
          <StopButton onClick={() => {}} />
        </div>
      </div>
    </div>
  ),
};
