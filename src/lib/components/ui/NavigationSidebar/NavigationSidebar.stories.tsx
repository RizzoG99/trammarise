import type { Meta, StoryObj } from '@storybook/react-vite';
import { User, CreditCard, Key, Bell } from 'lucide-react';
import { NavigationSidebar } from './NavigationSidebar';

const meta: Meta<typeof NavigationSidebar> = {
  title: 'UI/NavigationSidebar',
  component: NavigationSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    items: [
      { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
      { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
      { id: 'api-keys', label: 'API Keys', icon: <Key className="w-5 h-5" /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    ],
    activeId: 'profile',
    onSelect: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof NavigationSidebar>;

export const Default: Story = {};

export const BillingActive: Story = {
  args: { activeId: 'billing' },
};

export const NoIcons: Story = {
  args: {
    items: [
      { id: 'profile', label: 'Profile' },
      { id: 'billing', label: 'Billing' },
      { id: 'api-keys', label: 'API Keys' },
    ],
  },
};
