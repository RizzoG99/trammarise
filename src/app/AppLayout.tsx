import { Outlet } from 'react-router-dom';
import { Text } from '../components/ui/Text';

export function AppLayout() {
  return (
    <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col relative">
      {/* Main content area - rendered by routes */}
      <main className="flex-1 flex flex-col py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-text-tertiary text-sm border-t border-bg-tertiary mt-auto">
        <Text variant="small" color="tertiary" as="p" className="m-0">
          Trammarise © 2025 - Audio Transcription & Summarization
        </Text>
      </footer>
    </div>
  );
}
