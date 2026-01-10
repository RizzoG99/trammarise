import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlassCard } from './GlassCard';
import { Heading } from '../Heading';
import { Text } from '../Text';

const meta: Meta<typeof GlassCard> = {
  title: 'UI/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['light', 'dark', 'primary'],
      description: 'Visual style variant',
    },
    blur: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Backdrop blur intensity',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

/**
 * Light variant with medium blur - default style.
 */
export const Light: Story = {
  args: {
    variant: 'light',
    blur: 'md',
    children: (
      <div className="p-6">
        <Heading level="h3">Light Glass Card</Heading>
        <Text className="mt-2">
          Glass morphism effect with light background and medium blur.
        </Text>
      </div>
    ),
  },
};

/**
 * Dark variant with medium blur.
 */
export const Dark: Story = {
  args: {
    variant: 'dark',
    blur: 'md',
    children: (
      <div className="p-6">
        <Heading level="h3">Dark Glass Card</Heading>
        <Text className="mt-2">
          Glass morphism effect with dark background and medium blur.
        </Text>
      </div>
    ),
  },
};

/**
 * Primary variant with medium blur - uses brand color.
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    blur: 'md',
    children: (
      <div className="p-6">
        <Heading level="h3">Primary Glass Card</Heading>
        <Text className="mt-2">
          Glass morphism effect with primary brand color and medium blur.
        </Text>
      </div>
    ),
  },
};

/**
 * Small blur effect - more transparent, less frosted.
 */
export const SmallBlur: Story = {
  args: {
    variant: 'light',
    blur: 'sm',
    children: (
      <div className="p-6">
        <Heading level="h3">Small Blur</Heading>
        <Text className="mt-2">
          Subtle blur effect for a lighter, more transparent appearance.
        </Text>
      </div>
    ),
  },
};

/**
 * Medium blur effect - balanced frosted glass look.
 */
export const MediumBlur: Story = {
  args: {
    variant: 'light',
    blur: 'md',
    children: (
      <div className="p-6">
        <Heading level="h3">Medium Blur</Heading>
        <Text className="mt-2">
          Balanced blur effect providing the classic frosted glass aesthetic.
        </Text>
      </div>
    ),
  },
};

/**
 * Large blur effect - heavy frosted glass look.
 */
export const LargeBlur: Story = {
  args: {
    variant: 'light',
    blur: 'lg',
    children: (
      <div className="p-6">
        <Heading level="h3">Large Blur</Heading>
        <Text className="mt-2">
          Heavy blur effect for maximum frosted glass appearance.
        </Text>
      </div>
    ),
  },
};

/**
 * Showcase of all variant combinations.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Light Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="light" blur="sm">
            <div className="p-6">
              <Heading level="h3">Small Blur</Heading>
              <Text className="mt-2">Subtle transparency</Text>
            </div>
          </GlassCard>
          <GlassCard variant="light" blur="md">
            <div className="p-6">
              <Heading level="h3">Medium Blur</Heading>
              <Text className="mt-2">Balanced frosted glass</Text>
            </div>
          </GlassCard>
          <GlassCard variant="light" blur="lg">
            <div className="p-6">
              <Heading level="h3">Large Blur</Heading>
              <Text className="mt-2">Heavy frosted effect</Text>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Dark Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="dark" blur="sm">
            <div className="p-6">
              <Heading level="h3">Small Blur</Heading>
              <Text className="mt-2">Subtle transparency</Text>
            </div>
          </GlassCard>
          <GlassCard variant="dark" blur="md">
            <div className="p-6">
              <Heading level="h3">Medium Blur</Heading>
              <Text className="mt-2">Balanced frosted glass</Text>
            </div>
          </GlassCard>
          <GlassCard variant="dark" blur="lg">
            <div className="p-6">
              <Heading level="h3">Large Blur</Heading>
              <Text className="mt-2">Heavy frosted effect</Text>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Primary Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="primary" blur="sm">
            <div className="p-6">
              <Heading level="h3">Small Blur</Heading>
              <Text className="mt-2">Brand color subtle</Text>
            </div>
          </GlassCard>
          <GlassCard variant="primary" blur="md">
            <div className="p-6">
              <Heading level="h3">Medium Blur</Heading>
              <Text className="mt-2">Brand color balanced</Text>
            </div>
          </GlassCard>
          <GlassCard variant="primary" blur="lg">
            <div className="p-6">
              <Heading level="h3">Large Blur</Heading>
              <Text className="mt-2">Brand color strong</Text>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  ),
};

/**
 * Nested cards example showing depth.
 */
export const NestedCards: Story = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <GlassCard variant="dark" blur="lg">
        <div className="p-8">
          <Heading level="h2">Outer Card</Heading>
          <Text className="mt-2 mb-6">
            Glass cards can be nested to create layered depth effects.
          </Text>

          <GlassCard variant="light" blur="md">
            <div className="p-6">
              <Heading level="h3">Middle Card</Heading>
              <Text className="mt-2 mb-4">
                Each layer adds to the frosted glass aesthetic.
              </Text>

              <GlassCard variant="primary" blur="sm">
                <div className="p-4">
                  <Heading level="h3">Inner Card</Heading>
                  <Text className="mt-2">
                    Multiple levels of transparency and blur.
                  </Text>
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  ),
};

/**
 * Complex content example with form elements.
 */
export const ComplexContent: Story = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-600">
      <GlassCard variant="light" blur="md">
        <div className="p-8 max-w-md">
          <Heading level="h2">User Profile</Heading>
          <Text className="mt-2 mb-6">Update your account information</Text>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              />
            </div>

            <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  ),
};

/**
 * Card with custom styling and className.
 */
export const CustomStyling: Story = {
  args: {
    variant: 'dark',
    blur: 'md',
    className: 'max-w-md hover:scale-105 transition-transform',
    style: { padding: '2rem' },
    children: (
      <>
        <Heading level="h3">Custom Styled Card</Heading>
        <Text className="mt-2">
          Supports custom className and style props for additional customization.
        </Text>
        <Text className="mt-4 text-sm opacity-70">
          Hover to see scale animation.
        </Text>
      </>
    ),
  },
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="space-y-4 p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Light Mode Background</h3>
        <GlassCard variant="light" blur="md">
          <div className="p-6">
            <Heading level="h3">Light Card</Heading>
            <Text className="mt-2">Optimized for light backgrounds</Text>
          </div>
        </GlassCard>
        <GlassCard variant="dark" blur="md">
          <div className="p-6">
            <Heading level="h3">Dark Card</Heading>
            <Text className="mt-2">Works on light backgrounds too</Text>
          </div>
        </GlassCard>
      </div>

      <div className="dark space-y-4 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Dark Mode Background</h3>
        <GlassCard variant="light" blur="md">
          <div className="p-6">
            <Heading level="h3">Light Card</Heading>
            <Text className="mt-2">Adapts to dark mode</Text>
          </div>
        </GlassCard>
        <GlassCard variant="dark" blur="md">
          <div className="p-6">
            <Heading level="h3">Dark Card</Heading>
            <Text className="mt-2">Designed for dark backgrounds</Text>
          </div>
        </GlassCard>
      </div>
    </div>
  ),
};
