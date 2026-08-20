'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import {
  VideoCallLayout,
  InterviewSidebar,
  RecordingTimer,
  type ChatMessage,
} from '@/components/features/VoiceAI'
import useVoiceRecognition from '@/hooks/useVoiceRecognition'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'
import {
  Upload, FileText, Mic, RotateCcw, CheckCircle, XCircle,
  Bot, Pause, Play, Target, SkipForward,
} from 'lucide-react'

type PracticeMode = 'free' | 'mock-hr' | 'mock-technical' | 'mock-behavioral'

interface ModeOption {
  id: PracticeMode
  label: string
  description: string
  icon: string
}

const MODES: ModeOption[] = [
  { id: 'free', label: 'Free Practice', description: 'Speak freely on any topic', icon: '🎤' },
  { id: 'mock-hr', label: 'HR Interview', description: 'HR-style behavioral questions', icon: '👔' },
  { id: 'mock-technical', label: 'Technical', description: 'Problem-solving & system design', icon: '💻' },
  { id: 'mock-behavioral', label: 'Behavioral', description: 'STAR method scenario questions', icon: '🧠' },
]

interface InterviewQuestion {
  id: string
  text: string
  category: string
  keywords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

const TOTAL_TIME = 600

const SMART_QUESTIONS: Record<PracticeMode, InterviewQuestion[]> = {
  free: [
    { id: 'f1', text: 'Tell me about yourself and your professional background.', category: 'intro', keywords: ['experience', 'background', 'years', 'role', 'specialize'], difficulty: 'easy' },
    { id: 'f2', text: 'What are your greatest professional strengths?', category: 'strengths', keywords: ['strength', 'good at', 'skill', 'talent', 'excel'], difficulty: 'easy' },
    { id: 'f3', text: 'Where do you see yourself in 5 years?', category: 'goals', keywords: ['goal', 'plan', 'future', 'want', 'become'], difficulty: 'medium' },
    { id: 'f4', text: 'Describe a challenging project you have worked on and how you handled it.', category: 'experience', keywords: ['project', 'challenge', 'difficult', 'solved', 'achieved'], difficulty: 'medium' },
    { id: 'f5', text: 'Why are you interested in this field or industry?', category: 'motivation', keywords: ['passion', 'interest', 'love', 'drive', 'reason'], difficulty: 'easy' },
    { id: 'f6', text: 'How do you handle stress and pressure at work?', category: 'resilience', keywords: ['stress', 'pressure', 'manage', 'cope', 'balance'], difficulty: 'medium' },
    { id: 'f7', text: 'What makes you unique compared to other candidates?', category: 'differentiation', keywords: ['unique', 'different', 'special', 'value', 'bring'], difficulty: 'medium' },
    { id: 'f8', text: 'Describe your ideal work environment.', category: 'culture', keywords: ['environment', 'culture', 'team', 'prefer', 'style'], difficulty: 'easy' },
  ],
  'mock-hr': [
    { id: 'h1', text: 'Tell me about yourself.', category: 'intro', keywords: ['background', 'experience', 'education', 'career', 'journey'], difficulty: 'easy' },
    { id: 'h2', text: 'Why do you want to work for our company?', category: 'motivation', keywords: ['company', 'mission', 'values', 'culture', 'attracted'], difficulty: 'medium' },
    { id: 'h3', text: 'What are your salary expectations?', category: 'compensation', keywords: ['salary', 'compensation', 'range', 'expect', 'market'], difficulty: 'medium' },
    { id: 'h4', text: 'How do you handle conflict with a coworker?', category: 'interpersonal', keywords: ['conflict', 'resolution', 'communicate', 'listen', 'compromise'], difficulty: 'medium' },
    { id: 'h5', text: 'Why did you leave your last position?', category: 'history', keywords: ['reason', 'left', 'opportunity', 'growth', 'looking'], difficulty: 'medium' },
    { id: 'h6', text: 'How do you handle feedback and criticism?', category: 'growth', keywords: ['feedback', 'learn', 'improve', 'constructive', 'accept'], difficulty: 'medium' },
    { id: 'h7', text: 'Do you have any questions for us?', category: 'engagement', keywords: ['question', 'ask', 'curious', 'want to know', 'wondering'], difficulty: 'easy' },
    { id: 'h8', text: 'Describe your ideal work-life balance.', category: 'balance', keywords: ['balance', 'flexible', 'hours', 'remote', 'priorities'], difficulty: 'easy' },
  ],
  'mock-technical': [
    { id: 't1', text: 'Walk me through your technical background and key skills.', category: 'overview', keywords: ['skill', 'technology', 'language', 'framework', 'experience'], difficulty: 'easy' },
    { id: 't2', text: 'Explain the difference between REST and GraphQL APIs.', category: 'api', keywords: ['rest', 'graphql', 'endpoint', 'query', 'http'], difficulty: 'medium' },
    { id: 't3', text: 'How would you design a URL shortener like bit.ly?', category: 'system-design', keywords: ['design', 'database', 'hash', 'redirect', 'scale'], difficulty: 'hard' },
    { id: 't4', text: 'What is the time complexity of quicksort and when would you use it?', category: 'algorithms', keywords: ['time', 'complexity', 'log', 'n', 'sort'], difficulty: 'medium' },
    { id: 't5', text: 'Explain the concept of dependency injection.', category: 'patterns', keywords: ['dependency', 'injection', 'invert', 'coupling', 'loose'], difficulty: 'medium' },
    { id: 't6', text: 'How does garbage collection work in modern languages?', category: 'memory', keywords: ['garbage', 'collection', 'memory', 'heap', 'reference'], difficulty: 'medium' },
    { id: 't7', text: 'Tell me about a time you optimized code for better performance.', category: 'optimization', keywords: ['optimize', 'performance', 'faster', 'cache', 'profiling'], difficulty: 'medium' },
    { id: 't8', text: 'How do you approach debugging a complex production issue?', category: 'debugging', keywords: ['debug', 'log', 'trace', 'monitor', 'diagnose'], difficulty: 'medium' },
  ],
  'mock-behavioral': [
    { id: 'b1', text: 'Tell me about a time you demonstrated leadership.', category: 'leadership', keywords: ['lead', 'team', 'guide', 'direct', 'influence'], difficulty: 'medium' },
    { id: 'b2', text: 'Describe a situation where you had to meet a tight deadline.', category: 'time-management', keywords: ['deadline', 'priority', 'manage', 'organize', 'deliver'], difficulty: 'medium' },
    { id: 'b3', text: 'Give an example of when you showed initiative.', category: 'initiative', keywords: ['initiative', 'proactive', 'started', 'created', 'suggested'], difficulty: 'medium' },
    { id: 'b4', text: 'Tell me about a time you failed and what you learned from it.', category: 'failure', keywords: ['fail', 'learn', 'mistake', 'grow', 'improve'], difficulty: 'hard' },
    { id: 'b5', text: 'Describe a situation where you had to persuade someone.', category: 'persuasion', keywords: ['persuade', 'convince', 'negotiate', 'influence', 'outcome'], difficulty: 'medium' },
    { id: 'b6', text: 'Tell me about a time you worked on a challenging team project.', category: 'teamwork', keywords: ['team', 'collaborate', 'together', 'contribute', 'group'], difficulty: 'medium' },
    { id: 'b7', text: 'Describe a time you had to adapt to a significant change.', category: 'adaptability', keywords: ['change', 'adapt', 'flexible', 'adjust', 'new'], difficulty: 'medium' },
    { id: 'b8', text: 'Give an example of when you went above and beyond.', category: 'excellence', keywords: ['extra', 'above', 'beyond', 'exceptional', 'exceeded'], difficulty: 'medium' },
  ],
}

function analyzeAnswer(answer: string, question: InterviewQuestion) {
  const lower = answer.toLowerCase()
  const wordCount = answer.split(/\s+/).length

  let score = 50
  if (wordCount > 50) score += 15
  else if (wordCount > 30) score += 10
  else if (wordCount > 15) score += 5
  else score -= 10

  const matched = question.keywords.filter((kw) => lower.includes(kw))
  score += matched.length * 5

  if (/for example|such as|specifically|instance|one time/.test(lower)) score += 8
  if (/\d+/.test(answer)) score += 5
  if (/managed|led|created|implemented|improved|reduced|increased|achieved|delivered/.test(lower)) score += 8
  if (/situation|task|action|result/.test(lower)) score += 7
  if (/professional|experience|skills|team|collaborate|communicate/.test(lower)) score += 5
  if (/um|uh|like|basically|you know|kind of/.test(lower)) score -= 3

  score = Math.max(40, Math.min(100, score))

  let sentiment: 'positive' | 'neutral' | 'needs-improvement' = 'neutral'
  if (score >= 75) sentiment = 'positive'
  else if (score < 60) sentiment = 'needs-improvement'

  const feedbackPool = {
    positive: [
      'Excellent response! You provided specific details and demonstrated strong understanding.',
      'Great answer! Your examples were clear and relevant.',
      'Well structured response. I can see you have thought about this carefully.',
      'Impressive! You communicated your points very effectively.',
    ],
    neutral: [
      'Good start. Could you provide more specific examples?',
      'Decent answer. Try to include more measurable outcomes.',
      "That's a solid foundation. Let's dig deeper with some specifics.",
      'You are on the right track. Adding concrete examples would strengthen this.',
    ],
    'needs-improvement': [
      'Let me help you improve this. Try using the STAR method: Situation, Task, Action, Result.',
      'Consider being more specific. What exactly did you do? What was the outcome?',
      'Good attempt. Try to include concrete examples and measurable results.',
      "Let's try again with more detail. Think about a specific situation where you applied this.",
    ],
  }

  const feedback = feedbackPool[sentiment][Math.floor(Math.random() * feedbackPool[sentiment].length)]

  let followUp: string | undefined
  if (wordCount < 20) {
    followUp = "Could you elaborate more on that? I'd like to hear more details."
  } else if (!/for example|such as|specifically/.test(lower)) {
    followUp = 'Can you give me a specific example to illustrate this?'
  } else if (!/\d+/.test(answer)) {
    followUp = 'Do you have any metrics or numbers that show the impact of this?'
  }

  return { feedback, score, followUp, sentiment }
}

export default function VoiceAIPage() {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('free')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [showUpload, setShowUpload] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState('')

  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME)
  const [isPaused, setIsPaused] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  const [phase, setPhase] = useState<'greeting' | 'asking' | 'listening' | 'ai-responding' | 'idle'>('idle')

  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const questionsRef = useRef(questions)
  questionsRef.current = questions
  const currentIdxRef = useRef(currentIdx)
  currentIdxRef.current = currentIdx
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const addMessage = useCallback((role: 'interviewer' | 'candidate', text: string, score?: number) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      text,
      timestamp: Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000),
      score,
    }
    setMessages((prev) => [...prev, msg])
    return msg
  }, [])

  const onSpeechEnd = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'greeting') return 'asking'
      if (prev === 'ai-responding') return 'idle'
      return prev
    })
  }, [])

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({
    rate: 0.95,
    pitch: 1.0,
    onEnd: onSpeechEnd,
  })

  const onRecognitionEnd = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'listening') return 'idle'
      return prev
    })
  }, [])

  const {
    isListening,
    transcript,
    interimTranscript,
    segments,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
  } = useVoiceRecognition({
    continuous: true,
    interimResults: true,
    onEnd: onRecognitionEnd,
  })

  const currentQuestion = questions[currentIdx]
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0

  const clearSafety = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
      safetyTimeoutRef.current = null
    }
  }, [])

  const setPhaseSafe = useCallback((newPhase: typeof phase, delayMs?: number) => {
    clearSafety()
    const doSet = () => {
      setPhase(newPhase)
      // Safety: if phase doesn't transition within 15s, force it
      safetyTimeoutRef.current = setTimeout(() => {
        const cur = phaseRef.current
        if (cur === 'asking' || cur === 'greeting') {
          setPhase('listening')
          resetTranscript()
          startListening()
        } else if (cur === 'ai-responding') {
          setPhase('idle')
        }
      }, 15000)
    }
    if (delayMs) {
      setTimeout(doSet, delayMs)
    } else {
      doSet()
    }
  }, [clearSafety, resetTranscript, startListening])

  const askQuestionFn = useCallback((question: InterviewQuestion) => {
    setPhaseSafe('asking')
    addMessage('interviewer', question.text)
    speak(question.text)
  }, [speak, addMessage, setPhaseSafe])

  const moveToNextFn = useCallback(() => {
    const next = currentIdxRef.current + 1
    const qs = questionsRef.current
    if (next >= qs.length) {
      endInterviewFn()
    } else {
      setCurrentIdx(next)
      resetTranscript()
      setTimeout(() => {
        askQuestionFn(qs[next])
      }, 1500)
    }
  }, [askQuestionFn, resetTranscript])

  const processAnswerFn = useCallback((answer: string) => {
    const q = questionsRef.current[currentIdxRef.current]
    if (!q) return

    addMessage('candidate', answer)
    clearSafety()

    const analysis = analyzeAnswer(answer, q)
    setPhaseSafe('ai-responding')

    const responseText = analysis.followUp
      ? `${analysis.feedback}\n\n${analysis.followUp}`
      : analysis.feedback

    addMessage('interviewer', responseText, analysis.score)
    speak(responseText)

    setTimeout(() => {
      resetTranscript()
      if (analysis.followUp) {
        setTimeout(() => {
          setPhaseSafe('listening')
          startListening()
        }, 1000)
      } else {
        moveToNextFn()
      }
    }, 500)
  }, [speak, addMessage, clearSafety, resetTranscript, startListening, moveToNextFn, setPhaseSafe])

  const endInterviewFn = useCallback(() => {
    stopListening()
    stopSpeaking()
    clearSafety()
    window.speechSynthesis?.cancel()
    setInterviewStarted(false)
    setPhase('idle')

    if (timerRef.current) clearInterval(timerRef.current)

    const msgs = messagesRef.current
    const scores = msgs.filter((m) => m.score).map((m) => m.score!)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 70
    setOverallScore(Math.round(avg))
    setShowFeedback(true)

    api.submitVoiceSession({
      sessionType: selectedMode,
      durationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      accuracyScore: Math.round(avg),
      transcribedText: msgs.map((m) => `${m.role}: ${m.text}`).join('\n'),
      aiFeedback: `Score: ${Math.round(avg)}/100. ${msgs.length} messages exchanged.`,
    }).catch(() => {})
  }, [stopListening, stopSpeaking, clearSafety, selectedMode])

  const startInterviewFlow = useCallback(() => {
    let qs = [...SMART_QUESTIONS[selectedMode]]

    if (fileContent) {
      const words = fileContent.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
      const uniqueWords = [...new Set(words)].slice(0, 10)
      qs = qs.map((q) => ({ ...q, keywords: [...q.keywords, ...uniqueWords] }))
      qs.unshift({
        id: 'resume-specific',
        text: 'Based on your resume, tell me about your most relevant experience for this role.',
        category: 'resume',
        keywords: uniqueWords.slice(0, 5),
        difficulty: 'medium',
      })
    }

    setQuestions(qs)
    setCurrentIdx(0)
    setMessages([])
    setInterviewStarted(true)
    setShowUpload(false)
    startTimeRef.current = Date.now()

    const greeting = `Hi there! I'm Aria, your AI interview coach. ${fileContent ? "I've taken a look at your resume and I'm excited to dive in!" : `I'll be your interviewer for this ${MODES.find((m) => m.id === selectedMode)?.label} session.`} Don't worry, this is a safe space to practice. Take your time with each answer, and I'll give you feedback along the way. Ready? Let's get started!`

    setPhaseSafe('greeting')
    addMessage('interviewer', greeting)
    speak(greeting)
  }, [selectedMode, fileContent, speak, addMessage, setPhaseSafe])

  // When greeting finishes, auto-ask first question
  useEffect(() => {
    if (phase === 'greeting' && !isSpeaking) {
      setTimeout(() => {
        if (questionsRef.current[0]) {
          askQuestionFn(questionsRef.current[0])
        }
      }, 1000)
    }
  }, [phase, isSpeaking, askQuestionFn])

  // When asking finishes (AI stopped talking), start listening
  useEffect(() => {
    if (phase === 'asking' && !isSpeaking) {
      setTimeout(() => {
        setPhaseSafe('listening')
        resetTranscript()
        startListening()
      }, 600)
    }
  }, [phase, isSpeaking, startListening, resetTranscript, setPhaseSafe])

  // When idle after an answer, process it
  useEffect(() => {
    if (phase === 'idle' && interviewStarted && !isSpeaking && !isListening) {
      const t = setTimeout(() => {
        if (phaseRef.current === 'idle' && transcript.trim()) {
          processAnswerFn(transcript.trim())
        }
      }, 300)
      return () => clearTimeout(t)
    }
  }, [phase, interviewStarted, isSpeaking, isListening, transcript, processAnswerFn])

  const handleSubmitAnswer = useCallback(() => {
    stopListening()
    clearSafety()
    const answer = segments.filter((s) => s.isFinal).map((s) => s.text).join(' ')
    const fallback = transcript.trim()

    if (answer.trim()) {
      processAnswerFn(answer.trim())
    } else if (fallback) {
      processAnswerFn(fallback)
    } else {
      addMessage('candidate', '[No answer provided]')
      setPhaseSafe('ai-responding')
      const skipMsg = "No worries at all! Let's move on to the next one."
      addMessage('interviewer', skipMsg)
      speak(skipMsg)
      setTimeout(() => moveToNextFn(), 1500)
    }
  }, [stopListening, clearSafety, segments, transcript, processAnswerFn, speak, addMessage, moveToNextFn, setPhaseSafe])

  const handleSkipQuestion = useCallback(() => {
    stopListening()
    stopSpeaking()
    clearSafety()
    setPhaseSafe('ai-responding')
    const msg = "No problem! Let's continue with the next question."
    addMessage('interviewer', msg)
    speak(msg)
    setTimeout(() => moveToNextFn(), 1500)
  }, [stopListening, stopSpeaking, clearSafety, speak, addMessage, moveToNextFn, setPhaseSafe])

  const resetInterview = useCallback(() => {
    stopListening()
    stopSpeaking()
    clearSafety()
    window.speechSynthesis?.cancel()
    setInterviewStarted(false)
    setShowUpload(true)
    setShowFeedback(false)
    setMessages([])
    setQuestions([])
    setCurrentIdx(0)
    setUploadedFile(null)
    setFileContent('')
    setRemainingTime(TOTAL_TIME)
    setIsPaused(false)
    setPhase('idle')
    resetTranscript()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [stopListening, stopSpeaking, clearSafety, resetTranscript])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingTime((p) => {
        if (p <= 1) { endInterviewFn(); return 0 }
        return p - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearSafety()
      window.speechSynthesis?.cancel()
    }
  }, [endInterviewFn, clearSafety])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setFileContent(ev.target?.result as string) }
    reader.readAsText(file)
    setUploadedFile(file)
  }

  const getAiSubtitle = () => {
    if (phase === 'greeting') return 'Welcoming you...'
    if (phase === 'asking') return 'Asking a question...'
    if (phase === 'listening') return 'Waiting for your answer...'
    if (phase === 'ai-responding') return 'Analyzing your response...'
    if (currentQuestion) return `Q${currentIdx + 1}: ${currentQuestion.category}`
    return 'Ready to begin'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">AI Interview Practice</h1>
          <p className="text-sm text-zinc-400">
            {interviewStarted
              ? `Question ${currentIdx + 1} of ${questions.length} • ${currentQuestion?.category || ''}`
              : 'Upload your resume and practice with an AI interviewer'}
          </p>
          {interviewStarted && (
            <div className="mt-2 max-w-md mx-auto">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Pre-interview: Stunning Hero + Mode Selection */}
        {!interviewStarted && (
          <div className="relative">
            {/* Hero Section */}
            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-10">
              {/* Left: Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-4"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-medium text-indigo-300">AI-Powered Interview Coach</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  Meet <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Aria</span>,
                  <br />your interview coach
                </h1>

                <p className="text-zinc-400 text-base md:text-lg max-w-lg mb-6 leading-relaxed">
                  Practice with an AI that listens, responds, and gives you real-time feedback.
                  Build confidence before your next big interview.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {[
                    { label: 'Real-time feedback', icon: '🎯' },
                    { label: 'Voice conversation', icon: '🗣️' },
                    { label: 'Live transcription', icon: '📝' },
                  ].map((feat, i) => (
                    <motion.div
                      key={feat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <span>{feat.icon}</span>
                      <span>{feat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Animated Orb Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative w-64 h-64 md:w-80 md:h-80"
              >
                {/* Ambient glow */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Concentric rings */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border"
                    style={{
                      inset: `${16 + i * 12}%`,
                      borderColor: `rgba(168, 85, 247, ${0.2 - i * 0.04})`,
                    }}
                    animate={{
                      scale: [1, 1.06, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}

                {/* Main orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(168,85,247,0.4), 0 0 120px rgba(99,102,241,0.2)' }} />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                    <div className="absolute w-6 h-3 rounded-full bg-white/30 blur-sm" style={{ left: '32%', top: '26%' }} />
                    <div className="absolute rounded-full bg-white/35 blur-sm" style={{ width: 20, height: 20, left: '50%', top: '38%', transform: 'translate(-50%, -50%)' }} />
                  </div>
                </div>

                {/* Rotating dashed ring */}
                <motion.div
                  className="absolute inset-[-4px] rounded-full border border-dashed border-purple-400/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />

                {/* Floating status badges */}
                <motion.div
                  className="absolute -left-4 top-1/4 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-300 font-medium">Online</span>
                </motion.div>

                <motion.div
                  className="absolute -right-4 bottom-1/3 flex items-center gap-2 rounded-lg bg-purple-500/15 border border-purple-500/20 px-3 py-1.5"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-xs text-purple-300 font-medium">🎙️ Voice AI</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Mode Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-white text-center mb-4">Choose your practice mode</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-3xl mx-auto">
                {MODES.map((mode, i) => (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      'relative rounded-2xl p-5 text-left transition-all border group',
                      selectedMode === mode.id
                        ? 'bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                    )}
                  >
                    <div className="text-3xl mb-3">{mode.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{mode.label}</div>
                    <div className="text-xs text-zinc-400 leading-relaxed">{mode.description}</div>
                    {selectedMode === mode.id && (
                      <motion.div
                        layoutId="mode-indicator"
                        className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Upload + Start */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              {showUpload && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="h-5 w-5 text-indigo-400" />
                        <h3 className="text-white font-medium">Upload Resume (Optional)</h3>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4">
                        Get personalized questions based on your resume or target job description.
                      </p>
                      {uploadedFile ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                            <FileText className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300">{uploadedFile.name}</span>
                          </div>
                          <button onClick={() => { setUploadedFile(null); setFileContent('') }} className="text-zinc-400 hover:text-red-400 transition">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/10 border border-white/10 transition flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Choose file
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={startInterviewFlow}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-4 text-base font-semibold text-white shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" />
                  <line x1="12" x2="12" y1="19" y2="22" strokeLinecap="round" />
                </svg>
                Start Interview with Aria
              </motion.button>

              <p className="text-center text-xs text-zinc-500 mt-3">
                Best experienced in Chrome with microphone enabled
              </p>
            </motion.div>
          </div>
        )}

        {/* Video Call + Sidebar */}
        {interviewStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ height: 'calc(100vh - 10rem)' }}>
            {/* Video Call Area */}
            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden">
              <VideoCallLayout
                isSpeaking={isSpeaking}
                isListening={isListening}
                isCameraOn={cameraOn}
                onToggleCamera={() => setCameraOn(!cameraOn)}
                onToggleMic={() => setMicOn(!micOn)}
                onEndCall={endInterviewFn}
                isMicOn={micOn}
                aiName="Aria"
                aiSubtitle={getAiSubtitle()}
              >
                {/* Floating controls overlay */}
                <div className="absolute bottom-20 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4">
                  {phase === 'listening' && (
                    <motion.button
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmitAnswer}
                      className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/30"
                    >
                      <CheckCircle className="h-4 w-4" /> Submit Answer
                    </motion.button>
                  )}
                  {phase === 'listening' && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { stopListening(); setIsPaused(true) }}
                      className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm text-white backdrop-blur-sm"
                    >
                      <Pause className="h-4 w-4" /> Pause
                    </motion.button>
                  )}
                  {isPaused && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setIsPaused(false); startListening() }}
                      className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white"
                    >
                      <Play className="h-4 w-4" /> Resume
                    </motion.button>
                  )}
                  {!isListening && !isSpeaking && phase !== 'greeting' && phase !== 'asking' && !isPaused && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSkipQuestion}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm text-zinc-300 backdrop-blur-sm"
                    >
                      <SkipForward className="h-4 w-4" /> Skip
                    </motion.button>
                  )}
                </div>

                {/* Timer - top left inside video */}
                <div className="absolute top-16 left-4 z-30">
                  <RecordingTimer
                    totalTime={TOTAL_TIME}
                    remainingTime={remainingTime}
                    isRecording={interviewStarted}
                    isPaused={isPaused}
                  />
                </div>
              </VideoCallLayout>
            </div>

            {/* Sidebar: Live Transcription + Question */}
            <div className="lg:col-span-2 flex flex-col gap-3 h-full">
              {/* Current Question Card */}
              {currentQuestion && (
                <motion.div layout className="rounded-xl border border-white/10 bg-white/5 p-4 shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-zinc-400">Current Question</span>
                    <span className={cn(
                      'ml-auto text-xs px-2 py-0.5 rounded-full',
                      currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400'
                        : currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    )}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{currentQuestion.text}</p>
                </motion.div>
              )}

              {/* Live Transcription Sidebar */}
              <div className="flex-1 min-h-0">
                <InterviewSidebar
                  messages={messages}
                  interimTranscript={interimTranscript}
                  isListening={isListening}
                  isAiSpeaking={isSpeaking}
                  currentQuestion={currentQuestion?.text || ''}
                  questionNumber={currentIdx + 1}
                  totalQuestions={questions.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 space-y-5">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-white">Interview Complete</h2>
                  <p className="text-sm text-zinc-400 mt-1">Here is how you did</p>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444'}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={264}
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * overallScore) / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn('text-3xl font-bold', overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-yellow-400' : 'text-red-400')}>
                        {overallScore}
                      </span>
                      <span className="text-xs text-zinc-500">/100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-300">
                    <span>Questions answered</span>
                    <span>{messages.filter((m) => m.role === 'candidate').length}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Time taken</span>
                    <span>{Math.floor((TOTAL_TIME - remainingTime) / 60)}m {(TOTAL_TIME - remainingTime) % 60}s</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={resetInterview}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-medium text-white">
                  <RotateCcw className="h-4 w-4" /> New Interview
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech not supported warning */}
        {!speechSupported && interviewStarted && (
          <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-center text-sm text-red-300">
            Speech recognition is not supported in this browser. Please use Chrome for the best experience.
          </div>
        )}
      </div>
    </div>
  )
}
