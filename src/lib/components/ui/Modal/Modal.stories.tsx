import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/**
 * Basic modal with title and content. Click the "Open Modal" button to see it.
 */
export const Basic: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Basic Modal"
        >
          <p>This is a basic modal with just content and a close button.</p>
          <p>You can close it by:</p>
          <ul>
            <li>Clicking the X button</li>
            <li>Clicking outside the modal</li>
            <li>Pressing ESC key</li>
          </ul>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with action buttons in the footer.
 */
export const WithActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState('');

    const handleConfirm = () => {
      setResult('Confirmed!');
      setIsOpen(false);
    };

    const handleCancel = () => {
      setResult('Cancelled');
      setIsOpen(false);
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Actions</Button>
        {result && <p style={{ marginTop: '1rem' }}>Result: {result}</p>}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          actions={[
            { label: 'Cancel', onClick: handleCancel, variant: 'outline' },
            { label: 'Confirm', onClick: handleConfirm, variant: 'primary' },
          ]}
        >
          <p>Are you sure you want to proceed with this action?</p>
        </Modal>
      </>
    );
  },
};

/**
 * Destructive action modal with danger button.
 */
export const DangerAction: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const handleDelete = () => {
      setDeleted(true);
      setIsOpen(false);
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="danger">
          Delete Item
        </Button>
        {deleted && <p style={{ marginTop: '1rem', color: 'red' }}>Item deleted!</p>}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete Item"
          actions={[
            { label: 'Cancel', onClick: () => setIsOpen(false), variant: 'outline' },
            { label: 'Delete', onClick: handleDelete, variant: 'danger' },
          ]}
        >
          <p><strong>Warning:</strong> This action cannot be undone.</p>
          <p>Are you sure you want to delete this item?</p>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with backdrop click disabled - must use X button or ESC to close.
 */
export const NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal (No Backdrop Close)</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Important Form"
          disableBackdropClick={true}
          actions={[
            { label: 'Submit', onClick: () => setIsOpen(false), variant: 'success' },
          ]}
        >
          <p>This modal cannot be closed by clicking outside.</p>
          <p>You must use the X button, ESC key, or Submit button.</p>
          <div style={{ marginTop: '1rem' }}>
            <label>
              Name: <input type="text" style={{ marginLeft: '0.5rem' }} />
            </label>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with long scrollable content.
 */
export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Long Content</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Terms and Conditions"
          actions={[
            { label: 'Decline', onClick: () => setIsOpen(false), variant: 'outline' },
            { label: 'Accept', onClick: () => setIsOpen(false), variant: 'success' },
          ]}
        >
          <div>
            <h3>Section 1: Introduction</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

            <h3>Section 2: Terms of Use</h3>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

            <h3>Section 3: Privacy Policy</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

            <h3>Section 4: Liability</h3>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

            <h3>Section 5: Additional Terms</h3>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>

            <h3>Section 6: Final Provisions</h3>
            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.</p>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with complex form content.
 */
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Account"
          actions={[
            { label: 'Cancel', onClick: () => setIsOpen(false), variant: 'outline' },
            { label: 'Create Account', onClick: () => setIsOpen(false), variant: 'success' },
          ]}
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Username:
                <input type="text" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Email:
                <input type="email" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password:
                <input type="password" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" />
                I agree to the terms and conditions
              </label>
            </div>
          </form>
        </Modal>
      </>
    );
  },
};

/**
 * Multiple action buttons with different variants.
 */
export const MultipleActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState('');

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Multiple Actions</Button>
        {action && <p style={{ marginTop: '1rem' }}>Selected: {action}</p>}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Choose an Action"
          actions={[
            {
              label: 'Save Draft',
              onClick: () => { setAction('Draft saved'); setIsOpen(false); },
              variant: 'outline'
            },
            {
              label: 'Preview',
              onClick: () => { setAction('Preview opened'); setIsOpen(false); },
              variant: 'secondary'
            },
            {
              label: 'Publish',
              onClick: () => { setAction('Published'); setIsOpen(false); },
              variant: 'success'
            },
          ]}
        >
          <p>What would you like to do with your document?</p>
        </Modal>
      </>
    );
  },
};
