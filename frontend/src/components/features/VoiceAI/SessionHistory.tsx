'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SessionRecord {
  id: string;
  date: string;
  mode: string;
  overallScore: number;
  duration: string;
  wordCount: number;
}

interface SessionHistoryProps {
  sessions: SessionRecord[];
  className?: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : score >= 60
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
        color
      )}
    >
      {score}
    </span>
  );
}

function SessionRow({ session, index }: { session: SessionRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/5"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">{session.mode}</span>
          <ScoreBadge score={session.overallScore} />
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>{session.date}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>{session.duration}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>{session.wordCount} words</span>
        </div>
      </div>

      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 text-zinc-500"
      >
        <path
          d="M6 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

export default function SessionHistory({ sessions, className }: SessionHistoryProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Sessions</h3>
          <span className="text-xs text-zinc-400">{sessions.length} total</span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-400">No sessions yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Complete a practice session to see your history
            </p>
          </div>
        ) : (
          sessions.map((session, index) => (
            <SessionRow key={session.id} session={session} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
