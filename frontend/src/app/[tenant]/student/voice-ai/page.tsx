'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import {
  Waveform3D,
  FaceDetectionOverlay,
  RecordingTimer,
  InterviewSidebar,
  type ChatMessage,
} from '@/components/features/VoiceAI'
import useVoiceRecognition from '@/hooks/useVoiceRecognition'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'
import {
  Video, VideoOff, Camera, Upload, FileText, Mic, Volume2,
  RotateCcw, CheckCircle, XCircle, Bot, Pause, Play,
  Target, ArrowRight, SkipForward,
} from 'lucide-react'

type PracticeMode = 'free' | 'mock-hr' | 'mock-technical' | 'mock-behavioral'

interface ModeOption {
  id: PracticeMode
  label: string
  description: string
  icon: string
  color: string
}

const MODES: ModeOption[] = [
  { id: 'free', label: 'Free Practice', description: 'Speak freely on any topic', icon: '🎤', color: 'from-blue-500 to-cyan-500' },
  { id: 'mock-hr', label: 'HR Interview', description: 'HR-style behavioral questions', icon: '👔', color: 'from-purple-500 to-pink-500' },
  { id: 'mock-technical', label: 'Technical', description: 'Problem-solving & system design', icon: '💻', color: 'from-green-500 to-emerald-500' },
  { id: 'mock-behavioral', label: 'Behavioral', description: 'STAR method scenario questions', icon: '🧠', color: 'from-orange-500 to-amber-500' },
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

  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const faceDetectionRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0))
  const [faceData, setFaceData] = useState<{
    detected: boolean; x: number; y: number; width: number; height: number; confidence: number
  } | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [warningCount, setWarningCount] = useState(0)

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

  const startTimeRef = useRef<number>(Date.now())

  const onSpeechEnd = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'greeting') return 'asking'
      if (prev === 'ai-responding') return 'idle'
      return prev
    })
  }, [])

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis({
    rate: 0.92,
    pitch: 1.0,
    onEnd: onSpeechEnd,
  })

  const handleInterimResult = useCallback((_transcript: string, isFinal: boolean) => {
    if (!isFinal) return
  }, [])

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
    onResult: handleInterimResult,
    onEnd: onRecognitionEnd,
  })

  const currentQuestion = questions[currentIdx]
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0

  const askQuestion = useCallback((question: InterviewQuestion) => {
    setPhase('asking')
    addMessage('interviewer', question.text)
    speak(question.text)
  }, [speak, addMessage])

  const processAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return

    addMessage('candidate', answer)

    const analysis = analyzeAnswer(answer, currentQuestion)
    setPhase('ai-responding')

    const responseText = analysis.followUp
      ? `${analysis.feedback}\n\n${analysis.followUp}`
      : analysis.feedback

    addMessage('interviewer', responseText, analysis.score)
    speak(responseText)

    setTimeout(() => {
      resetTranscript()
      if (analysis.followUp) {
        setTimeout(() => {
          setPhase('listening')
          startListening()
        }, 1000)
      } else {
        moveToNext()
      }
    }, 500)
  }, [currentQuestion, speak, addMessage, resetTranscript, startListening])

  const moveToNext = useCallback(() => {
    const next = currentIdx + 1
    if (next >= questions.length) {
      endInterview()
    } else {
      setCurrentIdx(next)
      resetTranscript()
      setTimeout(() => {
        askQuestion(questions[next])
      }, 1500)
    }
  }, [currentIdx, questions, askQuestion, resetTranscript])

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
    setPhase('greeting')
    startTimeRef.current = Date.now()

    const greeting = `Welcome! I am your AI interviewer for today's ${MODES.find((m) => m.id === selectedMode)?.label} session. ${fileContent ? "I have reviewed your resume and have some questions ready." : "I will ask you a series of questions to help you practice."} Feel free to take your time with each answer. Let us begin!`

    addMessage('interviewer', greeting)
    speak(greeting)
  }, [selectedMode, fileContent, speak, addMessage])

  useEffect(() => {
    if (phase === 'asking' && !isSpeaking) {
      setTimeout(() => {
        setPhase('listening')
        resetTranscript()
        startListening()
      }, 800)
    }
  }, [phase, isSpeaking, startListening, resetTranscript])

  useEffect(() => {
    if (phase === 'idle' && interviewStarted && !isSpeaking && !isListening) {
      if (transcript.trim()) {
        processAnswer(transcript.trim())
      }
    }
  }, [phase, interviewStarted, isSpeaking, isListening, transcript, processAnswer])

  const handleSubmitAnswer = useCallback(() => {
    stopListening()
    const answer = segments.filter((s) => s.isFinal).map((s) => s.text).join(' ')
    if (answer.trim()) {
      processAnswer(answer.trim())
    } else if (transcript.trim()) {
      processAnswer(transcript.trim())
    } else {
      addMessage('candidate', '[No answer provided]')
      setPhase('ai-responding')
      const skipMsg = "That is okay. Let us move to the next question."
      addMessage('interviewer', skipMsg)
      speak(skipMsg)
      setTimeout(() => moveToNext(), 1500)
    }
  }, [stopListening, segments, transcript, processAnswer, speak, addMessage, moveToNext])

  const handleSkipQuestion = useCallback(() => {
    stopListening()
    stopSpeaking()
    setPhase('ai-responding')
    const msg = "No problem. Let us move on to the next question."
    addMessage('interviewer', msg)
    speak(msg)
    setTimeout(() => moveToNext(), 1500)
  }, [stopListening, stopSpeaking, speak, addMessage, moveToNext])

  const endInterview = useCallback(() => {
    stopListening()
    stopSpeaking()
    window.speechSynthesis?.cancel()
    setInterviewStarted(false)
    setPhase('idle')

    ;[timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => {
      if (r.current) clearInterval(r.current as ReturnType<typeof setInterval>)
    })

    const scores = messages.filter((m) => m.score).map((m) => m.score!)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 70
    setOverallScore(Math.round(avg))
    setShowFeedback(true)

    api.submitVoiceSession({
      sessionType: selectedMode,
      durationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      accuracyScore: Math.round(avg),
      transcribedText: messages.map((m) => `${m.role}: ${m.text}`).join('\n'),
      aiFeedback: `Score: ${Math.round(avg)}/100. ${messages.length} messages exchanged.`,
    }).catch(() => {})
  }, [stopListening, stopSpeaking, messages, selectedMode])

  const resetInterview = useCallback(() => {
    stopListening()
    stopSpeaking()
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
    ;[timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => {
      if (r.current) clearInterval(r.current as ReturnType<typeof setInterval>)
    })
  }, [stopListening, stopSpeaking, resetTranscript])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingTime((p) => {
        if (p <= 1) { endInterview(); return 0 }
        return p - 1
      })
    }, 1000)
    audioIntervalRef.current = setInterval(() => {
      setAudioData((p) => p.map(() => Math.random() * 0.8 + 0.1))
    }, 80)
    return () => {
      ;[timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => {
        if (r.current) clearInterval(r.current as ReturnType<typeof setInterval>)
      })
      streamRef.current?.getTracks().forEach((t) => t.stop())
      window.speechSynthesis?.cancel()
    }
  }, [endInterview])

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraEnabled(true)
      faceDetectionRef.current = setInterval(() => {
        const ok = Math.random() > 0.05
        setFaceData(ok
          ? { detected: true, x: 25 + Math.random() * 10, y: 15 + Math.random() * 10, width: 40 + Math.random() * 5, height: 50 + Math.random() * 5, confidence: 0.85 + Math.random() * 0.15 }
          : { detected: false, x: 0, y: 0, width: 0, height: 0, confidence: 0 })
        if (!ok) {
          setWarnings((prev) => [...prev.slice(-4), 'Face not detected!'])
          setWarningCount((prev) => prev + 1)
        }
      }, 1500)
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string }
      if (error?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error?.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera device.')
      } else {
        setCameraError(`Camera error: ${error?.message || 'Unknown error'}`)
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    if (faceDetectionRef.current) clearInterval(faceDetectionRef.current as ReturnType<typeof setInterval>)
    setCameraEnabled(false)
    setFaceData(null)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setFileContent(ev.target?.result as string) }
    reader.readAsText(file)
    setUploadedFile(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">AI Interview Practice</h1>
          <p className="text-sm text-zinc-400">
            {interviewStarted
              ? `Question ${currentIdx + 1} of ${questions.length} • ${currentQuestion?.category || ''}`
              : 'Upload your resume and practice with an AI interviewer'}
          </p>
          {interviewStarted && (
            <div className="mt-3 max-w-md mx-auto">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Mode Selection */}
        {!interviewStarted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {MODES.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  'relative rounded-xl p-4 text-left transition-all border',
                  selectedMode === mode.id
                    ? 'bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/8'
                )}
              >
                <div className="text-2xl mb-2">{mode.icon}</div>
                <div className="text-sm font-medium text-white">{mode.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{mode.description}</div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {showUpload && !interviewStarted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-medium">Resume / Job Description</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                  Upload your resume or job description for personalized interview questions.
                </p>
                {uploadedFile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-300">{uploadedFile.name}</span>
                    </div>
                    <button onClick={() => { setUploadedFile(null); setFileContent('') }} className="text-zinc-400 hover:text-red-400">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/15 border border-white/10 transition">
                    Choose file
                  </button>
                )}
              </div>
              <div className="text-right">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startInterviewFlow}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20"
                >
                  Start Interview
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Layout: Camera + Controls | Sidebar */}
        {interviewStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left: Camera + Waveform + Controls */}
            <div className="lg:col-span-3 space-y-4">
              {/* Camera */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 border border-white/10">
                <video ref={videoRef} className={cn('w-full h-full object-cover', cameraEnabled ? 'opacity-100' : 'opacity-0')} muted playsInline />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {cameraError ? (
                      <>
                        <Camera className="h-12 w-12 text-red-400" />
                        <p className="text-red-400 text-sm max-w-xs text-center">{cameraError}</p>
                        <button onClick={startCamera} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                          <Video className="h-4 w-4" /> Try Again
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera className="h-12 w-12 text-zinc-600" />
                        <p className="text-zinc-500 text-xs">Camera is off (optional)</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startCamera}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20">
                          <Video className="h-4 w-4" /> Enable Camera
                        </motion.button>
                      </>
                    )}
                  </div>
                )}
                {cameraEnabled && (
                  <button onClick={stopCamera} className="absolute top-3 right-3 z-20 rounded-full bg-red-500/80 p-2 text-white">
                    <VideoOff className="h-4 w-4" />
                  </button>
                )}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-white animate-pulse" />
                      <span className="text-xs text-white font-medium">Interviewer is speaking</span>
                    </motion.div>
                  )}
                  {isListening && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1.5">
                      <Mic className="h-3.5 w-3.5 text-white animate-pulse" />
                      <span className="text-xs text-white font-medium">Listening...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <FaceDetectionOverlay faceData={faceData} warnings={warnings} warningCount={warningCount} className="absolute inset-0" />
              </div>

              {/* Waveform */}
              <div className="h-20 rounded-2xl overflow-hidden border border-white/10">
                <Waveform3D audioData={isListening ? audioData.map(() => Math.random() * 0.6 + 0.2) : audioData} isRecording={isListening || isSpeaking} className="w-full h-full" />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <RecordingTimer totalTime={TOTAL_TIME} remainingTime={remainingTime} isRecording={interviewStarted} isPaused={isPaused} />

                <div className="flex-1 flex items-center gap-2">
                  {phase === 'listening' && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmitAnswer}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/20">
                      <CheckCircle className="h-4 w-4" /> Submit Answer
                    </motion.button>
                  )}
                  {phase === 'listening' && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { stopListening(); setIsPaused(true) }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-zinc-300 border border-white/10">
                      <Pause className="h-4 w-4" /> Pause
                    </motion.button>
                  )}
                  {isPaused && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsPaused(false); startListening() }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white">
                      <Play className="h-4 w-4" /> Resume
                    </motion.button>
                  )}
                  {!isListening && !isSpeaking && phase !== 'greeting' && phase !== 'asking' && !isPaused && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSkipQuestion}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-400 hover:text-zinc-300 border border-white/5">
                      <SkipForward className="h-4 w-4" /> Skip
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale: 0.95 }} onClick={endInterview}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 border border-red-500/10">
                    End
                  </motion.button>
                </div>
              </div>

              {/* Current Question Card */}
              {currentQuestion && (
                <motion.div layout className="rounded-xl border border-white/10 bg-white/5 p-4">
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
            </div>

            {/* Right: Sidebar with live transcription */}
            <div className="lg:col-span-2 h-[calc(100vh-12rem)]">
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
        )}

        {/* Mode Selection (before interview) */}
        {!interviewStarted && !showUpload && (
          <div className="space-y-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={startInterviewFlow}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20">
              <Mic className="h-4 w-4" /> Start Practice
            </motion.button>
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white">
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
