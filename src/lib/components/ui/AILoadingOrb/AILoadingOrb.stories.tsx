import type { Meta, StoryObj } from '@storybook/react-vite';
import { AILoadingOrb } from './AILoadingOrb';

const meta: Meta<typeof AILoadingOrb> = {
  title: 'Core UI/AILoadingOrb',
  component: AILoadingOrb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Animated AI loading orb with multi-layered blob effects, gradient animations, and floating particles. Respects prefers-reduced-motion for accessibility.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AILoadingOrb>;

/**
 * Default AILoadingOrb with 120px size.
 */
export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb />
    </div>
  ),
};

/**
 * Small orb (80px) for compact spaces.
 */
export const Small: Story = {
  render: () => (
    <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb size={80} />
    </div>
  ),
};

/**
 * Medium orb (120px, default size).
 */
export const Medium: Story = {
  render: () => (
    <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb size={120} />
    </div>
  ),
};

/**
 * Large orb (160px) for prominent loading states.
 */
export const Large: Story = {
  render: () => (
    <div className="flex items-center justify-center p-16 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb size={160} />
    </div>
  ),
};

/**
 * Extra large orb (200px) for hero sections.
 */
export const ExtraLarge: Story = {
  render: () => (
    <div className="flex items-center justify-center p-20 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb size={200} />
    </div>
  ),
};

/**
 * All sizes side by side for comparison.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end justify-center gap-8 p-12 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div className="text-center">
        <AILoadingOrb size={60} />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">60px</p>
      </div>
      <div className="text-center">
        <AILoadingOrb size={80} />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">80px</p>
      </div>
      <div className="text-center">
        <AILoadingOrb size={120} />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">120px (default)</p>
      </div>
      <div className="text-center">
        <AILoadingOrb size={160} />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">160px</p>
      </div>
      <div className="text-center">
        <AILoadingOrb size={200} />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">200px</p>
      </div>
    </div>
  ),
};

/**
 * Processing workflow example with text.
 */
export const ProcessingWorkflow: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center justify-center gap-6">
        <AILoadingOrb size={140} />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Processing Audio
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Transcribing your audio file with AI...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-500">
              Step 2 of 4
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Loading card example.
 */
export const LoadingCard: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-12 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl">
      <div className="flex flex-col items-center gap-4">
        <AILoadingOrb size={100} />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Generating Summary
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          Our AI is analyzing your transcript and creating a comprehensive summary...
        </p>
      </div>
    </div>
  ),
};

/**
 * Minimal inline loader.
 */
export const InlineLoader: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <AILoadingOrb size={40} />
      <span className="text-sm text-slate-700 dark:text-slate-300">
        Loading...
      </span>
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
      <div className="bg-white p-12 rounded-lg shadow-lg">
        <h4 className="text-lg font-semibold text-slate-900 mb-6 text-center">Light Mode</h4>
        <div className="flex justify-center">
          <AILoadingOrb size={120} />
        </div>
      </div>

      {/* Dark Mode */}
      <div className="dark bg-slate-900 p-12 rounded-lg shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-6 text-center">Dark Mode</h4>
        <div className="flex justify-center">
          <AILoadingOrb size={120} />
        </div>
      </div>
    </div>
  ),
};

/**
 * Full-screen loading state.
 */
export const FullScreenLoading: Story = {
  render: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-12">
        <div className="flex flex-col items-center gap-6">
          <AILoadingOrb size={160} />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Processing...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * Multiple orbs with different context.
 */
export const MultipleOrbs: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6 p-8">
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-6 text-center">
        <AILoadingOrb size={80} />
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">Analyzing</p>
      </div>
      <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-xl p-6 text-center">
        <AILoadingOrb size={80} />
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">Transcribing</p>
      </div>
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-6 text-center">
        <AILoadingOrb size={80} />
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">Summarizing</p>
      </div>
    </div>
  ),
};

/**
 * Accessibility: Reduced motion version.
 * Note: This story shows what the orb looks like, but actual reduced motion
 * behavior is controlled by user's system preferences.
 */
export const ReducedMotionNote: Story = {
  render: () => (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Accessibility: Reduced Motion
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          This component respects the <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">prefers-reduced-motion</code> user preference.
          When enabled, all animations are disabled for users who prefer reduced motion.
        </p>
        <div className="flex justify-center p-8 bg-white dark:bg-slate-800 rounded-lg">
          <AILoadingOrb size={120} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center">
          Enable "Reduce motion" in your OS settings to see this in action
        </p>
      </div>
    </div>
  ),
};
