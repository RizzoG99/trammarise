import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/lib';
import { ArrowLeft } from 'lucide-react';

export function OnboardingBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsViewingPricing } = useOnboarding();

  const handleReturnToSetup = () => {
    setIsViewingPricing(false); // Show modal again
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">
            {t(
              'onboarding.banner.message',
              "You're almost there! Complete setup to unlock Trammarise."
            )}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={handleReturnToSetup}
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex items-center gap-2"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          {t('onboarding.banner.button', 'Back to Setup')}
        </Button>
      </div>
    </div>
  );
}
