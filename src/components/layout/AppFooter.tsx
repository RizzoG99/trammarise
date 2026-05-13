import { AudioWaveform, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/types/routing';

// TODO: replace with real URLs before launch
const LEGAL_URLS = { privacy: '#', terms: '#' };
const SOCIAL_URLS = { twitter: '#' };

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const iconClass = 'text-text-tertiary hover:text-text-primary transition-colors';

  return (
    <footer
      className={`border-t border-border backdrop-blur-md py-4 ${className}`}
      style={{ backgroundColor: 'var(--color-bg-glass)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6">
          {/* Left: Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group" aria-label="Trammarise">
            <div className="size-7 flex items-center justify-center bg-primary rounded text-white group-hover:bg-primary-hover transition-colors">
              <AudioWaveform className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
              Trammarise
            </span>
          </Link>

          {/* Center: Copyright */}
          <p className="text-xs text-text-tertiary order-last sm:order-none w-full sm:w-auto text-center">
            {t('footer.copyright', { year })}
          </p>

          {/* Right: Legal + Social */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Legal links */}
            <a
              href={LEGAL_URLS.privacy}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              {t('footer.links.privacy')}
            </a>
            <a
              href={LEGAL_URLS.terms}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              {t('footer.links.terms')}
            </a>

            {/* Divider */}
            <span className="w-px h-3 bg-border" aria-hidden="true" />

            {/* Social icons */}
            <a
              href="https://github.com/RizzoG99"
              aria-label={t('footer.social.github')}
              target="_blank"
              rel="noopener noreferrer"
              className={iconClass}
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/rizzog99"
              aria-label={t('footer.social.linkedin')}
              target="_blank"
              rel="noopener noreferrer"
              className={iconClass}
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_URLS.twitter}
              aria-label={t('footer.social.twitter')}
              target="_blank"
              rel="noopener noreferrer"
              className={iconClass}
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="mailto:gabriele.rizzo.ph@gmail.com"
              aria-label={t('footer.social.contact')}
              className={iconClass}
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
