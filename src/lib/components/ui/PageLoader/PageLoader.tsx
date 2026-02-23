import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

export interface PageLoaderProps {
  message?: string;
  fullHeight?: boolean;
}

export function PageLoader({ message, fullHeight = true }: PageLoaderProps) {
  const minHeightClass = fullHeight ? 'min-h-[60vh] h-full' : 'py-12';

  return (
    <div className={`flex flex-col items-center justify-center w-full ${minHeightClass}`}>
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}
