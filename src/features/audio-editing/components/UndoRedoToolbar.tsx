import { Undo2, Redo2, RotateCcw } from 'lucide-react';
import { Button, GlassCard, Text } from '@/lib';

export interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset?: () => void;
  currentAction?: string;
}

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  currentAction,
}: UndoRedoToolbarProps) {
  return (
    <GlassCard variant="light" className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </Button>

          {onReset && (
            <Button
              onClick={onReset}
              disabled={!canUndo}
              variant="outline"
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>

        {currentAction && (
          <Text variant="caption" color="tertiary" className="hidden md:block">
            {currentAction}
          </Text>
        )}
      </div>
    </GlassCard>
  );
}
