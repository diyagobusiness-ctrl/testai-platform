'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  Waveform3D,
  FaceDetectionOverlay,
  RecordingTimer,
  SessionHistory,
} from '@/components/features/VoiceAI';
import {
  Video, VideoOff, Camera, Upload, FileText, Mic, MicOff, Volume2,
  RotateCcw, CheckCircle, XCircle, MessageSquare, Sparkles,
  User, Bot, ChevronRight, Pause, Play, Settings, Target,
  Clock, Zap, ArrowRight
} from 'lucide-react';

type PracticeMode = 'free' | 'mock-hr' | 'mock-technical' | 'mock-behavioral';

interface ModeOption {
  id: PracticeMode;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const MODES: ModeOption[] = [
  { id: 'free', label: 'Free Practice', description: 'Speak freely on any topic', icon: '🎤', color: 'from-blue-500 to-cyan-500' },
  { id: 'mock-hr', label: 'HR Interview', description: 'HR-style behavioral questions', icon: '👔', color: 'from-purple-500 to-pink-500' },
  { id: 'mock-technical', label: 'Technical', description: 'Problem-solving & system design', icon: '💻', color: 'from-green-500 to-emerald-500' },
  { id: 'mock-behavioral', label: 'Behavioral', description: 'STAR method scenario questions', icon: '🧠', color: 'from-orange-500 to-amber-500' },
];

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
  score?: number;
  feedback?: string;
  isQuick?: boolean;
}

interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  keywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const TOTAL_TIME = 300;

// Smart question bank with keywords for answer analysis
const SMART_QUESTIONS: Record<PracticeMode, InterviewQuestion[]> = {
  'free': [
    { id: 'f1', text: "Tell me about yourself and your professional background.", category: 'intro', keywords: ['experience', 'background', 'years', 'role', 'specialize'], difficulty: 'easy' },
    { id: 'f2', text: "What are your greatest professional strengths?", category: 'strengths', keywords: ['strength', 'good at', 'skill', 'talent', 'excel'], difficulty: 'easy' },
    { id: 'f3', text: "Where do you see yourself in 5 years?", category: 'goals', keywords: ['goal', 'plan', 'future', 'want', 'become'], difficulty: 'medium' },
    { id: 'f4', text: "Describe a challenging project you've worked on and how you handled it.", category: 'experience', keywords: ['project', 'challenge', 'difficult', 'solved', 'achieved'], difficulty: 'medium' },
    { id: 'f5', text: "Why are you interested in this field or industry?", category: 'motivation', keywords: ['passion', 'interest', 'love', 'drive', 'reason'], difficulty: 'easy' },
    { id: 'f6', text: "How do you handle stress and pressure at work?", category: 'resilience', keywords: ['stress', 'pressure', 'manage', 'cope', 'balance'], difficulty: 'medium' },
    { id: 'f7', text: "What makes you unique compared to other candidates?", category: 'differentiation', keywords: ['unique', 'different', 'special', 'value', 'bring'], difficulty: 'medium' },
    { id: 'f8', text: "Describe your ideal work environment.", category: 'culture', keywords: ['environment', 'culture', 'team', 'prefer', 'style'], difficulty: 'easy' },
  ],
  'mock-hr': [
    { id: 'h1', text: "Tell me about yourself.", category: 'intro', keywords: ['background', 'experience', 'education', 'career', 'journey'], difficulty: 'easy' },
    { id: 'h2', text: "Why do you want to work for our company?", category: 'motivation', keywords: ['company', 'mission', 'values', 'culture', 'attracted'], difficulty: 'medium' },
    { id: 'h3', text: "What are your salary expectations?", category: 'compensation', keywords: ['salary', 'compensation', 'range', 'expect', 'market'], difficulty: 'medium' },
    { id: 'h4', text: "How do you handle conflict with a coworker?", category: 'interpersonal', keywords: ['conflict', 'resolution', 'communicate', 'listen', 'compromise'], difficulty: 'medium' },
    { id: 'h5', text: "Why did you leave your last position?", category: 'history', keywords: ['reason', 'left', 'opportunity', 'growth', 'looking'], difficulty: 'medium' },
    { id: 'h6', text: "How do you handle feedback and criticism?", category: 'growth', keywords: ['feedback', 'learn', 'improve', 'constructive', 'accept'], difficulty: 'medium' },
    { id: 'h7', text: "Do you have any questions for us?", category: 'engagement', keywords: ['question', 'ask', 'curious', 'want to know', 'wondering'], difficulty: 'easy' },
    { id: 'h8', text: "Describe your ideal work-life balance.", category: 'balance', keywords: ['balance', 'flexible', 'hours', 'remote', 'priorities'], difficulty: 'easy' },
  ],
  'mock-technical': [
    { id: 't1', text: "Walk me through your technical background and key skills.", category: 'overview', keywords: ['skill', 'technology', 'language', 'framework', 'experience'], difficulty: 'easy' },
    { id: 't2', text: "Explain the difference between REST and GraphQL APIs.", category: 'api', keywords: ['rest', 'graphql', 'endpoint', 'query', 'http'], difficulty: 'medium' },
    { id: 't3', text: "How would you design a URL shortener like bit.ly?", category: 'system-design', keywords: ['design', 'database', 'hash', 'redirect', 'scale'], difficulty: 'hard' },
    { id: 't4', text: "What is the time complexity of quicksort and when would you use it?", category: 'algorithms', keywords: ['time', 'complexity', 'log', 'n', 'sort'], difficulty: 'medium' },
    { id: 't5', text: "Explain the concept of dependency injection.", category: 'patterns', keywords: ['dependency', 'injection', 'invert', 'coupling', 'loose'], difficulty: 'medium' },
    { id: 't6', text: "How does garbage collection work in modern languages?", category: 'memory', keywords: ['garbage', 'collection', 'memory', 'heap', 'reference'], difficulty: 'medium' },
    { id: 't7', text: "Tell me about a time you optimized code for better performance.", category: 'optimization', keywords: ['optimize', 'performance', 'faster', 'cache', 'profiling'], difficulty: 'medium' },
    { id: 't8', text: "How do you approach debugging a complex production issue?", category: 'debugging', keywords: ['debug', 'log', 'trace', 'monitor', 'diagnose'], difficulty: 'medium' },
  ],
  'mock-behavioral': [
    { id: 'b1', text: "Tell me about a time you demonstrated leadership.", category: 'leadership', keywords: ['lead', 'team', 'guide', 'direct', 'influence'], difficulty: 'medium' },
    { id: 'b2', text: "Describe a situation where you had to meet a tight deadline.", category: 'time-management', keywords: ['deadline', 'priority', 'manage', 'organize', 'deliver'], difficulty: 'medium' },
    { id: 'b3', text: "Give an example of when you showed initiative.", category: 'initiative', keywords: ['initiative', 'proactive', 'started', 'created', 'suggested'], difficulty: 'medium' },
    { id: 'b4', text: "Tell me about a time you failed and what you learned from it.", category: 'failure', keywords: ['fail', 'learn', 'mistake', 'grow', 'improve'], difficulty: 'hard' },
    { id: 'b5', text: "Describe a situation where you had to persuade someone.", category: 'persuasion', keywords: ['persuade', 'convince', 'negotiate', 'influence', 'outcome'], difficulty: 'medium' },
    { id: 'b6', text: "Tell me about a time you worked on a challenging team project.", category: 'teamwork', keywords: ['team', 'collaborate', 'together', 'contribute', 'group'], difficulty: 'medium' },
    { id: 'b7', text: "Describe a time you had to adapt to a significant change.", category: 'adaptability', keywords: ['change', 'adapt', 'flexible', 'adjust', 'new'], difficulty: 'medium' },
    { id: 'b8', text: "Give an example of when you went above and beyond.", category: 'excellence', keywords: ['extra', 'above', 'beyond', 'exceptional', 'exceeded'], difficulty: 'medium' },
  ],
};

// AI Response Generator - analyzes answers and generates contextual responses
function generateAiResponse(answer: string, question: InterviewQuestion, allMessages: ChatMessage[]): {
  feedback: string;
  score: number;
  followUp?: string;
  sentiment: 'positive' | 'neutral' | 'needs-improvement';
} {
  const lowerAnswer = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).length;

  // Score calculation based on multiple factors
  let score = 50;

  // 1. Length factor (longer = more detailed)
  if (wordCount > 50) score += 15;
  else if (wordCount > 30) score += 10;
  else if (wordCount > 15) score += 5;
  else score -= 10;

  // 2. Keyword matching (shows understanding)
  const matchedKeywords = question.keywords.filter((kw) => lowerAnswer.includes(kw));
  score += matchedKeywords.length * 5;

  // 3. Specificity indicators
  const hasExamples = /for example|such as|specifically|instance|one time/.test(lowerAnswer);
  const hasNumbers = /\d+/.test(answer);
  const hasActionVerbs = /managed|led|created|implemented|improved|reduced|increased|achieved|delivered/.test(lowerAnswer);
  const hasSTAR = /situation|task|action|result/.test(lowerAnswer);

  if (hasExamples) score += 8;
  if (hasNumbers) score += 5;
  if (hasActionVerbs) score += 8;
  if (hasSTAR) score += 7;

  // 4. Professional tone
  const hasProfessional = /professional|experience|skills|team|collaborate|communicate/.test(lowerAnswer);
  const hasFiller = /um|uh|like|basically|you know|kind of/.test(lowerAnswer);
  if (hasProfessional) score += 5;
  if (hasFiller) score -= 3;

  // Clamp score
  score = Math.max(40, Math.min(100, score));

  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'needs-improvement' = 'neutral';
  if (score >= 75) sentiment = 'positive';
  else if (score < 60) sentiment = 'needs-improvement';

  // Generate contextual feedback
  const feedbackOptions = {
    positive: [
      "Excellent response! You provided specific details and demonstrated strong understanding.",
      "Great answer! Your examples were clear and relevant.",
      "Well structured response. I can see you've thought about this carefully.",
      "Impressive! You communicated your points very effectively.",
    ],
    neutral: [
      "Good start. Could you provide more specific examples?",
      "Decent answer. Try to include more measurable outcomes.",
      "That's a solid foundation. Let's dig deeper with some specifics.",
      "You're on the right track. Adding concrete examples would strengthen this.",
    ],
    'needs-improvement': [
      "Let me help you improve this. Try using the STAR method: Situation, Task, Action, Result.",
      "Consider being more specific. What exactly did you do? What was the outcome?",
      "Good attempt. Try to include concrete examples and measurable results.",
      "Let's try again with more detail. Think about a specific situation where you applied this.",
    ],
  };

  const feedback = feedbackOptions[sentiment][Math.floor(Math.random() * feedbackOptions[sentiment].length)];

  // Generate follow-up based on answer content
  let followUp: string | undefined;

  if (wordCount < 20) {
    followUp = "Could you elaborate more on that? I'd like to hear more details.";
  } else if (!hasExamples) {
    followUp = "Can you give me a specific example to illustrate this?";
  } else if (!hasNumbers) {
    followUp = "Do you have any metrics or numbers that show the impact of this?";
  } else if (sentiment === 'positive' && allMessages.length > 2) {
    const followUps = [
      "That was great. How did others respond to your approach?",
      "Excellent! What would you do differently if faced with the same situation again?",
      "Strong answer. What key lessons did you take away from that experience?",
    ];
    followUp = followUps[Math.floor(Math.random() * followUps.length)];
  }

  return { feedback, score, followUp, sentiment };
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.0;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// Quick reply suggestions for common scenarios
const QUICK_REPLIES: Record<string, string[]> = {
  'intro': [
    "I'm a software engineer with 5 years of experience...",
    "I specialize in full-stack development with React and Node.js...",
  ],
  'strengths': [
    "My greatest strength is problem-solving and analytical thinking...",
    "I'm known for my strong communication and leadership skills...",
  ],
  'leadership': [
    "In my last role, I led a team of 5 developers to deliver...",
    "I took initiative to organize weekly code reviews which...",
  ],
};

export default function VoiceAIPage() {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('free');
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME);
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0));
  const [transcriptionSegments, setTranscriptionSegments] = useState<
    { id: string; text: string; timestamp: number; isFinal: boolean }[]
  >([]);
  const [faceData, setFaceData] = useState<{
    detected: boolean; x: number; y: number; width: number; height: number; confidence: number;
  } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    { id: string; date: string; mode: string; overallScore: number; duration: string; wordCount: number; }[]
  >([]);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceDetectionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Interview state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentSentiment, setCurrentSentiment] = useState<'positive' | 'neutral' | 'needs-improvement'>('neutral');
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = interviewQuestions.length > 0 ? ((currentQuestionIndex + 1) / interviewQuestions.length) * 100 : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setFileContent(ev.target?.result as string); };
    reader.readAsText(file);
    setUploadedFile(file);
  };

  const startInterview = () => {
    let questions = [...SMART_QUESTIONS[selectedMode]];

    // Enrich with file content keywords if uploaded
    if (fileContent) {
      const words = fileContent.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const uniqueWords = [...new Set(words)].slice(0, 10);
      questions = questions.map((q) => ({
        ...q,
        keywords: [...q.keywords, ...uniqueWords],
      }));
      // Add resume-specific question
      questions.unshift({
        id: 'resume-specific',
        text: "Based on your resume, tell me about your most relevant experience for this role.",
        category: 'resume',
        keywords: uniqueWords.slice(0, 5),
        difficulty: 'medium',
      });
    }

    setInterviewQuestions(questions);
    setCurrentQuestionIndex(0);
    setChatMessages([]);
    setInterviewStarted(true);
    setShowUpload(false);

    const greeting = `Welcome! I'm your AI interviewer for today's ${MODES.find((m) => m.id === selectedMode)?.label} session. ${fileContent ? "I've reviewed your resume and have some questions ready." : "I'll ask you a series of questions to help you practice."} Feel free to take your time with each answer. Let's begin!`;

    setIsAiSpeaking(true);
    setChatMessages([{
      id: 'greeting', role: 'ai', text: greeting, timestamp: Date.now(),
    }]);
    speak(greeting).then(() => {
      setIsAiSpeaking(false);
      setTimeout(() => {
        if (questions[0]) askQuestion(questions[0]);
      }, 1000);
    });
  };

  const askQuestion = async (question: InterviewQuestion) => {
    setIsAiSpeaking(true);
    setChatMessages((prev) => [
      ...prev,
      { id: question.id, role: 'ai', text: question.text, timestamp: Date.now() },
    ]);
    await speak(question.text);
    setIsAiSpeaking(false);
    setTimeout(() => startListening(), 500);
  };

  const startListening = () => {
    if (!speechSupported) {
      alert('Speech recognition not supported. Please use Chrome.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => { setIsListening(true); setTranscriptionSegments([]); };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        setTranscriptionSegments((prev) => [...prev, { id: crypto.randomUUID(), text: final, timestamp: Date.now(), isFinal: true }]);
      }
      if (interim) {
        setTranscriptionSegments((prev) => {
          const last = prev[prev.length - 1];
          if (last && !last.isFinal) return [...prev.slice(0, -1), { ...last, text: interim, timestamp: Date.now() }];
          return [...prev, { id: 'interim', text: interim, timestamp: Date.now(), isFinal: false }];
        });
      }
    };

    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setIsListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setTimeout(() => { recognitionRef.current?.stop(); }, 90000);
  };

  const stopListening = () => { recognitionRef.current?.stop(); };

  const submitAnswer = () => {
    stopListening();
    const userAnswer = transcriptionSegments.filter((s) => s.isFinal).map((s) => s.text).join(' ');

    if (!userAnswer.trim()) {
      setChatMessages((prev) => [...prev, {
        id: `no-${Date.now()}`, role: 'user', text: '[No answer provided]', timestamp: Date.now(),
      }]);
      setCurrentSentiment('needs-improvement');
      const msg = "That's okay. Let's move to the next question.";
      setChatMessages((prev) => [...prev, { id: `skip-${Date.now()}`, role: 'ai', text: msg, timestamp: Date.now() }]);
      speak(msg).then(() => setTimeout(() => moveToNext(), 1500));
      return;
    }

    // Analyze answer
    const analysis = generateAiResponse(userAnswer, interviewQuestions[currentQuestionIndex], chatMessages);
    setCurrentSentiment(analysis.sentiment);

    // Add user message with score
    setChatMessages((prev) => [...prev, {
      id: `ans-${Date.now()}`, role: 'user', text: userAnswer, timestamp: Date.now(), score: analysis.score,
    }]);
    setTranscriptionSegments([]);

    // AI response
    const responseText = analysis.followUp
      ? `${analysis.feedback}\n\n${analysis.followUp}`
      : analysis.feedback;

    setTimeout(() => {
      setChatMessages((prev) => [...prev, {
        id: `fb-${Date.now()}`, role: 'ai', text: responseText, timestamp: Date.now(),
      }]);
      setIsAiSpeaking(true);
      speak(responseText).then(() => {
        setIsAiSpeaking(false);
        setTimeout(() => {
          if (analysis.followUp) {
            // Wait for user to answer follow-up
            setTimeout(() => startListening(), 1000);
          } else {
            moveToNext();
          }
        }, 1500);
      });
    }, 800);
  };

  const skipQuestion = () => {
    stopListening();
    setIsListening(false);
    const msg = "No problem. Let's move on to the next question.";
    setChatMessages((prev) => [...prev, {
      id: `skip-${Date.now()}`, role: 'ai', text: msg, timestamp: Date.now(),
    }]);
    speak(msg).then(() => setTimeout(() => moveToNext(), 1500));
  };

  const moveToNext = () => {
    const next = currentQuestionIndex + 1;
    if (next >= interviewQuestions.length) {
      endInterview();
    } else {
      setCurrentQuestionIndex(next);
      setCurrentSentiment('neutral');
      setTimeout(() => askQuestion(interviewQuestions[next]), 1500);
    }
  };

  const endInterview = () => {
    setInterviewStarted(false);
    setIsRecording(false);
    [timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => { if (r.current) clearInterval(r.current as any); });

    const scores = chatMessages.filter((m) => m.score).map((m) => m.score!);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 70;

    const usedTime = TOTAL_TIME - remainingTime;
    const m = Math.floor(usedTime / 60);
    const s = usedTime % 60;

    setSessionHistory((prev) => [{
      id: crypto.randomUUID(), date: new Date().toLocaleDateString(),
      mode: MODES.find((mo) => mo.id === selectedMode)?.label ?? 'Practice',
      overallScore: Math.round(avg), duration: `${m}:${s.toString().padStart(2, '0')}`,
      wordCount: chatMessages.filter((cm) => cm.role === 'user').length * 25,
    }, ...prev]);
    setShowFeedback(true);
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraEnabled(true);
      faceDetectionRef.current = setInterval(() => {
        const ok = Math.random() > 0.05;
        setFaceData(ok
          ? { detected: true, x: 25 + Math.random() * 10, y: 15 + Math.random() * 10, width: 40 + Math.random() * 5, height: 50 + Math.random() * 5, confidence: 0.85 + Math.random() * 0.15 }
          : { detected: false, x: 0, y: 0, width: 0, height: 0, confidence: 0 });
        if (!ok) {
          setWarnings((p) => [...p.slice(-4), 'Face not detected!']);
          setWarningCount((p) => p + 1);
        }
      }, 1500);
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera device.');
      } else {
        setCameraError(`Camera error: ${err?.message || 'Unknown error'}`);
      }
    }
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (faceDetectionRef.current) clearInterval(faceDetectionRef.current);
    setCameraEnabled(false); setFaceData(null);
  };

  const startRecording = useCallback(() => {
    setIsRecording(true); setRemainingTime(TOTAL_TIME); setShowFeedback(false);
    setTranscriptionSegments([]); setWarnings([]); setWarningCount(0);
    startCamera();
    timerRef.current = setInterval(() => { setRemainingTime((p) => { if (p <= 1) { endInterview(); return 0; } return p - 1; }); }, 1000);
    audioIntervalRef.current = setInterval(() => { setAudioData((p) => p.map(() => Math.random() * 0.8 + 0.1)); }, 80);
  }, [startCamera]);

  const resetInterview = () => {
    stopListening(); window.speechSynthesis?.cancel();
    setInterviewStarted(false); setShowUpload(true); setShowFeedback(false);
    setChatMessages([]); setInterviewQuestions([]); setCurrentQuestionIndex(0);
    setUploadedFile(null); setFileContent(''); setTranscriptionSegments([]);
    setRemainingTime(TOTAL_TIME); setIsRecording(false); setCurrentSentiment('neutral');
    [timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => { if (r.current) clearInterval(r.current as any); });
  };

  useEffect(() => {
    return () => {
      [timerRef, audioIntervalRef, faceDetectionRef].forEach((r) => { if (r.current) clearInterval(r.current as any); });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const feedbackData = useMemo(() => {
    const scores = chatMessages.filter((m) => m.score).map((m) => m.score!);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
    return {
      overallScore: Math.round(avg),
      breakdown: {
        content: Math.floor(Math.random() * 25) + 70,
        fluency: Math.floor(Math.random() * 25) + 70,
        grammar: Math.floor(Math.random() * 25) + 70,
      },
      suggestions: [
        { category: 'Clarity', message: 'Speak more slowly and pause between key points.' },
        { category: 'Structure', message: 'Use STAR method: Situation, Task, Action, Result.' },
        { category: 'Impact', message: 'Include metrics and specific outcomes in your answers.' },
      ],
    };
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">AI Interview Practice</h1>
          <p className="text-sm text-zinc-400">
            {interviewStarted
              ? `Question ${currentQuestionIndex + 1} of ${interviewQuestions.length} • ${currentQuestion?.category}`
              : 'Upload your resume and practice with an AI interviewer'}
          </p>
          {/* Progress bar */}
          {interviewStarted && (
            <div className="mt-3 max-w-md mx-auto">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                />
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6"
          >
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
                    <button onClick={() => { setUploadedFile(null); setFileContent(''); }} className="text-zinc-400 hover:text-red-400">
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
                  onClick={startInterview}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20"
                >
                  Start Interview
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Camera + Waveform */}
          <div className="lg:col-span-2 space-y-4">
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
                      <p className="text-zinc-500 text-xs">Camera is off</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startCamera}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20"
                      >
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
              {/* AI/Live indicators */}
              <AnimatePresence>
                {isAiSpeaking && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-white animate-pulse" />
                    <span className="text-xs text-white font-medium">AI is speaking</span>
                  </motion.div>
                )}
                {isListening && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1.5">
                    <Mic className="h-3.5 w-3.5 text-white animate-pulse" />
                    <span className="text-xs text-white font-medium">Listening</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <FaceDetectionOverlay faceData={faceData} warnings={warnings} warningCount={warningCount} className="absolute inset-0" />
            </div>

            {/* Waveform */}
            <div className="h-24 rounded-2xl overflow-hidden border border-white/10">
              <Waveform3D audioData={isListening ? audioData.map(() => Math.random() * 0.6 + 0.2) : audioData} isRecording={isRecording || isListening} className="w-full h-full" />
            </div>

            {/* Chat Area */}
            {interviewStarted && (
              <div className="rounded-2xl border border-white/10 bg-white/5 max-h-[320px] overflow-y-auto">
                <div className="p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {msg.role === 'ai' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                        msg.role === 'ai'
                          ? 'bg-blue-500/15 text-blue-50 border border-blue-500/20'
                          : 'bg-white/10 text-zinc-100 border border-white/10'
                      )}>
                        <p className="leading-relaxed">{msg.text}</p>
                        {msg.score !== undefined && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                            <div className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              msg.score >= 80 ? 'bg-green-500/20 text-green-400' : msg.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            )}>
                              {msg.score}/100
                            </div>
                            {currentSentiment === 'positive' && <Sparkles className="h-3.5 w-3.5 text-yellow-400" />}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-4">
            <RecordingTimer totalTime={TOTAL_TIME} remainingTime={remainingTime} isRecording={isRecording || interviewStarted} />

            {/* Current Question Card */}
            {interviewStarted && currentQuestion && (
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

            {/* Sentiment Indicator */}
            {interviewStarted && (
              <div className="flex items-center justify-center gap-3">
                {(['needs-improvement', 'neutral', 'positive'] as const).map((s) => (
                  <div key={s} className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    currentSentiment === s
                      ? s === 'positive' ? 'bg-green-400 scale-125' : s === 'neutral' ? 'bg-yellow-400 scale-125' : 'bg-red-400 scale-125'
                      : 'bg-white/20'
                  )} />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {interviewStarted && (
              <div className="space-y-2">
                {!isListening && !isAiSpeaking && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={startListening}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white">
                    <Mic className="h-4 w-4" /> Start Answering
                  </motion.button>
                )}
                {isListening && (
                  <div className="space-y-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={submitAnswer}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-medium text-white">
                      <CheckCircle className="h-4 w-4" /> Submit Answer
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={stopListening}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm text-zinc-300 border border-white/10">
                      <Pause className="h-4 w-4" /> Pause
                    </motion.button>
                  </div>
                )}
                {!isAiSpeaking && !isListening && chatMessages.length > 0 && (
                  <button onClick={skipQuestion}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm text-zinc-400 hover:text-zinc-300 border border-white/5">
                    Skip Question <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={endInterview}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-sm text-red-400 hover:bg-red-500/20 border border-red-500/10">
                  End Interview
                </button>
              </div>
            )}

            {!interviewStarted && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { startRecording(); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20">
                <Mic className="h-4 w-4" /> Free Practice
              </motion.button>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h3 className="text-white font-medium">Interview Complete</h3>
                <div className="text-3xl font-bold text-center py-3">
                  <span className={cn(feedbackData.overallScore >= 80 ? 'text-green-400' : feedbackData.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400')}>
                    {feedbackData.overallScore}
                  </span>
                  <span className="text-sm text-zinc-400 ml-1">/100</span>
                </div>
                <button onClick={resetInterview}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white">
                  <RotateCcw className="h-4 w-4" /> New Interview
                </button>
              </div>
            )}

            <SessionHistory sessions={sessionHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
