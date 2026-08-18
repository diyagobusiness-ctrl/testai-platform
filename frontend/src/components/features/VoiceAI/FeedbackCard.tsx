'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ScoreBreakdown {
  content: number;
  fluency: number;
  grammar: number;
}

interface Suggestion {
  category: string;
  message: string;
}

interface FeedbackCardProps {
  overallScore: number;
  breakdown: ScoreBreakdown;
  suggestions: Suggestion[];
  onRetry?: () => void;
  onReview?: () => void;
  className?: string;
}

const SCORE_COLORS: Record<string, { bar: string; text: string; glow: string }> = {
  content: { bar: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  fluency: { bar: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
  grammar: { bar: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/30' },
};

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative">
      <svg width="112" height="112" className="transform -rotate-90">
        <circle cx="56" cy="56" r="44" stroke="white" strokeWidth="6" fill="none" className="opacity-10" />
        <motion.circle
          cx="56"
          cy="56"
          r="44"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-white"
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">score</span>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  colorConfig,
  delay,
}: {
  label: string;
  value: number;
  colorConfig: (typeof SCORE_COLORS)[string];
  delay: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-300 capitalize">{label}</span>
        <span className={cn('text-xs font-semibold tabular-nums', colorConfig.text)}>
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
          className={cn('h-full rounded-full shadow-lg', colorConfig.bar, colorConfig.glow)}
        />
      </div>
    </div>
  );
}

export default function FeedbackCard({
  overallScore,
  breakdown,
  suggestions,
  onRetry,
  onReview,
  className,
}: FeedbackCardProps) {
  const breakdownEntries = Object.entries(breakdown) as [keyof ScoreBreakdown, number][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 shadow-2xl',
        className
      )}
    >
      <div className="flex items-start gap-6">
        <ScoreRing score={overallScore} />

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Session Complete</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {overallScore >= 80
                ? 'Excellent performance!'
                : overallScore >= 60
                  ? 'Good job, keep improving!'
                  : 'Keep practicing, you will get better!'}
            </p>
          </div>

          <div className="space-y-3">
            {breakdownEntries.map(([key, value], index) => (
              <ProgressBar
                key={key}
                label={key}
                value={value}
                colorConfig={SCORE_COLORS[key]}
                delay={0.4 + index * 0.15}
              />
            ))}
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 space-y-2"
        >
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Suggestions
          </h4>
          <div className="space-y-1.5">
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-blue-400 mt-0.5">→</span>
                <span className="text-zinc-300">
                  <span className="font-medium text-zinc-200">{suggestion.category}:</span>{' '}
                  {suggestion.message}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 flex gap-3"
      >
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        )}
        {onReview && (
          <button
            onClick={onReview}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
          >
            Review Transcript
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
