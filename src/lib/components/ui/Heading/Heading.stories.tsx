import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'UI/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['hero', 'h1', 'h2', 'h3'],
      description: 'Heading hierarchy level',
    },
    children: {
      control: 'text',
      description: 'Heading text content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

/**
 * Hero heading - largest size for main page titles.
 */
export const Hero: Story = {
  args: {
    level: 'hero',
    children: 'Hero Heading',
  },
};

/**
 * H1 heading - primary page heading.
 */
export const H1: Story = {
  args: {
    level: 'h1',
    children: 'H1 Heading',
  },
};

/**
 * H2 heading - section headings.
 */
export const H2: Story = {
  args: {
    level: 'h2',
    children: 'H2 Heading',
  },
};

/**
 * H3 heading - subsection headings.
 */
export const H3: Story = {
  args: {
    level: 'h3',
    children: 'H3 Heading',
  },
};

/**
 * All heading levels side by side.
 */
export const AllLevels: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900">
      <div className="space-y-2">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          level="hero"
        </span>
        <Heading level="hero">Hero Heading</Heading>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Used for main landing page titles and hero sections
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          level="h1"
        </span>
        <Heading level="h1">H1 Heading</Heading>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Primary page heading, one per page
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          level="h2"
        </span>
        <Heading level="h2">H2 Heading</Heading>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Section headings, major content divisions
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
          level="h3"
        </span>
        <Heading level="h3">H3 Heading</Heading>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Subsection headings, card titles
        </p>
      </div>
    </div>
  ),
};

/**
 * Typography hierarchy demonstration.
 */
export const TypographyHierarchy: Story = {
  render: () => (
    <div className="space-y-8 p-8 bg-white dark:bg-slate-900">
      <Heading level="hero">Trammarise Audio Platform</Heading>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
        Transform your audio recordings into searchable, AI-powered transcripts and summaries.
      </p>

      <div className="space-y-6 mt-12">
        <Heading level="h1">Getting Started</Heading>
        <p className="text-slate-600 dark:text-slate-400">
          Follow these steps to transcribe your first audio file.
        </p>

        <div className="space-y-4 mt-8">
          <Heading level="h2">1. Upload Your Audio</Heading>
          <p className="text-slate-600 dark:text-slate-400">
            Drag and drop your audio file or click to browse. We support MP3, WAV, M4A, and more.
          </p>

          <div className="pl-6 space-y-3 mt-4">
            <Heading level="h3">Supported Formats</Heading>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>MP3 - Most common format</li>
              <li>WAV - Uncompressed audio</li>
              <li>M4A - Apple audio format</li>
              <li>WEBM - Web audio format</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <Heading level="h2">2. Configure Settings</Heading>
          <p className="text-slate-600 dark:text-slate-400">
            Select your preferred language, content type, and AI provider.
          </p>

          <div className="pl-6 space-y-3 mt-4">
            <Heading level="h3">Language Selection</Heading>
            <p className="text-slate-600 dark:text-slate-400">
              Choose from 50+ languages for accurate transcription.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Headings with custom styling.
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <Heading level="hero" className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Gradient Hero
      </Heading>

      <Heading level="h1" className="text-red-600 dark:text-red-400">
        Colored H1
      </Heading>

      <Heading level="h2" className="uppercase tracking-wider">
        Uppercase H2
      </Heading>

      <Heading level="h3" className="italic">
        Italic H3
      </Heading>
    </div>
  ),
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4 p-8 bg-white rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-6">LIGHT MODE</h3>
        <Heading level="hero">Hero Heading</Heading>
        <Heading level="h1">H1 Heading</Heading>
        <Heading level="h2">H2 Heading</Heading>
        <Heading level="h3">H3 Heading</Heading>
      </div>

      <div className="dark space-y-4 p-8 bg-slate-900 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-400 mb-6">DARK MODE</h3>
        <Heading level="hero">Hero Heading</Heading>
        <Heading level="h1">H1 Heading</Heading>
        <Heading level="h2">H2 Heading</Heading>
        <Heading level="h3">H3 Heading</Heading>
      </div>
    </div>
  ),
};

/**
 * Real-world usage example.
 */
export const RealWorldExample: Story = {
  render: () => (
    <div className="max-w-4xl p-8 bg-slate-50 dark:bg-slate-900">
      <article className="space-y-6">
        <Heading level="h1">Understanding Audio Transcription</Heading>
        
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how AI-powered transcription transforms spoken words into searchable text.
        </p>

        <Heading level="h2">What is Audio Transcription?</Heading>
        
        <p className="text-slate-600 dark:text-slate-400">
          Audio transcription is the process of converting speech in audio files into written text.
          Modern AI systems like OpenAI's Whisper can achieve near-human accuracy.
        </p>

        <Heading level="h3">Key Benefits</Heading>
        
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
          <li>Searchable content from audio recordings</li>
          <li>Accessibility for hearing-impaired users</li>
          <li>Easy content repurposing and editing</li>
          <li>Time-stamped navigation</li>
        </ul>

        <Heading level="h2">How It Works</Heading>
        
        <p className="text-slate-600 dark:text-slate-400">
          The transcription pipeline involves multiple steps to ensure accuracy and quality.
        </p>

        <Heading level="h3">Step 1: Audio Processing</Heading>
        
        <p className="text-slate-600 dark:text-slate-400">
          Audio files are normalized, compressed if needed, and chunked into optimal sizes.
        </p>

        <Heading level="h3">Step 2: Speech Recognition</Heading>
        
        <p className="text-slate-600 dark:text-slate-400">
          Advanced AI models analyze the audio and generate accurate transcripts.
        </p>

        <Heading level="h3">Step 3: Post-Processing</Heading>
        
        <p className="text-slate-600 dark:text-slate-400">
          Text is formatted, punctuated, and optionally summarized using AI.
        </p>
      </article>
    </div>
  ),
};

/**
 * Responsive heading sizes.
 */
export const ResponsiveExample: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <span className="text-sm text-slate-500">Resize your browser to see responsive behavior</span>
      </div>
      
      <Heading level="hero" className="sm:text-5xl md:text-6xl lg:text-7xl">
        Responsive Hero
      </Heading>
      
      <Heading level="h1" className="sm:text-3xl md:text-4xl lg:text-5xl">
        Responsive H1
      </Heading>
      
      <Heading level="h2" className="sm:text-2xl md:text-3xl lg:text-4xl">
        Responsive H2
      </Heading>
    </div>
  ),
};
