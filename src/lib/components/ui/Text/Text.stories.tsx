import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import { Heading } from '../Heading';

const meta: Meta<typeof Text> = {
  title: 'UI/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'caption', 'small'],
      description: 'Text size variant',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Text color based on hierarchy',
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div'],
      description: 'HTML element to render',
    },
    children: {
      control: 'text',
      description: 'Text content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

/**
 * Body text - default size for content.
 */
export const Body: Story = {
  args: {
    variant: 'body',
    color: 'primary',
    children: 'This is body text. It is used for the main content of your application.',
  },
};

/**
 * Caption text - smaller size for labels and hints.
 */
export const Caption: Story = {
  args: {
    variant: 'caption',
    color: 'secondary',
    children: 'This is caption text. It is used for labels, hints, and secondary information.',
  },
};

/**
 * Small text - smallest size for fine print.
 */
export const Small: Story = {
  args: {
    variant: 'small',
    color: 'tertiary',
    children: 'This is small text. It is used for fine print, footnotes, and tertiary information.',
  },
};

/**
 * Primary color - main text color.
 */
export const PrimaryColor: Story = {
  args: {
    variant: 'body',
    color: 'primary',
    children: 'Primary text color - highest contrast, used for main content.',
  },
};

/**
 * Secondary color - subdued text color.
 */
export const SecondaryColor: Story = {
  args: {
    variant: 'body',
    color: 'secondary',
    children: 'Secondary text color - medium contrast, used for supporting text.',
  },
};

/**
 * Tertiary color - most subdued text color.
 */
export const TertiaryColor: Story = {
  args: {
    variant: 'body',
    color: 'tertiary',
    children: 'Tertiary text color - low contrast, used for hints and metadata.',
  },
};

/**
 * Render as span for inline text.
 */
export const AsSpan: Story = {
  args: {
    variant: 'body',
    as: 'span',
    children: 'This is rendered as a <span> element.',
  },
};

/**
 * All text variants side by side.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900">
      <div className="space-y-4">
        <Heading level="h3">Size Variants</Heading>
        <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-lg">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">variant="body"</span>
            <Text variant="body">
              Body text - Regular paragraph content with comfortable reading size.
            </Text>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">variant="caption"</span>
            <Text variant="caption">
              Caption text - Labels, hints, and secondary information.
            </Text>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">variant="small"</span>
            <Text variant="small">
              Small text - Fine print, footnotes, and tertiary details.
            </Text>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Heading level="h3">Color Variants</Heading>
        <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-lg">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">color="primary"</span>
            <Text color="primary">
              Primary color - Highest contrast for main content and important information.
            </Text>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">color="secondary"</span>
            <Text color="secondary">
              Secondary color - Medium contrast for supporting text and descriptions.
            </Text>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">color="tertiary"</span>
            <Text color="tertiary">
              Tertiary color - Low contrast for hints, metadata, and less important details.
            </Text>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Heading level="h3">Combined Variants</Heading>
        <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-lg">
          <Text variant="body" color="primary">
            Body + Primary - Main paragraph content
          </Text>
          <Text variant="caption" color="secondary">
            Caption + Secondary - Form labels and hints
          </Text>
          <Text variant="small" color="tertiary">
            Small + Tertiary - Timestamps and metadata
          </Text>
        </div>
      </div>
    </div>
  ),
};

/**
 * Typography hierarchy demonstration.
 */
export const TypographyHierarchy: Story = {
  render: () => (
    <div className="max-w-3xl p-8 bg-white dark:bg-slate-900">
      <Heading level="h1">Typography System</Heading>
      
      <Text variant="body" color="primary" className="mt-4">
        Our typography system uses three text sizes (body, caption, small) and three color levels
        (primary, secondary, tertiary) to create clear visual hierarchy.
      </Text>

      <Heading level="h2" className="mt-8">Body Text Examples</Heading>
      
      <Text variant="body" color="primary" className="mt-4">
        <strong>Primary body text</strong> is used for main content paragraphs. It has the highest
        contrast and is optimized for comfortable reading. This is the default text style for
        most content.
      </Text>

      <Text variant="body" color="secondary" className="mt-4">
        <strong>Secondary body text</strong> is used for supporting information that complements
        the main content. It has slightly reduced contrast to differentiate it from primary text.
      </Text>

      <Heading level="h3" className="mt-8">Caption and Small Text</Heading>
      
      <Text variant="caption" color="primary" className="mt-4">
        Caption text is perfect for form labels, image captions, and UI element descriptions.
        It's smaller than body text but still highly readable.
      </Text>

      <Text variant="small" color="tertiary" className="mt-2">
        Small text is reserved for timestamps, legal disclaimers, footnotes, and other
        supplementary information that doesn't require prominent display.
      </Text>
    </div>
  ),
};

/**
 * Real-world usage examples.
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-slate-50 dark:bg-slate-900">
      {/* Card Example */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md">
        <Heading level="h3">Audio Recording</Heading>
        <Text variant="caption" color="secondary" className="mt-1">
          recording-2024-01-08.mp3
        </Text>
        
        <Text variant="body" color="primary" className="mt-4">
          Meeting notes from the Q1 strategy planning session. Discussed product roadmap,
          hiring plans, and budget allocation for the upcoming quarter.
        </Text>

        <div className="flex items-center gap-4 mt-4">
          <Text variant="caption" color="tertiary">Duration: 45:32</Text>
          <Text variant="caption" color="tertiary">•</Text>
          <Text variant="caption" color="tertiary">Size: 12.4 MB</Text>
          <Text variant="caption" color="tertiary">•</Text>
          <Text variant="caption" color="tertiary">Language: English</Text>
        </div>

        <Text variant="small" color="tertiary" className="mt-4">
          Transcribed on January 8, 2026 at 3:42 PM
        </Text>
      </div>

      {/* Form Example */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md">
        <Heading level="h3">Upload Settings</Heading>
        
        <div className="mt-4 space-y-4">
          <div>
            <Text variant="caption" color="primary" className="mb-2 block font-medium">
              Language
            </Text>
            <Text variant="small" color="secondary">
              Select the primary language spoken in your audio file
            </Text>
          </div>

          <div>
            <Text variant="caption" color="primary" className="mb-2 block font-medium">
              Content Type
            </Text>
            <Text variant="small" color="secondary">
              Choose the type of content to optimize transcription accuracy
            </Text>
          </div>

          <div>
            <Text variant="caption" color="primary" className="mb-2 block font-medium">
              Processing Mode
            </Text>
            <Text variant="small" color="secondary">
              Balance between speed, quality, and cost
            </Text>
          </div>
        </div>
      </div>

      {/* Status Message Example */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <Text variant="body" color="primary" className="font-medium">
          Transcription completed successfully
        </Text>
        <Text variant="caption" color="secondary" className="mt-1">
          Your audio has been transcribed with 98.5% confidence
        </Text>
        <Text variant="small" color="tertiary" className="mt-2">
          Processing time: 2 minutes 14 seconds
        </Text>
      </div>
    </div>
  ),
};

/**
 * Custom styling examples.
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <Text variant="body" className="font-bold text-blue-600 dark:text-blue-400">
        Custom colored and bold text
      </Text>

      <Text variant="caption" className="italic">
        Italic caption text
      </Text>

      <Text variant="small" className="uppercase tracking-wider">
        Uppercase small text with letter spacing
      </Text>

      <Text variant="body" className="text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Gradient text effect
      </Text>

      <Text variant="body" as="span" className="underline decoration-wavy decoration-red-500">
        Wavy underline decoration
      </Text>
    </div>
  ),
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6 p-8 bg-white rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">LIGHT MODE</h3>
        
        <div className="space-y-3">
          <Text variant="body" color="primary">Primary body text</Text>
          <Text variant="body" color="secondary">Secondary body text</Text>
          <Text variant="body" color="tertiary">Tertiary body text</Text>
        </div>

        <div className="space-y-3">
          <Text variant="caption" color="primary">Primary caption</Text>
          <Text variant="caption" color="secondary">Secondary caption</Text>
          <Text variant="caption" color="tertiary">Tertiary caption</Text>
        </div>

        <div className="space-y-3">
          <Text variant="small" color="primary">Primary small</Text>
          <Text variant="small" color="secondary">Secondary small</Text>
          <Text variant="small" color="tertiary">Tertiary small</Text>
        </div>
      </div>

      <div className="dark space-y-6 p-8 bg-slate-900 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">DARK MODE</h3>
        
        <div className="space-y-3">
          <Text variant="body" color="primary">Primary body text</Text>
          <Text variant="body" color="secondary">Secondary body text</Text>
          <Text variant="body" color="tertiary">Tertiary body text</Text>
        </div>

        <div className="space-y-3">
          <Text variant="caption" color="primary">Primary caption</Text>
          <Text variant="caption" color="secondary">Secondary caption</Text>
          <Text variant="caption" color="tertiary">Tertiary caption</Text>
        </div>

        <div className="space-y-3">
          <Text variant="small" color="primary">Primary small</Text>
          <Text variant="small" color="secondary">Secondary small</Text>
          <Text variant="small" color="tertiary">Tertiary small</Text>
        </div>
      </div>
    </div>
  ),
};

/**
 * Accessibility example with proper semantic HTML.
 */
export const AccessibilityExample: Story = {
  render: () => (
    <div className="max-w-2xl p-8 space-y-6">
      <Heading level="h2">Accessibility Best Practices</Heading>

      <div>
        <Text variant="body" color="primary" as="p">
          Use the <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">as</code> prop
          to ensure semantic HTML. Paragraphs should use <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">as="p"</code>,
          while inline text should use <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">as="span"</code>.
        </Text>
      </div>

      <div>
        <Text variant="caption" color="secondary" as="p">
          Color variants (primary, secondary, tertiary) ensure sufficient contrast ratios for
          WCAG 2.1 AA compliance. Primary text always meets the highest contrast requirements.
        </Text>
      </div>

      <div>
        <Text variant="body" color="primary" as="p">
          This is a paragraph with{' '}
          <Text variant="body" color="primary" as="span" className="font-bold">
            inline bold text
          </Text>{' '}
          and{' '}
          <Text variant="body" color="secondary" as="span" className="italic">
            secondary styled spans
          </Text>
          , all properly using semantic HTML.
        </Text>
      </div>
    </div>
  ),
};
