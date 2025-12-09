import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToggleSwitch } from './ToggleSwitch';

const meta: Meta<typeof ToggleSwitch> = {
  title: 'Form/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

/**
 * Basic toggle switch - Click to toggle on/off
 */
export const Basic: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div>
        <ToggleSwitch
          label="Enable notifications"
          checked={checked}
          onChange={setChecked}
        />
        <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
          Status: <strong>{checked ? 'ON' : 'OFF'}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Toggle with description text
 */
export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);

    return (
      <ToggleSwitch
        label="Dark Mode"
        description="Use dark theme for better visibility at night"
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

/**
 * Checked state - Toggle starts in ON position
 */
export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);

    return (
      <ToggleSwitch
        label="Auto-save"
        description="Automatically save changes"
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

/**
 * Unchecked state - Toggle starts in OFF position
 */
export const Unchecked: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <ToggleSwitch
        label="Email notifications"
        description="Receive email updates"
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

/**
 * Disabled state - Cannot be toggled
 */
export const Disabled: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ToggleSwitch
          label="Premium Feature (Disabled Off)"
          description="Upgrade to enable this feature"
          checked={false}
          onChange={() => {}}
          disabled={true}
        />
        <ToggleSwitch
          label="System Setting (Disabled On)"
          description="Managed by administrator"
          checked={true}
          onChange={() => {}}
          disabled={true}
        />
      </div>
    );
  },
};

/**
 * Multiple toggles in a settings panel
 */
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    });

    const updateSetting = (key: keyof typeof settings) => (value: boolean) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div style={{ width: '400px', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ToggleSwitch
            label="Push Notifications"
            description="Receive push notifications on this device"
            checked={settings.notifications}
            onChange={updateSetting('notifications')}
          />
          <ToggleSwitch
            label="Dark Mode"
            description="Use dark theme"
            checked={settings.darkMode}
            onChange={updateSetting('darkMode')}
          />
          <ToggleSwitch
            label="Auto-save"
            description="Automatically save your work"
            checked={settings.autoSave}
            onChange={updateSetting('autoSave')}
          />
          <ToggleSwitch
            label="Analytics"
            description="Help us improve by sharing usage data"
            checked={settings.analytics}
            onChange={updateSetting('analytics')}
          />
        </div>
      </div>
    );
  },
};

/**
 * Toggle with long label and description
 */
export const LongText: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div style={{ width: '500px' }}>
        <ToggleSwitch
          label="Enable advanced machine learning-powered content recommendations"
          description="This feature uses artificial intelligence to analyze your usage patterns and provide personalized content suggestions based on your interests and behavior."
          checked={checked}
          onChange={setChecked}
        />
      </div>
    );
  },
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <ToggleSwitch
        label="Custom Styled Toggle"
        description="With custom CSS classes"
        checked={checked}
        onChange={setChecked}
        className="p-4 bg-blue-50 rounded-lg"
      />
    );
  },
};

/**
 * Interactive demo with state display
 */
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [toggleCount, setToggleCount] = useState(0);

    const handleChange = (newValue: boolean) => {
      setChecked(newValue);
      setToggleCount(prev => prev + 1);
    };

    return (
      <div>
        <ToggleSwitch
          label="Interactive Toggle"
          description="Click to see stats update"
          checked={checked}
          onChange={handleChange}
        />
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Statistics:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#374151' }}>
            <li>Current state: <strong>{checked ? 'ON' : 'OFF'}</strong></li>
            <li>Toggle count: <strong>{toggleCount}</strong></li>
          </ul>
        </div>
      </div>
    );
  },
};

/**
 * Form integration example
 */
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      newsletter: true,
      terms: false,
      marketing: false,
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    };

    const updateField = (key: keyof typeof formData) => (value: boolean) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
      <form onSubmit={handleSubmit} style={{ width: '400px' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Sign Up Form</h3>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email address"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ToggleSwitch
            label="Subscribe to newsletter"
            description="Receive weekly updates and tips"
            checked={formData.newsletter}
            onChange={updateField('newsletter')}
          />
          <ToggleSwitch
            label="I agree to the terms and conditions"
            checked={formData.terms}
            onChange={updateField('terms')}
          />
          <ToggleSwitch
            label="Send me marketing emails"
            description="Promotional offers and product updates"
            checked={formData.marketing}
            onChange={updateField('marketing')}
          />
        </div>

        <button
          type="submit"
          disabled={!formData.terms}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: formData.terms ? '#4f46e5' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: formData.terms ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          {submitted ? 'Submitted!' : 'Submit'}
        </button>
      </form>
    );
  },
};

/**
 * Keyboard navigation demo
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      option1: false,
      option2: false,
      option3: false,
    });

    return (
      <div>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
          Try navigating with Tab key and toggling with Space or Enter
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ToggleSwitch
            label="Option 1"
            checked={settings.option1}
            onChange={(v) => setSettings(prev => ({ ...prev, option1: v }))}
          />
          <ToggleSwitch
            label="Option 2"
            checked={settings.option2}
            onChange={(v) => setSettings(prev => ({ ...prev, option2: v }))}
          />
          <ToggleSwitch
            label="Option 3"
            checked={settings.option3}
            onChange={(v) => setSettings(prev => ({ ...prev, option3: v }))}
          />
        </div>
      </div>
    );
  },
};
