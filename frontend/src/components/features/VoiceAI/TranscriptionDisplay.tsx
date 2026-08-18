'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface TranscriptionDisplayProps {
  segments: TranscriptSegment[];
  isRecording: boolean;
  className?: string;
  placeholder?: string;
}

export default function TranscriptionDisplay({
  segments,
  isRecording,
  className,
  placeholder = 'Press the microphone to start transcribing...',
}: TranscriptionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
        className
      )}
    >
      <div className="p-4 space-y-2 min-h-full">
        <AnimatePresence initial={false}>
          {segments.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-400 italic text-center mt-8"
            >
              {placeholder}
            </motion.p>
          )}

          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className={cn(
                'flex gap-3 items-start',
                !segment.isFinal && 'opacity-60'
              )}
            >
              <span className="text-[10px] text-zinc-500 tabular-nums mt-1 shrink-0">
                {formatTimestamp(segment.timestamp)}
              </span>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  segment.isFinal ? 'text-zinc-100' : 'text-zinc-300 italic'
                )}
              >
                {segment.text}
                {!segment.isFinal && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 align-middle"
                  />
                )}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isRecording && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      )}

      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {isRecording && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">
              live
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
