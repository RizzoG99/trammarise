import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Example icons for demonstration
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
    <path d="M10 5v10M5 10h10" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
    <path d="M5 10l3 3 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'outline', 'small', 'large', 'circle', 'circle-thick'],
      description: 'Button style variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary button is the main call-to-action style.
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

/**
 * Secondary button for less prominent actions.
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

/**
 * Success button for positive actions.
 */
export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
};

/**
 * Danger button for destructive actions.
 */
export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

/**
 * Outline button for subtle actions.
 */
export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

/**
 * Button with an icon before the text.
 */
export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    icon: <CheckIcon />,
    variant: 'primary',
  },
};

/**
 * Disabled state for all variants.
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Small size variant for compact UI.
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'small',
  },
};

/**
 * Large size variant for prominent actions.
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'large',
  },
};

/**
 * Circle button for icon-only actions.
 */
export const Circle: Story = {
  args: {
    icon: <PlusIcon />,
    variant: 'circle',
    'aria-label': 'Add item',
  },
};

/**
 * Thick circle button with success styling.
 */
export const CircleThick: Story = {
  args: {
    icon: <CheckIcon />,
    variant: 'circle-thick',
    'aria-label': 'Confirm',
  },
};

/**
 * Showcase of all button variants side by side.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Standard Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Size Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="small">Small</Button>
          <Button>Default</Button>
          <Button variant="large">Large</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={<CheckIcon />}>With Icon</Button>
          <Button variant="success" icon={<CheckIcon />}>
            Success Action
          </Button>
          <Button variant="danger" icon={<PlusIcon />}>
            Danger Action
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Circle Buttons</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="circle" icon={<PlusIcon />} aria-label="Add" />
          <Button variant="circle-thick" icon={<CheckIcon />} aria-label="Confirm" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Disabled States</h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Primary Disabled</Button>
          <Button variant="secondary" disabled>
            Secondary Disabled
          </Button>
          <Button variant="success" disabled icon={<CheckIcon />}>
            Success Disabled
          </Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Interactive demo showing hover states.
 */
export const InteractiveDemo: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Hover over buttons to see transition effects:
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => alert('Primary clicked!')}>Click Me (Primary)</Button>
        <Button variant="success" onClick={() => alert('Success!')}>
          Click Me (Success)
        </Button>
        <Button variant="outline" onClick={() => alert('Outline clicked!')}>
          Click Me (Outline)
        </Button>
      </div>
    </div>
  ),
};
