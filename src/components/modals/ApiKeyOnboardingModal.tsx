import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-react';
import { Modal, Button, Text, Heading, Input } from '@/lib';
import { Key, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { saveApiKey, deleteSavedApiKey } from '@/utils/api';
import { saveApiConfig, clearApiConfig } from '@/utils/session-storage';
import { useOnboarding } from '@/context/OnboardingContext';

interface ApiKeyOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ApiKeyOnboardingModal({ isOpen, onComplete }: ApiKeyOnboardingModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut, session } = useClerk();
  const { isViewingPricing, setIsViewingPricing } = useOnboarding();
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError(t('onboarding.modal.option1.errors.empty', 'Please enter your API key'));
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError(
        t(
          'onboarding.modal.option1.errors.invalidFormat',
          'Invalid API key format. OpenAI keys start with "sk-"'
        )
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (rememberKey) {
        // Save to database (encrypted)
        await saveApiKey(apiKey, 'openai');
        // Load into session storage for immediate use
        saveApiConfig('openai', apiKey, apiKey);
      } else {
        // Save to session storage only for this session
        saveApiConfig('openai', apiKey, apiKey);
      }

      // Complete onboarding
      onComplete();

      // Redirect to home page
      navigate('/');
    } catch {
      setError(
        t('onboarding.modal.option1.errors.saveFailed', 'Failed to save API key. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgrade = () => {
    setIsViewingPricing(true); // Hide modal
    navigate('/pricing');
  };

  const handleClose = async () => {
    try {
      // Clear session storage API key
      clearApiConfig();

      // Delete saved API key from database
      if (session) {
        const getToken = async () => session.getToken();
        await deleteSavedApiKey(getToken);
      }
    } catch (error) {
      console.error('Error clearing API keys on logout:', error);
      // Continue with logout even if cleanup fails
    }

    // Sign out the user
    await signOut();
    // Redirect to welcome page
    navigate('/welcome');
  };

  return (
    <Modal
      isOpen={isOpen && !isViewingPricing}
      onClose={handleClose}
      title={t('onboarding.modal.title', '🔑 Welcome to Trammarise')}
      disableBackdropClick={true}
    >
      <div className="space-y-6">
        {/* Main message */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <Heading level="h3" className="mb-2">
            {t('onboarding.modal.heading', 'One More Step to Get Started')}
          </Heading>
          <Text variant="body" color="secondary" className="mb-4">
            {t(
              'onboarding.modal.description',
              'To use Trammarise, you need to either provide your own OpenAI API key or upgrade to a Pro plan.'
            )}
          </Text>
        </div>

        {/* API Key Input Section */}
        <div className="bg-bg-secondary/50 dark:bg-white/5 rounded-lg p-4">
          <Heading level="h3" className="mb-3 text-base">
            {t('onboarding.modal.option1.title', 'Option 1: Use Your Own API Key (Free)')}
          </Heading>

          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('onboarding.modal.option1.placeholder', 'sk-...')}
            className="mb-3"
            disabled={isSubmitting}
          />

          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
              disabled={isSubmitting}
            />
            <Text variant="small" color="secondary">
              {t('onboarding.modal.option1.rememberKey', 'Remember my API key (stored encrypted)')}
            </Text>
          </label>

          {error && (
            <Text variant="small" className="text-red-600 dark:text-red-400 mb-3">
              {error}
            </Text>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !apiKey.trim()}
            className="w-full mb-3"
          >
            {isSubmitting
              ? t('onboarding.modal.option1.saving', 'Saving...')
              : t('onboarding.modal.option1.continueButton', 'Continue with API Key')}
          </Button>

          {/* How to get API key */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showInstructions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {t('onboarding.modal.option1.instructions.toggle', 'How to get an OpenAI API key')}
          </button>

          {showInstructions && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  {t('onboarding.modal.option1.instructions.step1', 'Go to platform.openai.com')}{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  {t('onboarding.modal.option1.instructions.step2', 'Sign in or create an account')}
                </li>
                <li>
                  {t(
                    'onboarding.modal.option1.instructions.step3',
                    'Click "Create new secret key"'
                  )}
                </li>
                <li>
                  {t(
                    'onboarding.modal.option1.instructions.step4',
                    'Copy the key (starts with "sk-")'
                  )}
                </li>
                <li>
                  {t('onboarding.modal.option1.instructions.step5', 'Paste it in the field above')}
                </li>
              </ol>
              <Text variant="small" className="text-gray-600 dark:text-gray-400 mt-2">
                {t(
                  'onboarding.modal.option1.instructions.note',
                  "💡 You'll pay OpenAI directly for usage (typically $0.006/minute for Whisper)"
                )}
              </Text>
              <Text variant="small" className="text-gray-500 dark:text-gray-400 mt-1">
                {t(
                  'onboarding.modal.option1.instructions.privacyNote',
                  'Your API key is transmitted through our servers to process requests but is never stored or logged.'
                )}
              </Text>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
              {t('onboarding.modal.divider', 'or')}
            </span>
          </div>
        </div>

        {/* Upgrade Option */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <Heading level="h3" className="mb-2 text-base">
            {t('onboarding.modal.option2.title', 'Option 2: Upgrade to Pro')}
          </Heading>
          <Text variant="body" color="secondary" className="mb-3">
            {t(
              'onboarding.modal.option2.description',
              'Get 500 minutes/month with hosted API, cloud sync, and priority support.'
            )}
          </Text>
          <Button onClick={handleUpgrade} variant="outline" className="w-full">
            {t('onboarding.modal.option2.button', 'View Pro Plans →')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
