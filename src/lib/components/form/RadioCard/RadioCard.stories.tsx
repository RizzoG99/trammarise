import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioCard } from './RadioCard';

const meta: Meta<typeof RadioCard> = {
  title: 'Form/RadioCard',
  component: RadioCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof RadioCard>;

/**
 * Basic radio group for selecting a plan
 */
export const BasicGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('basic');

    return (
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <RadioCard
          name="plan"
          value="basic"
          checked={selected === 'basic'}
          onChange={setSelected}
          title="Basic Plan"
          description="Perfect for individuals just getting started"
        />
        <RadioCard
          name="plan"
          value="pro"
          checked={selected === 'pro'}
          onChange={setSelected}
          title="Pro Plan"
          description="Best for growing teams and businesses"
        />
        <RadioCard
          name="plan"
          value="enterprise"
          checked={selected === 'enterprise'}
          onChange={setSelected}
          title="Enterprise Plan"
          description="Custom solutions for large organizations"
        />
        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
          Selected: <strong>{selected}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Single checked card
 */
export const Checked: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');

    return (
      <div style={{ width: '400px' }}>
        <RadioCard
          name="demo"
          value="option1"
          checked={selected === 'option1'}
          onChange={setSelected}
          title="Selected Option"
          description="This option is currently selected"
        />
      </div>
    );
  },
};

/**
 * Single unchecked card
 */
export const Unchecked: Story = {
  render: () => {
    const [selected, setSelected] = useState('other');

    return (
      <div style={{ width: '400px' }}>
        <RadioCard
          name="demo"
          value="option1"
          checked={selected === 'option1'}
          onChange={setSelected}
          title="Unselected Option"
          description="Click to select this option"
        />
      </div>
    );
  },
};

/**
 * Disabled options
 */
export const Disabled: Story = {
  render: () => {
    return (
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <RadioCard
          name="disabled-demo"
          value="available"
          checked={true}
          onChange={() => {}}
          title="Available Option"
          description="This is enabled and selected"
        />
        <RadioCard
          name="disabled-demo"
          value="unavailable"
          checked={false}
          onChange={() => {}}
          title="Unavailable Option"
          description="This option is disabled"
          disabled={true}
        />
        <RadioCard
          name="disabled-demo"
          value="locked"
          checked={false}
          onChange={() => {}}
          title="Locked Feature"
          description="Upgrade to unlock this feature"
          disabled={true}
        />
      </div>
    );
  },
};

/**
 * Without descriptions
 */
export const WithoutDescription: Story = {
  render: () => {
    const [selected, setSelected] = useState('small');

    return (
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <RadioCard
          name="size"
          value="small"
          checked={selected === 'small'}
          onChange={setSelected}
          title="Small"
        />
        <RadioCard
          name="size"
          value="medium"
          checked={selected === 'medium'}
          onChange={setSelected}
          title="Medium"
        />
        <RadioCard
          name="size"
          value="large"
          checked={selected === 'large'}
          onChange={setSelected}
          title="Large"
        />
      </div>
    );
  },
};

/**
 * Pricing comparison example
 */
export const PricingComparison: Story = {
  render: () => {
    const [selected, setSelected] = useState('pro');

    return (
      <div style={{ width: '500px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <RadioCard
          name="pricing"
          value="starter"
          checked={selected === 'starter'}
          onChange={setSelected}
          title={
            <div>
              <div>Starter</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                $9<span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>/mo</span>
              </div>
            </div>
          }
          description="Up to 5 users"
        />
        <RadioCard
          name="pricing"
          value="pro"
          checked={selected === 'pro'}
          onChange={setSelected}
          title={
            <div>
              <div>Pro</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                $29<span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>/mo</span>
              </div>
            </div>
          }
          description="Up to 25 users"
        />
        <RadioCard
          name="pricing"
          value="business"
          checked={selected === 'business'}
          onChange={setSelected}
          title={
            <div>
              <div>Business</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                $99<span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>/mo</span>
              </div>
            </div>
          }
          description="Unlimited users"
        />
      </div>
    );
  },
};

/**
 * Shipping method selection
 */
export const ShippingMethod: Story = {
  render: () => {
    const [method, setMethod] = useState('standard');

    return (
      <div style={{ width: '450px' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Choose Shipping Method</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <RadioCard
            name="shipping"
            value="standard"
            checked={method === 'standard'}
            onChange={setMethod}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Standard Shipping</span>
                <span style={{ fontWeight: 'normal' }}>Free</span>
              </div>
            }
            description="5-7 business days"
          />
          <RadioCard
            name="shipping"
            value="express"
            checked={method === 'express'}
            onChange={setMethod}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Express Shipping</span>
                <span style={{ fontWeight: 'normal' }}>$9.99</span>
              </div>
            }
            description="2-3 business days"
          />
          <RadioCard
            name="shipping"
            value="overnight"
            checked={method === 'overnight'}
            onChange={setMethod}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Overnight Shipping</span>
                <span style={{ fontWeight: 'normal' }}>$24.99</span>
              </div>
            }
            description="Next business day"
          />
        </div>
      </div>
    );
  },
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');

    return (
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <RadioCard
          name="custom"
          value="option1"
          checked={selected === 'option1'}
          onChange={setSelected}
          title="Custom Styled"
          description="With custom CSS classes"
          className="!border-4 !border-blue-500"
        />
        <RadioCard
          name="custom"
          value="option2"
          checked={selected === 'option2'}
          onChange={setSelected}
          title="Another Option"
          description="Standard styling"
        />
      </div>
    );
  },
};

/**
 * Survey question example
 */
export const SurveyQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState('');

    return (
      <div style={{ width: '500px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>How would you rate our service?</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.875rem' }}>
          Please select one option
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <RadioCard
            name="rating"
            value="excellent"
            checked={answer === 'excellent'}
            onChange={setAnswer}
            title="Excellent"
            description="Everything exceeded my expectations"
          />
          <RadioCard
            name="rating"
            value="good"
            checked={answer === 'good'}
            onChange={setAnswer}
            title="Good"
            description="Met my expectations"
          />
          <RadioCard
            name="rating"
            value="fair"
            checked={answer === 'fair'}
            onChange={setAnswer}
            title="Fair"
            description="Some aspects could be improved"
          />
          <RadioCard
            name="rating"
            value="poor"
            checked={answer === 'poor'}
            onChange={setAnswer}
            title="Poor"
            description="Did not meet my expectations"
          />
        </div>
        {answer && (
          <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            Your rating: <strong>{answer}</strong>
          </p>
        )}
      </div>
    );
  },
};
