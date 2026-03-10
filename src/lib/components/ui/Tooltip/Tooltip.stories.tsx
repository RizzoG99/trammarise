import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  args: {
    content: 'This is a helpful tooltip',
    placement: 'top',
    children: (
      <button className="flex items-center gap-1 px-3 py-2 rounded border border-white/20 text-sm">
        Hover me <HelpCircle className="w-4 h-4" />
      </button>
    ),
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip below the trigger',
    placement: 'bottom',
    children: <button className="px-3 py-2 rounded border border-white/20 text-sm">Hover</button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on the left',
    placement: 'left',
    children: <button className="px-3 py-2 rounded border border-white/20 text-sm">Hover</button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on the right',
    placement: 'right',
    children: <button className="px-3 py-2 rounded border border-white/20 text-sm">Hover</button>,
  },
};
