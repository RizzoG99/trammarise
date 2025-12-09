import React, { useState } from 'react';
import {
  Button,
  Input,
  LoadingSpinner,
  Modal,
  Snackbar,
  ThemeToggle,
  ToggleSwitch,
  RadioCard,
  SelectCard,
} from '@/lib';
import type { ThemeMode } from '@/lib';
import { ComponentSection } from '../components/preview/ComponentSection';

/**
 * Preview page for showcasing and testing all library components.
 * Only accessible in development mode via /preview route.
 */
export const PreviewPage: React.FC = () => {
  // Component states for interactive demos
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('success');
  const [toggleChecked, setToggleChecked] = useState(false);
  const [radioSelected, setRadioSelected] = useState('option1');
  const [selectSelected, setSelectSelected] = useState('video');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [theme, setTheme] = useState<ThemeMode>('system');

  const handleShowSnackbar = (variant: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarVariant(variant);
    setSnackbarOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Component Preview
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Development-only page for testing and showcasing all library components.
            <br />
            <span className="text-sm">
              ⚠️ This page is only accessible in development mode (
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                import.meta.env.DEV === true
              </code>
              )
            </span>
          </p>
        </header>

        {/* Button Component */}
        <ComponentSection
          title="Button"
          description="Versatile button component with 9 variants and built-in icon support."
          props={[
            {
              name: 'variant',
              type: 'ButtonVariant',
              description: 'Button style variant',
              defaultValue: 'primary',
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              description: 'Button content',
            },
            {
              name: 'onClick',
              type: '() => void',
              description: 'Click handler',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Disable button interaction',
              defaultValue: 'false',
            },
            {
              name: 'icon',
              type: 'React.ReactNode',
              description: 'Optional icon element',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS classes',
              defaultValue: "''",
            },
          ]}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                All Variants
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => alert('Primary clicked')}>
                  Primary
                </Button>
                <Button variant="secondary" onClick={() => alert('Secondary clicked')}>
                  Secondary
                </Button>
                <Button variant="success" onClick={() => alert('Success clicked')}>
                  Success
                </Button>
                <Button variant="danger" onClick={() => alert('Danger clicked')}>
                  Danger
                </Button>
                <Button variant="outline" onClick={() => alert('Outline clicked')}>
                  Outline
                </Button>
                <Button variant="small" onClick={() => alert('Small clicked')}>
                  Small
                </Button>
                <Button variant="large" onClick={() => alert('Large clicked')}>
                  Large
                </Button>
                <Button variant="circle" onClick={() => alert('Circle clicked')}>
                  +
                </Button>
                <Button
                  variant="circle-thick"
                  onClick={() => alert('Circle-thick clicked')}
                >
                  ✓
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Disabled State
              </h4>
              <div className="flex gap-2">
                <Button variant="primary" disabled>
                  Disabled Primary
                </Button>
                <Button variant="success" disabled>
                  Disabled Success
                </Button>
              </div>
            </div>
          </div>
        </ComponentSection>

        {/* Input Component */}
        <ComponentSection
          title="Input"
          description="Form input component with label, error handling, hint text, and required field support."
          props={[
            { name: 'label', type: 'string', description: 'Input label text' },
            { name: 'value', type: 'string', description: 'Input value' },
            {
              name: 'onChange',
              type: '(e: ChangeEvent) => void',
              description: 'Change handler',
            },
            { name: 'error', type: 'string', description: 'Error message' },
            { name: 'hint', type: 'string', description: 'Hint text below input' },
            {
              name: 'required',
              type: 'boolean',
              description: 'Mark as required',
              defaultValue: 'false',
            },
            {
              name: 'fullWidth',
              type: 'boolean',
              description: 'Take full width',
              defaultValue: 'true',
            },
          ]}
        >
          <div className="space-y-4 max-w-md">
            <Input
              label="Username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Enter your username"
            />
            <Input
              label="Email"
              type="email"
              required
              hint="We'll never share your email"
            />
            <Input
              label="Password"
              type="password"
              error={inputError}
              onChange={(e) => {
                if (e.target.value.length < 8) {
                  setInputError('Password must be at least 8 characters');
                } else {
                  setInputError('');
                }
              }}
            />
            <Input label="Disabled Input" disabled value="Cannot edit this" />
          </div>
        </ComponentSection>

        {/* LoadingSpinner Component */}
        <ComponentSection
          title="LoadingSpinner"
          description="Loading indicator with 4 size variants and accessibility support."
          props={[
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg' | 'xl'",
              description: 'Spinner size',
              defaultValue: 'md',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS classes',
            },
          ]}
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <LoadingSpinner size="sm" />
              <p className="text-xs mt-2 text-slate-500">Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-xs mt-2 text-slate-500">Medium</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-xs mt-2 text-slate-500">Large</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="xl" />
              <p className="text-xs mt-2 text-slate-500">Extra Large</p>
            </div>
          </div>
        </ComponentSection>

        {/* Modal Component */}
        <ComponentSection
          title="Modal"
          description="Dialog modal with backdrop, animations, and configurable actions."
          props={[
            {
              name: 'isOpen',
              type: 'boolean',
              description: 'Controls visibility',
              required: true,
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Close callback',
              required: true,
            },
            {
              name: 'title',
              type: 'string',
              description: 'Modal title',
              required: true,
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              description: 'Modal content',
              required: true,
            },
            {
              name: 'actions',
              type: 'ModalAction[]',
              description: 'Footer action buttons',
            },
            {
              name: 'disableBackdropClick',
              type: 'boolean',
              description: 'Prevent close on backdrop click',
              defaultValue: 'false',
            },
          ]}
        >
          <div className="space-y-3">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Example Modal"
              actions={[
                {
                  label: 'Cancel',
                  onClick: () => setModalOpen(false),
                  variant: 'outline',
                },
                {
                  label: 'Confirm',
                  onClick: () => {
                    setModalOpen(false);
                    alert('Confirmed!');
                  },
                  variant: 'primary',
                },
              ]}
            >
              <p>
                This is a modal with actions. Click outside, press ESC, or use the
                buttons to close.
              </p>
            </Modal>
          </div>
        </ComponentSection>

        {/* Snackbar Component */}
        <ComponentSection
          title="Snackbar"
          description="Notification snackbar with 4 variants and auto-dismiss functionality."
          props={[
            {
              name: 'isOpen',
              type: 'boolean',
              description: 'Controls visibility',
              required: true,
            },
            {
              name: 'message',
              type: 'string',
              description: 'Notification message',
              required: true,
            },
            {
              name: 'variant',
              type: "'success' | 'error' | 'warning' | 'info'",
              description: 'Visual variant',
              defaultValue: 'info',
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Close callback',
              required: true,
            },
            {
              name: 'duration',
              type: 'number',
              description: 'Auto-dismiss duration (ms), 0 = no auto-dismiss',
              defaultValue: '4000',
            },
          ]}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={() => handleShowSnackbar('success')}
            >
              Success Snackbar
            </Button>
            <Button variant="danger" onClick={() => handleShowSnackbar('error')}>
              Error Snackbar
            </Button>
            <Button onClick={() => handleShowSnackbar('warning')}>
              Warning Snackbar
            </Button>
            <Button variant="secondary" onClick={() => handleShowSnackbar('info')}>
              Info Snackbar
            </Button>
          </div>
          <Snackbar
            isOpen={snackbarOpen}
            message={`This is a ${snackbarVariant} message!`}
            variant={snackbarVariant}
            onClose={() => setSnackbarOpen(false)}
            duration={3000}
          />
        </ComponentSection>

        {/* ThemeToggle Component */}
        <ComponentSection
          title="ThemeToggle"
          description="Theme toggle button that cycles through system, light, and dark modes."
          props={[
            {
              name: 'theme',
              type: "'system' | 'light' | 'dark'",
              description: 'Current theme',
              required: true,
            },
            {
              name: 'onThemeChange',
              type: '(theme: ThemeMode) => void',
              description: 'Theme change callback',
              required: true,
            },
            {
              name: 'showLabel',
              type: 'boolean',
              description: 'Show theme name text',
              defaultValue: 'false',
            },
          ]}
        >
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
            <ThemeToggle theme={theme} onThemeChange={setTheme} showLabel />
            <p className="text-sm text-slate-500">Current: {theme}</p>
          </div>
        </ComponentSection>

        {/* ToggleSwitch Component */}
        <ComponentSection
          title="ToggleSwitch"
          description="Toggle switch component for binary on/off states with label and description."
          props={[
            {
              name: 'label',
              type: 'string',
              description: 'Label text',
              required: true,
            },
            {
              name: 'checked',
              type: 'boolean',
              description: 'Checked state',
              required: true,
            },
            {
              name: 'onChange',
              type: '(checked: boolean) => void',
              description: 'Change callback',
              required: true,
            },
            {
              name: 'description',
              type: 'string',
              description: 'Description text below label',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Disable interaction',
              defaultValue: 'false',
            },
          ]}
        >
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable notifications"
              checked={toggleChecked}
              onChange={setToggleChecked}
            />
            <ToggleSwitch
              label="Dark Mode"
              description="Use dark theme for better visibility at night"
              checked={true}
              onChange={() => {}}
            />
            <ToggleSwitch
              label="Premium Feature"
              description="Upgrade to enable this feature"
              checked={false}
              onChange={() => {}}
              disabled
            />
          </div>
        </ComponentSection>

        {/* RadioCard Component */}
        <ComponentSection
          title="RadioCard"
          description="Card-style radio button for selecting from multiple options in a group."
          props={[
            {
              name: 'name',
              type: 'string',
              description: 'Radio group name',
              required: true,
            },
            {
              name: 'value',
              type: 'string',
              description: 'Option value',
              required: true,
            },
            {
              name: 'checked',
              type: 'boolean',
              description: 'Selected state',
              required: true,
            },
            {
              name: 'onChange',
              type: '(value: string) => void',
              description: 'Selection callback',
              required: true,
            },
            {
              name: 'title',
              type: 'React.ReactNode',
              description: 'Card title',
              required: true,
            },
            { name: 'description', type: 'string', description: 'Card description' },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Disable interaction',
              defaultValue: 'false',
            },
          ]}
        >
          <div className="space-y-3 max-w-md">
            <RadioCard
              name="plan"
              value="option1"
              checked={radioSelected === 'option1'}
              onChange={setRadioSelected}
              title="Basic Plan"
              description="Perfect for individuals just getting started"
            />
            <RadioCard
              name="plan"
              value="option2"
              checked={radioSelected === 'option2'}
              onChange={setRadioSelected}
              title="Pro Plan"
              description="Best for growing teams and businesses"
            />
            <RadioCard
              name="plan"
              value="option3"
              checked={radioSelected === 'option3'}
              onChange={setRadioSelected}
              title="Enterprise Plan"
              description="Custom solutions for large organizations"
            />
          </div>
        </ComponentSection>

        {/* SelectCard Component */}
        <ComponentSection
          title="SelectCard"
          description="Selectable card component with icon support, ideal for grid layouts."
          props={[
            {
              name: 'value',
              type: 'string',
              description: 'Card value',
              required: true,
            },
            {
              name: 'label',
              type: 'string',
              description: 'Card label',
              required: true,
            },
            {
              name: 'selected',
              type: 'boolean',
              description: 'Selected state',
              required: true,
            },
            {
              name: 'onClick',
              type: '() => void',
              description: 'Click callback',
              required: true,
            },
            {
              name: 'icon',
              type: 'React.ReactNode',
              description: 'Optional icon',
            },
            {
              name: 'description',
              type: 'string',
              description: 'Optional description',
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Disable interaction',
              defaultValue: 'false',
            },
          ]}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SelectCard
              value="video"
              label="Video"
              icon={<span className="text-3xl">🎥</span>}
              selected={selectSelected === 'video'}
              onClick={() => setSelectSelected('video')}
            />
            <SelectCard
              value="audio"
              label="Audio"
              icon={<span className="text-3xl">🎵</span>}
              selected={selectSelected === 'audio'}
              onClick={() => setSelectSelected('audio')}
            />
            <SelectCard
              value="image"
              label="Image"
              icon={<span className="text-3xl">🖼️</span>}
              selected={selectSelected === 'image'}
              onClick={() => setSelectSelected('image')}
            />
            <SelectCard
              value="text"
              label="Text"
              icon={<span className="text-3xl">📝</span>}
              selected={selectSelected === 'text'}
              onClick={() => setSelectSelected('text')}
            />
          </div>
        </ComponentSection>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
          <p>
            Component Library v1.0.0 • 9 Components •{' '}
            <a
              href="/"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Back to App
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};
