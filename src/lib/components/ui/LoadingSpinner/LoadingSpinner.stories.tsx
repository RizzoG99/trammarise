import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the spinner',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for container',
    },
    spinnerClassName: {
      control: 'text',
      description: 'Additional CSS classes for spinner element',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

/**
 * Default medium-sized loading spinner.
 */
export const Default: Story = {
  args: {},
};

/**
 * Small spinner for compact UI spaces.
 */
export const Small: Story = {
  args: {
    size: 'sm',
  },
};

/**
 * Medium spinner (default size).
 */
export const Medium: Story = {
  args: {
    size: 'md',
  },
};

/**
 * Large spinner for prominent loading states.
 */
export const Large: Story = {
  args: {
    size: 'lg',
  },
};

/**
 * Extra large spinner for full-page loading.
 */
export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

/**
 * Spinner with custom container styling.
 */
export const CustomContainer: Story = {
  args: {
    className: 'bg-slate-100 dark:bg-slate-800 rounded-lg p-12',
  },
};

/**
 * Spinner with custom spinner styling.
 */
export const CustomSpinner: Story = {
  args: {
    spinnerClassName: 'border-emerald-500/20 border-t-emerald-500',
  },
};

/**
 * Showcase of all spinner sizes side by side.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Small</h3>
        <LoadingSpinner size="sm" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Medium (Default)</h3>
        <LoadingSpinner size="md" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Large</h3>
        <LoadingSpinner size="lg" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Extra Large</h3>
        <LoadingSpinner size="xl" />
      </div>
    </div>
  ),
};

/**
 * Different loading contexts.
 */
export const InContext: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      {/* In a card */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Loading Card Content
        </h3>
        <LoadingSpinner size="sm" />
      </div>

      {/* In a button area */}
      <div className="flex gap-4 items-center">
        <span className="text-slate-700 dark:text-slate-300">Processing...</span>
        <LoadingSpinner size="sm" className="p-0" />
      </div>

      {/* Full page loader */}
      <div className="min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 dark:text-slate-400">Loading your content...</p>
        </div>
      </div>
    </div>
  ),
};

/**
 * Custom colored spinners.
 */
export const CustomColors: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Emerald</h4>
        <LoadingSpinner spinnerClassName="border-emerald-500/20 border-t-emerald-500" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Red</h4>
        <LoadingSpinner spinnerClassName="border-red-500/20 border-t-red-500" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Blue</h4>
        <LoadingSpinner spinnerClassName="border-blue-500/20 border-t-blue-500" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Purple</h4>
        <LoadingSpinner spinnerClassName="border-purple-500/20 border-t-purple-500" />
      </div>
    </div>
  ),
};
