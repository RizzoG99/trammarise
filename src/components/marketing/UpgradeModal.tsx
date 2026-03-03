import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Text } from '@/lib';
import { Zap, Check, X } from 'lucide-react';
import { PricingCard } from '@/lib/components/ui/PricingCard/PricingCard';
import type { PricingPlan } from '@/lib/components/ui/PricingCard/PricingCard';
import { ToggleSwitch } from '@/lib/components/form/ToggleSwitch/ToggleSwitch';
import { SpeakerTranscriptPreview } from './SpeakerTranscriptPreview';

export type UpgradeTrigger =
  | 'limit_reached'
  | 'chat_gate'
  | 'watermark_remove'
  | 'history_limit'
  | 'speaker_diarization'
  | 'generic';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: UpgradeTrigger;
  title?: string;
  description?: string;
}

interface SpeakerDiarizationUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SpeakerDiarizationUpgradeModal({ isOpen, onClose }: SpeakerDiarizationUpgradeModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing', { state: { from: 'speaker_diarization' } });
  };

  const speakerPlan: PricingPlan = {
    id: 'pro',
    name: t('pricing.pro.name', 'Pro'),
    description: t('pricing.pro.desc', 'Best for individuals and professionals'),
    monthlyPrice: '$19',
    annualPrice: '$190',
    features: [
      t('upgrade.speakerDiarization.feature1', 'Color-coded speaker labels'),
      t('upgrade.speakerDiarization.feature2', 'Up to 10 speakers'),
      t('upgrade.speakerDiarization.feature3', 'Timestamped per utterance'),
    ],
    cta: t('upgrade.speakerDiarization.cta', 'Unlock Speaker ID'),
    popular: true,
    badge: t('pricing.popular', 'Most Popular'),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('upgrade.speakerDiarization.title')}
      hideHeader={true}
      className="max-w-3xl"
    >
      {/* Custom close button */}
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.cancel', 'Close')}
          className="absolute -top-2 right-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 pb-6">
          {/* Left: Live transcript preview */}
          <SpeakerTranscriptPreview />

          {/* Right: Focused pricing card */}
          <div className="flex flex-col">
            <PricingCard
              plan={speakerPlan}
              isCurrentPlan={false}
              billingPeriod="monthly"
              onSelect={handleUpgrade}
              className="flex-grow"
            />
            <div className="mt-3 text-center space-y-2">
              <button
                type="button"
                onClick={handleUpgrade}
                className="text-xs text-text-tertiary hover:text-text-secondary underline underline-offset-2 transition-colors"
              >
                {t('upgrade.speakerDiarization.annualHint', 'or pay annually and save 2 months')}
              </button>
              <div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-text-tertiary hover:text-text-primary text-sm"
                >
                  {t('common.maybeLater', 'Maybe Later')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const proPlan: PricingPlan = useMemo(
    () => ({
      id: 'pro',
      name: t('pricing.pro.name', 'Pro'),
      description: t('pricing.pro.desc', 'Best for individuals and professionals'),
      monthlyPrice: '$19',
      annualPrice: '$190',
      features: [
        t('pricing.pro.features.minutes', '500 minutes/month included'),
        t('pricing.pro.features.noKeys', 'No API keys needed'),
        t('pricing.pro.features.sync', 'Cross-device sync'),
        t('pricing.pro.features.chat', 'Chat with transcripts'),
        t('pricing.pro.features.support', 'Priority processing & support'),
      ],
      cta: t('upgrade.cta', 'View Plans & Upgrade'),
      popular: true,
      badge: t('pricing.popular', 'Most Popular'),
    }),
    [t]
  );

  if (trigger === 'speaker_diarization') {
    return <SpeakerDiarizationUpgradeModal isOpen={isOpen} onClose={onClose} />;
  }

  const getContent = () => {
    switch (trigger) {
      case 'limit_reached':
        return {
          title: t('upgrade.limitReached.title', "You've reached your free limit"),
          description: t(
            'upgrade.limitReached.desc',
            'Free users are limited to 60 minutes of processing per month. Upgrade to Pro for 500 minutes!'
          ),
          icon: <Zap className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
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
          icon: <Zap className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
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
          icon: <Zap className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
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
          icon: <Zap className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
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
          icon: <Zap className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
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
    <Modal isOpen={isOpen} onClose={onClose} title={content.title} className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2 pb-6">
        {/* Left Column: Context */}
        <div className="flex flex-col text-left justify-center h-full">
          <div className="mb-4">{content.icon}</div>

          <Text variant="body" className="mb-8 text-text-secondary text-lg">
            {content.description}
          </Text>

          <div className="bg-bg-secondary/50 rounded-xl p-6 border border-border mb-8 flex-grow">
            <h4 className="text-text-primary text-sm uppercase tracking-widest font-semibold mb-4 text-left">
              {t('upgrade.includes', 'Upgrade unlocks:')}
            </h4>
            <ul className="space-y-4">
              {content.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-text-primary text-left">
                  <Check className="w-5 h-5 text-accent-success flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full md:w-fit text-text-tertiary hover:text-text-primary"
          >
            {t('common.maybeLater', 'Maybe Later')}
          </Button>
        </div>

        {/* Right Column: Pricing & CTA */}
        <div className="flex flex-col h-full rounded-2xl relative">
          <div className="flex justify-start md:justify-end mb-4 pr-1">
            <ToggleSwitch
              label={t('pricing.annualPricing', 'Annual Billing')}
              description={t('pricing.save2Months', 'Save 2 months')}
              checked={billingPeriod === 'annual'}
              onChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
            />
          </div>
          <PricingCard
            plan={proPlan}
            isCurrentPlan={false}
            billingPeriod={billingPeriod}
            onSelect={handleUpgrade}
            className="flex-grow shadow-2xl scale-100 md:scale-105"
          />
        </div>
      </div>
    </Modal>
  );
}
