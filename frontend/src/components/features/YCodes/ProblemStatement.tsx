'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Tag, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Example {
  id: number
  input: string
  output: string
  explanation?: string
}

interface Constraint {
  id: number
  text: string
}

interface ProblemStatementProps {
  title: string
  description: string
  examples: Example[]
  constraints: Constraint[]
  topics: string[]
  className?: string
}

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      {label && (
        <div className="mb-2 text-xs font-medium text-muted-foreground">{label}</div>
      )}
      <pre className="overflow-x-auto font-mono text-sm">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function ProblemStatement({
  title,
  description,
  examples,
  constraints,
  topics,
  className,
}: ProblemStatementProps) {
  return (
    <motion.div
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <Tag className="h-3 w-3" />
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Examples
        </h3>
        <div className="space-y-4">
          {examples.map((example) => (
            <motion.div
              key={example.id}
              className="rounded-xl border border-border p-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: example.id * 0.1 }}
            >
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Example {example.id}
              </div>
              <div className="space-y-3">
                <CodeBlock label="Input">{example.input}</CodeBlock>
                <CodeBlock label="Output">{example.output}</CodeBlock>
                {example.explanation && (
                  <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-400">
                    <span className="font-medium">Explanation: </span>
                    {example.explanation}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Constraints
        </h3>
        <ul className="space-y-2 rounded-xl border border-border p-4">
          {constraints.map((constraint) => (
            <li
              key={constraint.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <code className="font-mono">{constraint.text}</code>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default ProblemStatement
