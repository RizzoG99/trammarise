import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Text } from '@/lib';
import { Zap, Check } from 'lucide-react';

export type UpgradeTrigger =
  | 'limit_reached'
  | 'chat_gate'
  | 'watermark_remove'
  | 'history_limit'
  | 'generic';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: UpgradeTrigger;
  title?: string;
  description?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  trigger,
  title: customTitle,
  description: customDescription,
}: UpgradeModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getContent = () => {
    switch (trigger) {
      case 'limit_reached':
        return {
          title: t('upgrade.limitReached.title', "You've reached your free limit"),
          description: t(
            'upgrade.limitReached.desc',
            'Free users are limited to 60 minutes of processing per month. Upgrade to Pro for 500 minutes!'
          ),
          icon: <Zap className="w-12 h-12 text-yellow-500 mb-4" />,
          features: [
            t('upgrade.features.minutes', '500 Minutes / Month'),
            t('upgrade.features.watermark', 'No Watermarks'),
            t('upgrade.features.chat', 'AI Chat Support'),
          ],
        };
      case 'chat_gate':
        return {
          title: t('upgrade.chatGate.title', 'Unlock AI Chat'),
          description: t(
            'upgrade.chatGate.desc',
            'Chatting with your transcript is a Pro feature. Upgrade to ask questions and get insights instantly.'
          ),
          icon: <Zap className="w-12 h-12 text-blue-500 mb-4" />,
          features: [
            t('upgrade.features.unlimitedChat', 'Unlimited AI Chat'),
            t('upgrade.features.advancedAnalysis', 'Advanced Analysis'),
            t('upgrade.features.prioritySupport', 'Priority Support'),
          ],
        };
      case 'watermark_remove':
        return {
          title: t('upgrade.watermark.title', 'Remove Watermark'),
          description: t(
            'upgrade.watermark.desc',
            'Professional documents require a professional look. Upgrade to remove the Trammarise watermark.'
          ),
          icon: <Zap className="w-12 h-12 text-purple-500 mb-4" />,
          features: [
            t('upgrade.features.cleanPdf', 'Clean PDF Exports'),
            t('upgrade.features.branding', 'Custom Branding'),
            t('upgrade.features.priorityProcessing', 'Priority Processing'),
          ],
        };
      case 'history_limit':
        return {
          title: t('upgrade.history.title', 'Unlock Your Full History'),
          description: t(
            'upgrade.history.desc',
            'Free users can only access their last 5 recordings. Upgrade to access your entire archive.'
          ),
          icon: <Zap className="w-12 h-12 text-green-500 mb-4" />,
          features: [
            t('upgrade.features.unlimitedHistory', 'Unlimited History'),
            t('upgrade.features.cloudBackup', 'Cloud Backup'),
            t('upgrade.features.sync', 'Cross-Device Sync'),
          ],
        };
      default:
        return {
          title: customTitle || t('upgrade.generic.title', 'Upgrade to Pro'),
          description:
            customDescription ||
            t(
              'upgrade.generic.desc',
              'Unlock the full power of Trammarise with a Pro subscription.'
            ),
          icon: <Zap className="w-12 h-12 text-indigo-500 mb-4" />,
          features: [
            t('upgrade.features.higherLimits', 'Higher Limits'),
            t('upgrade.features.advancedFeatures', 'Advanced Features'),
            t('upgrade.features.prioritySupport', 'Priority Support'),
          ],
        };
    }
  };

  const content = getContent();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing', { state: { from: 'results' } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content.title}>
      <div className="flex flex-col items-center text-center p-4">
        {content.icon}

        <Text variant="body" className="mb-6 text-text-secondary">
          {content.description}
        </Text>

        <div className="w-full bg-bg-secondary/50 rounded-lg p-4 mb-6 text-left">
          <ul className="space-y-2">
            {content.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-text-primary">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button onClick={handleUpgrade} className="w-full justify-center px-8 py-4 text-lg">
            {t('upgrade.cta', 'View Plans & Upgrade')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full justify-center">
            {t('common.maybeLater', 'Maybe Later')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
