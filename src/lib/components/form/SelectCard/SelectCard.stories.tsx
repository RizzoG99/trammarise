import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SelectCard } from './SelectCard';

const meta: Meta<typeof SelectCard> = {
  title: 'Form/SelectCard',
  component: SelectCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SelectCard>;

// Icon components for demos
const VideoIcon = () => <span>🎥</span>;
const AudioIcon = () => <span>🎵</span>;
const ImageIcon = () => <span>🖼️</span>;
const TextIcon = () => <span>📝</span>;

/**
 * Basic grid of selectable cards
 */
export const BasicGrid: Story = {
  render: () => {
    const [selected, setSelected] = useState('video');

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '300px' }}>
        <SelectCard
          value="video"
          label="Video"
          icon={<VideoIcon />}
          selected={selected === 'video'}
          onClick={() => setSelected('video')}
        />
        <SelectCard
          value="audio"
          label="Audio"
          icon={<AudioIcon />}
          selected={selected === 'audio'}
          onClick={() => setSelected('audio')}
        />
        <SelectCard
          value="image"
          label="Image"
          icon={<ImageIcon />}
          selected={selected === 'image'}
          onClick={() => setSelected('image')}
        />
        <SelectCard
          value="text"
          label="Text"
          icon={<TextIcon />}
          selected={selected === 'text'}
          onClick={() => setSelected('text')}
        />
      </div>
    );
  },
};

/**
 * Cards with descriptions
 */
export const WithDescriptions: Story = {
  render: () => {
    const [selected, setSelected] = useState('starter');

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '600px' }}>
        <SelectCard
          value="starter"
          label="Starter"
          description="Basic features"
          selected={selected === 'starter'}
          onClick={() => setSelected('starter')}
        />
        <SelectCard
          value="professional"
          label="Professional"
          description="Advanced tools"
          selected={selected === 'professional'}
          onClick={() => setSelected('professional')}
        />
        <SelectCard
          value="enterprise"
          label="Enterprise"
          description="Full suite"
          selected={selected === 'enterprise'}
          onClick={() => setSelected('enterprise')}
        />
      </div>
    );
  },
};

/**
 * Single selected card
 */
export const Selected: Story = {
  render: () => {
    return (
      <div style={{ width: '150px' }}>
        <SelectCard
          value="selected"
          label="Selected"
          icon={<VideoIcon />}
          selected={true}
          onClick={() => {}}
        />
      </div>
    );
  },
};

/**
 * Single unselected card
 */
export const Unselected: Story = {
  render: () => {
    return (
      <div style={{ width: '150px' }}>
        <SelectCard
          value="unselected"
          label="Unselected"
          icon={<AudioIcon />}
          selected={false}
          onClick={() => {}}
        />
      </div>
    );
  },
};

/**
 * Disabled cards
 */
export const Disabled: Story = {
  render: () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '300px' }}>
        <SelectCard
          value="available"
          label="Available"
          icon={<VideoIcon />}
          selected={true}
          onClick={() => {}}
        />
        <SelectCard
          value="locked"
          label="Locked"
          description="Premium only"
          icon={<span>🔒</span>}
          selected={false}
          onClick={() => {}}
          disabled={true}
        />
      </div>
    );
  },
};

/**
 * File type selection
 */
export const FileTypeSelection: Story = {
  render: () => {
    const [fileType, setFileType] = useState<string[]>([]);

    const toggle = (value: string) => {
      setFileType(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    };

    return (
      <div>
        <h3 style={{ margin: '0 0 1rem 0' }}>Select file types to support</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '650px' }}>
          <SelectCard
            value="video"
            label="Video"
            description=".mp4, .mov"
            icon={<VideoIcon />}
            selected={fileType.includes('video')}
            onClick={() => toggle('video')}
          />
          <SelectCard
            value="audio"
            label="Audio"
            description=".mp3, .wav"
            icon={<AudioIcon />}
            selected={fileType.includes('audio')}
            onClick={() => toggle('audio')}
          />
          <SelectCard
            value="image"
            label="Image"
            description=".jpg, .png"
            icon={<ImageIcon />}
            selected={fileType.includes('image')}
            onClick={() => toggle('image')}
          />
          <SelectCard
            value="text"
            label="Text"
            description=".txt, .md"
            icon={<TextIcon />}
            selected={fileType.includes('text')}
            onClick={() => toggle('text')}
          />
        </div>
        {fileType.length > 0 && (
          <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            Selected: <strong>{fileType.join(', ')}</strong>
          </p>
        )}
      </div>
    );
  },
};

/**
 * Custom styling
 */
export const CustomStyling: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '300px' }}>
        <SelectCard
          value="option1"
          label="Custom Styled"
          selected={selected === 'option1'}
          onClick={() => setSelected('option1')}
          className="!border-4 !border-blue-500"
        />
        <SelectCard
          value="option2"
          label="Standard"
          selected={selected === 'option2'}
          onClick={() => setSelected('option2')}
        />
      </div>
    );
  },
};

/**
 * Large grid example
 */
export const LargeGrid: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');

    const options = [
      { value: 'option1', label: 'Option 1', icon: '1️⃣' },
      { value: 'option2', label: 'Option 2', icon: '2️⃣' },
      { value: 'option3', label: 'Option 3', icon: '3️⃣' },
      { value: 'option4', label: 'Option 4', icon: '4️⃣' },
      { value: 'option5', label: 'Option 5', icon: '5️⃣' },
      { value: 'option6', label: 'Option 6', icon: '6️⃣' },
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '500px' }}>
        {options.map((option) => (
          <SelectCard
            key={option.value}
            value={option.value}
            label={option.label}
            icon={<span style={{ fontSize: '2rem' }}>{option.icon}</span>}
            selected={selected === option.value}
            onClick={() => setSelected(option.value)}
          />
        ))}
      </div>
    );
  },
};

/**
 * Payment method selection
 */
export const PaymentMethod: Story = {
  render: () => {
    const [method, setMethod] = useState('card');

    return (
      <div>
        <h3 style={{ margin: '0 0 1rem 0' }}>Choose Payment Method</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '650px' }}>
          <SelectCard
            value="card"
            label="Credit Card"
            icon={<span>💳</span>}
            selected={method === 'card'}
            onClick={() => setMethod('card')}
          />
          <SelectCard
            value="paypal"
            label="PayPal"
            icon={<span>🅿️</span>}
            selected={method === 'paypal'}
            onClick={() => setMethod('paypal')}
          />
          <SelectCard
            value="bank"
            label="Bank Transfer"
            icon={<span>🏦</span>}
            selected={method === 'bank'}
            onClick={() => setMethod('bank')}
          />
          <SelectCard
            value="crypto"
            label="Crypto"
            description="Coming soon"
            icon={<span>₿</span>}
            selected={method === 'crypto'}
            onClick={() => setMethod('crypto')}
            disabled={true}
          />
        </div>
      </div>
    );
  },
};
