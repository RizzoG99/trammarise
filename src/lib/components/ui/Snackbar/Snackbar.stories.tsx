import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Snackbar } from './Snackbar';
import { Button } from '../Button';

const meta: Meta<typeof Snackbar> = {
  title: 'UI/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

/**
 * Info variant (default) - Blue background for general information
 */
export const Info: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Info</Button>
        <Snackbar
          isOpen={isOpen}
          message="This is an informational message"
          variant="info"
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Success variant - Green background for successful operations
 */
export const Success: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="success">
          Show Success
        </Button>
        <Snackbar
          isOpen={isOpen}
          message="File saved successfully!"
          variant="success"
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Error variant - Red background for errors and failures
 */
export const Error: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="danger">
          Show Error
        </Button>
        <Snackbar
          isOpen={isOpen}
          message="Failed to upload file. Please try again."
          variant="error"
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Warning variant - Orange background for warnings and cautions
 */
export const Warning: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Warning</Button>
        <Snackbar
          isOpen={isOpen}
          message="Your session will expire in 5 minutes"
          variant="warning"
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * All variants shown together for comparison
 */
export const AllVariants: Story = {
  render: () => {
    const [openVariants, setOpenVariants] = useState<string[]>([]);

    const showSnackbar = (variant: string) => {
      if (!openVariants.includes(variant)) {
        setOpenVariants([...openVariants, variant]);
      }
    };

    const closeSnackbar = (variant: string) => {
      setOpenVariants(openVariants.filter(v => v !== variant));
    };

    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => showSnackbar('info')}>Info</Button>
        <Button onClick={() => showSnackbar('success')} variant="success">
          Success
        </Button>
        <Button onClick={() => showSnackbar('warning')}>Warning</Button>
        <Button onClick={() => showSnackbar('error')} variant="danger">
          Error
        </Button>

        <Snackbar
          isOpen={openVariants.includes('info')}
          message="This is an info message"
          variant="info"
          onClose={() => closeSnackbar('info')}
        />
        <Snackbar
          isOpen={openVariants.includes('success')}
          message="Operation completed successfully!"
          variant="success"
          onClose={() => closeSnackbar('success')}
        />
        <Snackbar
          isOpen={openVariants.includes('warning')}
          message="Please review your settings"
          variant="warning"
          onClose={() => closeSnackbar('warning')}
        />
        <Snackbar
          isOpen={openVariants.includes('error')}
          message="Something went wrong"
          variant="error"
          onClose={() => closeSnackbar('error')}
        />
      </div>
    );
  },
};

/**
 * Custom duration - Auto-dismisses after 2 seconds instead of default 4
 */
export const CustomDuration: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show (2s duration)</Button>
        <Snackbar
          isOpen={isOpen}
          message="This will auto-close in 2 seconds"
          variant="info"
          onClose={() => setIsOpen(false)}
          duration={2000}
        />
      </>
    );
  },
};

/**
 * No auto-dismiss - Must be closed manually
 */
export const NeverAutoDismiss: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Persistent</Button>
        <Snackbar
          isOpen={isOpen}
          message="This notification won't auto-close. Click X to dismiss."
          variant="warning"
          onClose={() => setIsOpen(false)}
          duration={0}
        />
      </>
    );
  },
};

/**
 * Long message - Demonstrates how the component handles lengthy text
 */
export const LongMessage: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Long Message</Button>
        <Snackbar
          isOpen={isOpen}
          message="This is a very long notification message that demonstrates how the component handles text wrapping and maintains readability even with extensive content. The close button remains accessible on the right side."
          variant="info"
          onClose={() => setIsOpen(false)}
          duration={8000}
        />
      </>
    );
  },
};

/**
 * Sequential notifications - Click multiple times to queue notifications
 */
export const Sequential: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const showNext = () => {
      setCount(c => c + 1);
      setIsOpen(true);
    };

    return (
      <>
        <Button onClick={showNext}>Show Notification #{count + 1}</Button>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Click multiple times to see how notifications update
        </p>
        <Snackbar
          isOpen={isOpen}
          message={`Notification #${count}`}
          variant="success"
          onClose={() => setIsOpen(false)}
          duration={3000}
        />
      </>
    );
  },
};

/**
 * Custom styling - Adding custom classes
 */
export const CustomStyling: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Custom Styled</Button>
        <Snackbar
          isOpen={isOpen}
          message="This notification has custom styling applied"
          variant="info"
          onClose={() => setIsOpen(false)}
          className="!min-w-[400px] font-bold"
        />
      </>
    );
  },
};

/**
 * Real-world example - Form submission feedback
 */
export const FormSubmitExample: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [variant, setVariant] = useState<'success' | 'error'>('success');
    const [message, setMessage] = useState('');

    const handleSubmit = (success: boolean) => {
      if (success) {
        setVariant('success');
        setMessage('Form submitted successfully!');
      } else {
        setVariant('error');
        setMessage('Form submission failed. Please try again.');
      }
      setIsOpen(true);
    };

    return (
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button onClick={() => handleSubmit(true)} variant="success">
          Submit (Success)
        </Button>
        <Button onClick={() => handleSubmit(false)} variant="danger">
          Submit (Error)
        </Button>

        <Snackbar
          isOpen={isOpen}
          message={message}
          variant={variant}
          onClose={() => setIsOpen(false)}
          duration={4000}
        />
      </div>
    );
  },
};
