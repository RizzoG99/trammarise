export interface WaveformVisualizationProps {
  isRecording: boolean;
}

export function WaveformVisualization({ isRecording }: WaveformVisualizationProps) {
  // Generate 20 bars with varying heights (static pattern)
  const bars = [
    30, 60, 45, 75, 50, 80, 55, 70, 40, 85,
    50, 65, 45, 70, 55, 75, 40, 60, 50, 70
  ];

  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1.5 rounded-full transition-all ${
            isRecording ? 'waveform-bar' : ''
          }`}
          style={{
            height: `${height}%`,
            background: 'linear-gradient(to top, var(--color-primary), var(--color-primary-light))',
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
