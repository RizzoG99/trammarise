import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { ThemeMode } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/**
 * Interactive theme toggle - Click to cycle through themes
 */
export const Interactive: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <div>
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Current theme: <strong>{theme}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Theme toggle with label text
 */
export const WithLabel: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <div>
        <ThemeToggle theme={theme} onThemeChange={setTheme} showLabel={true} />
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Current theme: <strong>{theme}</strong>
        </p>
      </div>
    );
  },
};

/**
 * System theme (default) - Monitor icon
 */
export const SystemTheme: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
  },
};

/**
 * Light theme - Sun icon
 */
export const LightTheme: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('light');

    return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
  },
};

/**
 * Dark theme - Moon icon
 */
export const DarkTheme: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('dark');

    return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
  },
};

/**
 * All themes shown side by side for comparison
 */
export const AllThemes: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <ThemeToggle theme="system" onThemeChange={() => {}} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            System
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ThemeToggle theme="light" onThemeChange={() => {}} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Light
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ThemeToggle theme="dark" onThemeChange={() => {}} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Dark
          </p>
        </div>
      </div>
    );
  },
};

/**
 * All themes with labels
 */
export const AllThemesWithLabels: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: 'column' }}>
        <ThemeToggle theme="system" onThemeChange={() => {}} showLabel={true} />
        <ThemeToggle theme="light" onThemeChange={() => {}} showLabel={true} />
        <ThemeToggle theme="dark" onThemeChange={() => {}} showLabel={true} />
      </div>
    );
  },
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <div>
        <ThemeToggle
          theme={theme}
          onThemeChange={setTheme}
          className="!p-4 !border-4 !border-blue-500 !rounded-full"
          showLabel={true}
        />
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Custom styling applied
        </p>
      </div>
    );
  },
};

/**
 * Theme cycling demonstration
 */
export const CyclingDemo: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');
    const [history, setHistory] = useState<ThemeMode[]>(['system']);

    const handleChange = (newTheme: ThemeMode) => {
      setTheme(newTheme);
      setHistory(prev => [...prev, newTheme]);
    };

    const reset = () => {
      setTheme('system');
      setHistory(['system']);
    };

    return (
      <div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle theme={theme} onThemeChange={handleChange} showLabel={true} />
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            <strong>Current:</strong> {theme}
          </p>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            <strong>History:</strong>
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {history.map((t, i) => (
              <span
                key={i}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#f3f4f6',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                {i + 1}. {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * In a toolbar context
 */
export const InToolbar: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: 'auto' }}>
          App Settings
        </span>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Options
        </button>
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>
    );
  },
};

/**
 * Responsive design example
 */
export const Responsive: Story = {
  render: () => {
    const [theme, setTheme] = useState<ThemeMode>('system');

    return (
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Appearance</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Customize how the app looks
            </p>
          </div>
          <ThemeToggle theme={theme} onThemeChange={setTheme} showLabel={true} />
        </div>
      </div>
    );
  },
};
