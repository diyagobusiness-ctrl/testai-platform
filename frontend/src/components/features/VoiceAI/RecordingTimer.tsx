'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RecordingTimerProps {
  totalTime: number;
  remainingTime: number;
  isRecording: boolean;
  isPaused?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function RecordingTimer({
  totalTime,
  remainingTime,
  isRecording,
  isPaused = false,
  className,
}: RecordingTimerProps) {
  const progress = totalTime > 0 ? remainingTime / totalTime : 0;
  const isLow = remainingTime <= 10;
  const isCritical = remainingTime <= 5;
  const isUrgent = isRecording && isLow;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  const color = isCritical
    ? '#ef4444'
    : isLow
      ? '#f59e0b'
      : '#3b82f6';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <motion.div
        animate={
          isUrgent && !isPaused
            ? {
                scale: [1, 1.06, 1],
                opacity: [1, 0.85, 1],
              }
            : { scale: 1, opacity: 1 }
        }
        transition={
          isUrgent
            ? {
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        className="relative"
      >
        <svg width="128" height="128" className="transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-white/10"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 8px ${color}60)`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.span
            key={remainingTime}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              'text-2xl font-bold tabular-nums',
              isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'
            )}
          >
            {formatTime(remainingTime)}
          </motion.span>
          {isPaused && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-zinc-400 uppercase tracking-widest"
            >
              paused
            </motion.span>
          )}
        </div>
      </motion.div>

      {isUrgent && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 0 0px ${color}00`,
              `0 0 0 8px ${color}20`,
              `0 0 0 0px ${color}00`,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
