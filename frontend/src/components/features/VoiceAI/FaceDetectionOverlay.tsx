'use client';

import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface FaceDetection {
  detected: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface FaceDetectionOverlayProps {
  faceData: FaceDetection | null;
  warnings: string[];
  warningCount: number;
  className?: string;
}

function WarningBanner({ message, type }: { message: string; type: 'error' | 'warning' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm shadow-lg',
        type === 'error'
          ? 'bg-red-500/90 text-white border border-red-400/50'
          : 'bg-yellow-500/90 text-white border border-yellow-400/50'
      )}
    >
      {type === 'error' ? '⚠' : '⚡'} {message}
    </motion.div>
  );
}

export default function FaceDetectionOverlay({
  faceData,
  warnings,
  warningCount,
  className,
}: FaceDetectionOverlayProps) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {faceData?.detected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute border-2 border-green-400 rounded-lg shadow-[0_0_15px_rgba(74,222,128,0.4)]"
            style={{
              left: `${faceData.x}%`,
              top: `${faceData.y}%`,
              width: `${faceData.width}%`,
              height: `${faceData.height}%`,
            }}
          >
            <div className="absolute -top-6 left-0 text-xs text-green-400 bg-black/60 px-2 py-0.5 rounded">
              {(faceData.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </motion.div>
      )}

      {!faceData?.detected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-red-500/20 border-2 border-dashed border-red-400 rounded-2xl w-[70%] h-[70%] flex items-center justify-center">
            <span className="text-red-400 text-sm font-medium">No Face Detected</span>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 z-10">
        <AnimatePresence>
          {warnings.slice(-3).map((warning, i) => (
            <WarningBanner
              key={`${warning}-${i}`}
              message={warning}
              type={warning.includes('not detected') ? 'error' : 'warning'}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-3 right-3 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm',
            warningCount === 0
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : warningCount < 3
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              warningCount === 0 ? 'bg-green-400' : warningCount < 3 ? 'bg-yellow-400' : 'bg-red-400'
            )}
          />
          {warningCount} warning{warningCount !== 1 ? 's' : ''}
        </motion.div>
      </div>
    </div>
  );
}
