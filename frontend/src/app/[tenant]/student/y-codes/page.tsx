'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  ProblemStatement,
  CodeEditor,
  OutputPanel,
  ChallengeList,
  Language,
} from '@/components/features/YCodes'
import type { TestCaseStatus } from '@/components/features/YCodes'
import { ButtonGlow } from '@/components/animations'
import {
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  Code2,
  List,
} from 'lucide-react'

interface TestCase {
  id: number
  status: TestCaseStatus
  input: string
  expected: string
  actual?: string
  executionTime?: number
}

interface Challenge {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  status: 'Not Started' | 'In Progress' | 'Completed'
  attemptCount: number
  maxScore?: number
  timeLimit?: string
  description: string
  examples: { id: number; input: string; output: string; explanation?: string }[]
  constraints: { id: number; text: string }[]
  topics: string[]
}

const sampleChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    status: 'In Progress',
    attemptCount: 2,
    timeLimit: '30 min',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    examples: [
      {
        id: 1,
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        id: 2,
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
      },
    ],
    constraints: [
      { id: 1, text: '2 <= nums.length <= 10^4' },
      { id: 2, text: '-10^9 <= nums[i] <= 10^9' },
      { id: 3, text: '-10^9 <= target <= 10^9' },
      { id: 4, text: 'Only one valid answer exists.' },
    ],
    topics: ['Array', 'Hash Table'],
  },
  {
    id: '2',
    title: 'Reverse String',
    difficulty: 'Easy',
    status: 'Completed',
    attemptCount: 1,
    maxScore: 100,
    timeLimit: '15 min',
    description:
      'Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.',
    examples: [
      {
        id: 1,
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
    ],
    constraints: [{ id: 1, text: '1 <= s.length <= 10^5' }],
    topics: ['Two Pointers', 'String'],
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    status: 'Not Started',
    attemptCount: 0,
    timeLimit: '45 min',
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      {
        id: 1,
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
    ],
    constraints: [
      { id: 1, text: '0 <= s.length <= 5 * 10^4' },
      { id: 2, text: 's consists of English letters, digits, symbols and spaces.' },
    ],
    topics: ['Hash Table', 'Sliding Window', 'String'],
  },
  {
    id: '4',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    status: 'Not Started',
    attemptCount: 0,
    timeLimit: '60 min',
    description:
      'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      {
        id: 1,
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
      },
    ],
    constraints: [
      { id: 1, text: 'k == lists.length' },
      { id: 2, text: '0 <= k <= 10^4' },
    ],
    topics: ['Linked List', 'Divide and Conquer', 'Heap'],
  },
  {
    id: '5',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    status: 'In Progress',
    attemptCount: 3,
    timeLimit: '60 min',
    description:
      'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    examples: [
      {
        id: 1,
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.',
      },
    ],
    constraints: [
      { id: 1, text: 'nums1.length == m' },
      { id: 2, text: 'nums2.length == n' },
      { id: 3, text: '0 <= m <= 1000' },
    ],
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
  },
]

export default function YCodesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(sampleChallenges[0])
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [executionTime, setExecutionTime] = useState<number | undefined>()
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>()
  const [isRunning, setIsRunning] = useState(false)
  const [showChallengeList, setShowChallengeList] = useState(false)

  const handleRun = useCallback(() => {
    setIsRunning(true)
    setError('')
    setOutput('')
    setExecutionTime(undefined)
    setMemoryUsage(undefined)

    setTimeout(() => {
      const mockTestCases: TestCase[] = selectedChallenge.examples.map((ex, idx) => ({
        id: idx + 1,
        status: Math.random() > 0.3 ? ('passed' as const) : ('failed' as const),
        input: ex.input,
        expected: ex.output,
        actual: ex.output,
        executionTime: Math.floor(Math.random() * 50) + 10,
      }))

      setTestCases(mockTestCases)
      setExecutionTime(Math.floor(Math.random() * 200) + 50)
      setMemoryUsage(parseFloat((Math.random() * 10 + 5).toFixed(2)))
      setIsRunning(false)
    }, 1500)
  }, [selectedChallenge])

  const handleSubmit = useCallback(() => {
    setIsRunning(true)
    setError('')
    setOutput('')
    setExecutionTime(undefined)
    setMemoryUsage(undefined)

    setTimeout(() => {
      const mockTestCases: TestCase[] = selectedChallenge.examples.map((ex, idx) => ({
        id: idx + 1,
        status: 'passed' as const,
        input: ex.input,
        expected: ex.output,
        actual: ex.output,
        executionTime: Math.floor(Math.random() * 50) + 10,
      }))

      setTestCases(mockTestCases)
      setExecutionTime(Math.floor(Math.random() * 200) + 50)
      setMemoryUsage(parseFloat((Math.random() * 10 + 5).toFixed(2)))
      setOutput('All test cases passed! Solution accepted.')
      setIsRunning(false)
    }, 2000)
  }, [selectedChallenge])

  const handleChallengeClick = (id: string) => {
    const challenge = sampleChallenges.find((c) => c.id === id)
    if (challenge) {
      setSelectedChallenge(challenge)
      setShowChallengeList(false)
      setTestCases([])
      setOutput('')
      setError('')
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Y-Codes</h1>
            <p className="text-sm text-muted-foreground">
              Solve coding challenges and improve your skills
            </p>
          </div>
        </div>

        <ButtonGlow
          variant="outline"
          size="sm"
          onClick={() => setShowChallengeList(!showChallengeList)}
        >
          {showChallengeList ? (
            <>
              <ChevronRight className="mr-2 h-4 w-4" />
              Hide List
            </>
          ) : (
            <>
              <List className="mr-2 h-4 w-4" />
              All Challenges
            </>
          )}
        </ButtonGlow>
      </motion.div>

      {showChallengeList && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChallengeList
            challenges={sampleChallenges}
            onChallengeClick={handleChallengeClick}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          className="space-y-4 overflow-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <ButtonGlow
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentIndex = sampleChallenges.findIndex(
                  (c) => c.id === selectedChallenge.id
                )
                if (currentIndex > 0) {
                  handleChallengeClick(sampleChallenges[currentIndex - 1].id)
                }
              }}
              disabled={sampleChallenges[0].id === selectedChallenge.id}
            >
              <ChevronLeft className="h-4 w-4" />
            </ButtonGlow>
            <span className="text-sm text-muted-foreground">
              Challenge{' '}
              {sampleChallenges.findIndex((c) => c.id === selectedChallenge.id) + 1} of{' '}
              {sampleChallenges.length}
            </span>
            <ButtonGlow
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentIndex = sampleChallenges.findIndex(
                  (c) => c.id === selectedChallenge.id
                )
                if (currentIndex < sampleChallenges.length - 1) {
                  handleChallengeClick(sampleChallenges[currentIndex + 1].id)
                }
              }}
              disabled={
                sampleChallenges[sampleChallenges.length - 1].id === selectedChallenge.id
              }
            >
              <ChevronRight className="h-4 w-4" />
            </ButtonGlow>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <ProblemStatement
              title={selectedChallenge.title}
              description={selectedChallenge.description}
              examples={selectedChallenge.examples}
              constraints={selectedChallenge.constraints}
              topics={selectedChallenge.topics}
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeEditor
            language={language}
            onLanguageChange={setLanguage}
            onCodeChange={setCode}
          />

          <div className="flex items-center gap-3">
            <ButtonGlow
              variant="primary"
              onClick={handleRun}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Running...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Run Code
                </span>
              )}
            </ButtonGlow>

            <ButtonGlow
              variant="accent"
              onClick={handleSubmit}
              disabled={isRunning}
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Solution
              </span>
            </ButtonGlow>
          </div>

          <OutputPanel
            testCases={testCases}
            output={output}
            error={error}
            executionTime={executionTime}
            memoryUsage={memoryUsage}
            isRunning={isRunning}
          />
        </motion.div>
      </div>
    </div>
  )
}
