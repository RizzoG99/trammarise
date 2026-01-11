import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Optional label text displayed above the input',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the input (shows error styling)',
    },
    hint: {
      control: 'text',
      description: 'Hint text to display below the input when there\'s no error',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the input should take full width of its container',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required (adds asterisk to label)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * Basic input without label.
 */
export const Basic: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * Input with a label for better accessibility.
 */
export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

/**
 * Input with helpful hint text below.
 */
export const WithHint: Story = {
  args: {
    label: 'API Key',
    type: 'text',
    placeholder: 'sk-...',
    hint: 'You can find this in your account settings',
  },
};

/**
 * Input showing validation error state.
 */
export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password must be at least 8 characters',
    placeholder: 'Enter password',
  },
};

/**
 * Required field with asterisk indicator.
 */
export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
  },
};

/**
 * Disabled input state.
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

/**
 * Password input type.
 */
export const PasswordField: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
  },
};

/**
 * Number input with validation.
 */
export const NumberField: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: '18',
    hint: 'Must be 18 or older',
  },
};

/**
 * Search input type.
 */
export const SearchField: Story = {
  args: {
    label: 'Search',
    type: 'search',
    placeholder: 'Search...',
  },
};

/**
 * Compact input without full width.
 */
export const CompactWidth: Story = {
  args: {
    label: 'Short Input',
    placeholder: 'Text',
    fullWidth: false,
  },
};

/**
 * Input with very long error message.
 */
export const LongErrorMessage: Story = {
  args: {
    label: 'Email',
    type: 'email',
    error: 'The email address you entered is invalid. Please ensure it follows the format: name@example.com and try again.',
    placeholder: 'you@example.com',
  },
};

/**
 * Showcase of all input states side by side.
 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic States</h3>
        <div className="space-y-4">
          <Input label="Default Input" placeholder="Enter text..." />
          <Input label="With Hint" hint="This is a helpful hint" placeholder="Enter text..." />
          <Input label="Required Field" required placeholder="Required field" />
          <Input label="Disabled Field" disabled placeholder="Cannot edit" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Validation States</h3>
        <div className="space-y-4">
          <Input 
            label="Valid Input" 
            placeholder="you@example.com" 
            type="email"
          />
          <Input
            label="Error State"
            error="This field is required"
            placeholder="you@example.com"
            type="email"
          />
          <Input
            label="Error with Hint"
            error="Invalid format"
            hint="This hint is hidden when error is present"
            placeholder="Enter value"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Input Types</h3>
        <div className="space-y-4">
          <Input label="Text" type="text" placeholder="Text input" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Input label="Number" type="number" placeholder="42" />
          <Input label="Tel" type="tel" placeholder="+1 (555) 123-4567" />
          <Input label="URL" type="url" placeholder="https://example.com" />
          <Input label="Search" type="search" placeholder="Search..." />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Width Variants</h3>
        <div className="space-y-4">
          <Input label="Full Width (Default)" placeholder="Takes full container width" />
          <Input label="Compact Width" fullWidth={false} placeholder="Auto width" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Interactive controlled input demo.
 */
export const ControlledInput: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Validate email format
      if (newValue && !newValue.includes('@')) {
        setError('Must include @ symbol');
      } else {
        setError('');
      }
    };

    return (
      <div className="space-y-4 p-6 max-w-md">
        <Input
          label="Email Address"
          type="email"
          value={value}
          onChange={handleChange}
          error={error}
          hint="Enter a valid email address"
          placeholder="you@example.com"
          required
        />
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Current value: <code className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">{value || '(empty)'}</code>
        </div>
      </div>
    );
  },
};

/**
 * Form example with multiple inputs.
 */
export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.username) {
        newErrors.username = 'Username is required';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!formData.email.includes('@')) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!');
      }
    };

    return (
      <div className="p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Sign Up Form
          </h3>

          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={errors.username}
            required
            placeholder="johndoe"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            hint="We'll never share your email"
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            hint="At least 8 characters"
            required
            placeholder="••••••••"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            required
            placeholder="••••••••"
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    );
  },
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-6">
      <div className="space-y-4 p-6 bg-white rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Light Mode</h3>
        <Input label="Username" placeholder="Enter username" />
        <Input label="Email" type="email" error="Invalid email" placeholder="you@example.com" />
        <Input label="Password" type="password" hint="At least 8 characters" placeholder="••••••••" />
      </div>

      <div className="dark space-y-4 p-6 bg-slate-900 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Dark Mode</h3>
        <Input label="Username" placeholder="Enter username" />
        <Input label="Email" type="email" error="Invalid email" placeholder="you@example.com" />
        <Input label="Password" type="password" hint="At least 8 characters" placeholder="••••••••" />
      </div>
    </div>
  ),
};
