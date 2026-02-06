import { useState } from 'react';
import { Modal } from '../../lib/components/ui/Modal/Modal';
import { Button } from '../../lib/components/ui/Button/Button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Credit packages with pricing
const CREDIT_PACKAGES = [
  {
    credits: 50,
    price: 5.0,
    pricePerCredit: 0.1,
    savings: null,
    popular: false,
  },
  {
    credits: 175,
    price: 15.0,
    pricePerCredit: 0.086,
    savings: '15%',
    popular: true,
  },
  {
    credits: 400,
    price: 30.0,
    pricePerCredit: 0.075,
    savings: '25%',
    popular: false,
  },
  {
    credits: 750,
    price: 50.0,
    pricePerCredit: 0.067,
    savings: '33%',
    popular: false,
  },
];

interface CreditPackageCardProps {
  credits: number;
  price: number;
  savings: string | null;
  popular: boolean;
  selected: boolean;
  onClick: () => void;
}

function CreditPackageCard({
  credits,
  price,
  savings,
  popular,
  selected,
  onClick,
}: CreditPackageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-6 rounded-lg border-2 transition-all text-left ${
        selected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Most Popular
        </div>
      )}
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{credits}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">minutes</p>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-4">
          ${price.toFixed(2)}
        </p>
        {savings && (
          <div className="mt-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
            Save {savings}
          </div>
        )}
      </div>
    </button>
  );
}

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings?credits_purchased=true`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setProcessing(false);
      } else {
        // Payment succeeded - redirect will happen automatically
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!stripe || processing}>
          {processing ? 'Processing...' : 'Complete Purchase'}
        </Button>
      </div>
    </form>
  );
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Credit Purchase Modal
 *
 * Allows users to purchase additional transcription minutes.
 * Integrates with Stripe Payment Intents for secure payment processing.
 *
 * @example
 * const [showModal, setShowModal] = useState(false);
 *
 * <CreditPurchaseModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => {
 *     toast.success('Credits purchased!');
 *     refetchBalance();
 *   }}
 * />
 */
export function CreditPurchaseModal({ isOpen, onClose, onSuccess }: CreditPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePackageSelect(credits: number) {
    setSelectedPackage(credits);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Failed to create payment intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment intent');
      setSelectedPackage(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelectedPackage(null);
    setClientSecret(null);
    setError(null);
    onClose();
  }

  function handleSuccess() {
    handleClose();
    onSuccess?.();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Credits" size="large">
      <div className="space-y-6">
        {!clientSecret ? (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              Purchase additional transcription minutes for hosted API usage. Credits never expire.
            </p>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <CreditPackageCard
                  key={pkg.credits}
                  credits={pkg.credits}
                  price={pkg.price}
                  savings={pkg.savings}
                  popular={pkg.popular}
                  selected={selectedPackage === pkg.credits}
                  onClick={() => handlePackageSelect(pkg.credits)}
                />
              ))}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Preparing payment...
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 How Credits Work
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• 1 credit = 1 minute of transcription time</li>
                <li>• Credits are used when your monthly quota is exhausted</li>
                <li>• Credits never expire</li>
                <li>• Larger packages offer better value</li>
              </ul>
            </div>
          </>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm onSuccess={handleSuccess} onCancel={handleClose} />
          </Elements>
        )}
      </div>
    </Modal>
  );
}
