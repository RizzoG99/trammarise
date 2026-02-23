import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiKey } from '@/context/ApiKeyContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button, Input } from '@/lib';
import { Eye, EyeOff, Key, CheckCircle, XCircle, Info } from 'lucide-react';

export function ApiKeysTab() {
  const { t } = useTranslation();
  const { apiKey, setApiKey, clearApiKey, testConnection } = useApiKey();
  const { isSubscribed } = useSubscription();

  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    setTestStatus('testing');
    const isValid = await testConnection(inputValue);
    setTestStatus(isValid ? 'success' : 'error');
    if (isValid) {
      setApiKey(inputValue);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue('');
    setTestStatus('idle');
  };

  return (
    <div className="space-y-6">
      {/* Context Banner for Paid Users */}
      {isSubscribed && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {t('userMenu.apiKeys.optionalForPaid')}
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              {t('userMenu.apiKeys.optionalExplanation')}
            </p>
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-text-secondary" />
          <label className="text-sm font-medium text-text-primary">
            {t('userMenu.apiKeys.openAiKey')}
          </label>
        </div>

        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="sk-..."
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            aria-label={showKey ? t('userMenu.apiKeys.hideKey') : t('userMenu.apiKeys.showKey')}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Test Status */}
        {testStatus === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>{t('userMenu.apiKeys.connectionSuccess')}</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-accent-error">
            <XCircle className="w-4 h-4" />
            <span>{t('userMenu.apiKeys.connectionError')}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleTest}
            disabled={!inputValue.trim() || testStatus === 'testing'}
            className="flex-1"
          >
            {testStatus === 'testing'
              ? t('userMenu.apiKeys.testing')
              : t('userMenu.apiKeys.testConnection')}
          </Button>
          {apiKey && (
            <Button variant="outline" onClick={handleClear}>
              {t('userMenu.apiKeys.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-bg-secondary rounded-lg">
        <p className="text-xs text-text-secondary">🔒 {t('userMenu.apiKeys.securityNotice')}</p>
      </div>
    </div>
  );
}
