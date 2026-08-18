'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  MemoryStick,
  Terminal,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react'

export type TestCaseStatus = 'passed' | 'failed' | 'pending' | 'running'

interface TestCase {
  id: number
  status: TestCaseStatus
  input: string
  expected: string
  actual?: string
  executionTime?: number
}

interface OutputPanelProps {
  testCases: TestCase[]
  output?: string
  error?: string
  executionTime?: number
  memoryUsage?: number
  isRunning?: boolean
  className?: string
}

const statusConfig: Record<TestCaseStatus, { color: string; bgColor: string; icon: React.ElementType }> = {
  passed: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: CheckCircle,
  },
  failed: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: XCircle,
  },
  pending: {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: Info,
  },
  running: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Loader2,
  },
}

function TestCaseItem({ testCase }: { testCase: TestCase }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const status = statusConfig[testCase.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      className="rounded-lg border border-border overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: testCase.id * 0.1 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center justify-between p-3 transition-colors',
          'hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full p-1', status.bgColor)}>
            <StatusIcon
              className={cn(
                'h-4 w-4',
                status.color,
                testCase.status === 'running' && 'animate-spin'
              )}
            />
          </div>
          <span className="text-sm font-medium">Test Case {testCase.id}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              status.bgColor,
              status.color
            )}
          >
            {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {testCase.executionTime && (
            <span className="text-xs text-muted-foreground">
              {testCase.executionTime}ms
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-border bg-muted/20 p-3">
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Input:</div>
                <pre className="rounded bg-background p-2 font-mono text-xs">{testCase.input}</pre>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Expected:</div>
                <pre className="rounded bg-background p-2 font-mono text-xs">{testCase.expected}</pre>
              </div>
              {testCase.actual !== undefined && (
                <div>
                  <div className="mb-1 text-xs font-medium text-muted-foreground">Actual:</div>
                  <pre
                    className={cn(
                      'rounded p-2 font-mono text-xs',
                      testCase.status === 'passed'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {testCase.actual}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function OutputPanel({
  testCases,
  output,
  error,
  executionTime,
  memoryUsage,
  isRunning = false,
  className,
}: OutputPanelProps) {
  const passedCount = testCases.filter((tc) => tc.status === 'passed').length
  const totalCount = testCases.length

  return (
    <motion.div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-medium">Output</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {executionTime !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{executionTime}ms</span>
            </div>
          )}
          {memoryUsage !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MemoryStick className="h-3 w-3" />
              <span>{memoryUsage} MB</span>
            </div>
          )}
          {totalCount > 0 && (
            <div className="flex items-center gap-1">
              <span className={cn(passedCount === totalCount ? 'text-green-500' : 'text-yellow-500')}>
                {passedCount}/{totalCount}
              </span>
              <span className="text-muted-foreground">passed</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isRunning && (
          <motion.div
            className="flex items-center justify-center gap-2 py-8 text-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Running code...</span>
          </motion.div>
        )}

        {!isRunning && error && (
          <motion.div
            className="rounded-lg bg-red-500/10 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <pre className="mt-2 overflow-x-auto font-mono text-sm text-red-400">{error}</pre>
          </motion.div>
        )}

        {!isRunning && !error && output && (
          <motion.div
            className="rounded-lg bg-muted/50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-2 text-xs font-medium text-muted-foreground">Output:</div>
            <pre className="overflow-x-auto font-mono text-sm">{output}</pre>
          </motion.div>
        )}

        {!isRunning && testCases.length > 0 && (
          <div className="space-y-2">
            {testCases.map((testCase) => (
              <TestCaseItem key={testCase.id} testCase={testCase} />
            ))}
          </div>
        )}

        {!isRunning && !error && !output && testCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Terminal className="mb-3 h-12 w-12 opacity-50" />
            <p>Run your code to see the output</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default OutputPanel
