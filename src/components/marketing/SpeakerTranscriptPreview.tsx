import { useTranslation } from 'react-i18next';

const MOCK_UTTERANCES = [
  {
    speaker: 'Speaker 1',
    time: '00:12',
    text: "Thanks everyone for joining today's product review.",
  },
  {
    speaker: 'Speaker 2',
    time: '00:28',
    text: 'Happy to be here. Should we start with the roadmap?',
  },
  {
    speaker: 'Speaker 1',
    time: '00:45',
    text: "Absolutely. Let's walk through Q2 milestones first.",
  },
  { speaker: 'Speaker 3', time: '01:02', text: 'Engineering pushed the API deadline by a week.' },
] as const;

// Speaker index → solid color tokens for border, chip, and row background
const SPEAKER_COLORS = [
  {
    border: 'border-blue-500',
    chip: 'bg-blue-500/20 text-blue-500',
    row: 'from-blue-500/10 to-transparent',
  },
  {
    border: 'border-green-500',
    chip: 'bg-green-500/20 text-green-500',
    row: 'from-green-500/10 to-transparent',
  },
  {
    border: 'border-purple-500',
    chip: 'bg-purple-500/20 text-purple-500',
    row: 'from-purple-500/10 to-transparent',
  },
];

function ProBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{
        backgroundColor: 'var(--color-accent-warning-alpha-10)',
        color: 'var(--color-accent-warning)',
      }}
    >
      {label}
    </span>
  );
}

// Build a stable speaker → color-index map from the mock data
function buildSpeakerMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const { speaker } of MOCK_UTTERANCES) {
    if (!map.has(speaker)) {
      map.set(speaker, map.size);
    }
  }
  return map;
}

const speakerMap = buildSpeakerMap();

/**
 * SpeakerTranscriptPreview — static animated demo of the speaker ID output.
 * Used inside the speaker_diarization upgrade modal to show, not tell.
 */
export function SpeakerTranscriptPreview() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <span className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          {t('upgrade.speakerDiarization.title')}
          <ProBadge label={t('configuration.speakerDiarization.proBadge')} />
        </span>
        <p className="text-sm text-text-secondary mt-1">
          {t('upgrade.speakerDiarization.previewSubtitle')}
        </p>
      </div>

      {/* Preview rows with bottom fade mask */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-border">
        <div className="flex flex-col divide-y divide-border/50">
          {MOCK_UTTERANCES.map(({ speaker, time, text }, i) => {
            const colorIndex = speakerMap.get(speaker) ?? 0;
            const colors = SPEAKER_COLORS[colorIndex % SPEAKER_COLORS.length];
            const delay = `${i * 100}ms`;

            return (
              <div
                key={`${speaker}-${time}`}
                className={`
                  flex items-start gap-3 px-3 py-3
                  bg-gradient-to-r ${colors.row}
                  border-l-2 ${colors.border}
                  animate-fade-up
                `}
                style={{ animationDelay: delay, animationFillMode: 'both' }}
              >
                {/* Speaker chip */}
                <span
                  className={`
                    flex-shrink-0 rounded-full text-xs font-medium px-2 py-0.5 mt-0.5
                    ${colors.chip}
                  `}
                >
                  {speaker}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-text-tertiary mr-2">{time}</span>
                  <span className="text-sm text-text-primary">{text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom fade mask — implies more content below */}
        <div
          className="absolute bottom-0 inset-x-0 h-12 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--color-bg-surface) 0%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}
