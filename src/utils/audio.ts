export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const trimAudioBuffer = async (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): Promise<AudioBuffer> => {
  const audioContext = new AudioContext();

  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const length = endSample - startSample;

  const trimmedBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    length,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const trimmedData = trimmedBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      trimmedData[i] = channelData[startSample + i];
    }
  }

  return trimmedBuffer;
};
