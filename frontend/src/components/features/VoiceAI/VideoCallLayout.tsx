'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import AIAvatar from './AIAvatar'
import FaceDetectionOverlay, { type FaceDetection } from './FaceDetectionOverlay'
import {
  Video, VideoOff, Camera, Mic, MicOff,
  PhoneOff, Maximize2, Minimize2,
} from 'lucide-react'

interface VideoCallLayoutProps {
  isSpeaking: boolean
  isListening: boolean
  isCameraOn: boolean
  onToggleCamera: () => void
  onToggleMic: () => void
  onEndCall: () => void
  isMicOn: boolean
  aiName?: string
  aiSubtitle?: string
  children?: React.ReactNode
}

export default function VideoCallLayout({
  isSpeaking,
  isListening,
  isCameraOn,
  onToggleCamera,
  onToggleMic,
  onEndCall,
  isMicOn,
  aiName = 'AI Interviewer',
  aiSubtitle = 'Ready to begin',
  children,
}: VideoCallLayoutProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<FaceDetector | null>(null)
  const animFrameRef = useRef<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [faceData, setFaceData] = useState<FaceDetection | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [warningCount, setWarningCount] = useState(0)
  const noFaceStartRef = useRef<number>(0)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((p) => p + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const addWarning = useCallback((msg: string) => {
    setWarnings((prev) => {
      const next = [...prev, msg]
      return next.slice(-5)
    })
    setWarningCount((p) => p + 1)
  }, [])

  const detectFace = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFace)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(detectFace)
      return
    }

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      if (detectorRef.current) {
        const faces = await detectorRef.current.detect(canvas)
        if (faces.length > 0) {
          const face = faces[0]
          const box = face.boundingBox
          const x = (box.x / canvas.width) * 100
          const y = (box.y / canvas.height) * 100
          const w = (box.width / canvas.width) * 100
          const h = (box.height / canvas.height) * 100
          setFaceData({
            detected: true,
            x, y,
            width: w,
            height: h,
            confidence: face.landmarks ? 0.92 : 0.85,
          })
          noFaceStartRef.current = 0
        } else {
          handleNoFace()
        }
      } else {
        simpleFaceCheck(ctx, canvas.width, canvas.height)
      }
    } catch {
      simpleFaceCheck(ctx, canvas.width, canvas.height)
    }

    animFrameRef.current = requestAnimationFrame(detectFace)
  }, [])

  const simpleFaceCheck = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    let skinPixels = 0
    const totalPixels = w * h

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15 &&
          r - Math.min(g, b) > 15) {
        skinPixels++
      }
    }

    const skinRatio = skinPixels / (totalPixels / 4)
    if (skinRatio > 0.08) {
      setFaceData({
        detected: true,
        x: 15,
        y: 10,
        width: 70,
        height: 75,
        confidence: Math.min(0.95, 0.7 + skinRatio),
      })
      noFaceStartRef.current = 0
    } else {
      handleNoFace()
    }
  }, [])

  const handleNoFace = useCallback(() => {
    if (noFaceStartRef.current === 0) {
      noFaceStartRef.current = Date.now()
    }
    const elapsed = Date.now() - noFaceStartRef.current
    setFaceData({ detected: false, x: 0, y: 0, width: 0, height: 0, confidence: 0 })

    if (elapsed > 3000 && elapsed < 3200) {
      addWarning('Face not detected — please look at the camera')
    } else if (elapsed > 8000 && elapsed < 8200) {
      addWarning('Keep your face visible during the interview')
    }
  }, [addWarning])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      if ('FaceDetector' in window) {
        try {
          detectorRef.current = new (window as unknown as Record<string, new () => FaceDetector>).FaceDetector()
        } catch {
          detectorRef.current = null
        }
      }

      animFrameRef.current = requestAnimationFrame(detectFace)
    } catch {
      // Camera not available
    }
  }, [detectFace])

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    detectorRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setFaceData(null)
    setWarnings([])
    setWarningCount(0)
    noFaceStartRef.current = 0
  }, [])

  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isCameraOn, startCamera, stopCamera])

  return (
    <div className={cn(
      'relative w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border border-white/10',
      isFullscreen && 'fixed inset-0 z-50 rounded-none'
    )}>
      {/* AI Avatar - Main view */}
      <div className="absolute inset-0">
        <AIAvatar
          isSpeaking={isSpeaking}
          isListening={isListening}
          name={aiName}
          subtitle={aiSubtitle}
        />
      </div>

      {/* Student Camera - Picture in Picture */}
      <div className="absolute top-4 right-4 z-20">
        <motion.div
          layout
          className={cn(
            'relative rounded-xl overflow-hidden border-2 shadow-2xl bg-zinc-800',
            isCameraOn ? 'w-44 h-32 md:w-56 md:h-40' : 'w-44 h-32 md:w-56 md:h-40'
          )}
          whileHover={{ scale: 1.02 }}
        >
          <video
            ref={videoRef}
            className={cn(
              'w-full h-full object-cover',
              isCameraOn ? 'opacity-100' : 'opacity-0'
            )}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face Detection Overlay */}
          {isCameraOn && (
            <FaceDetectionOverlay
              faceData={faceData}
              warnings={warnings}
              warningCount={warningCount}
              className="absolute inset-0"
            />
          )}

          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-800">
              <Camera className="h-8 w-8 text-zinc-600" />
              <span className="text-xs text-zinc-500">Camera off</span>
            </div>
          )}

          {/* Student label */}
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded-md px-2 py-0.5 z-30">
            <span className="text-[10px] text-zinc-300 font-medium">You</span>
          </div>

          {/* Connection quality dots */}
          <div className="absolute top-1.5 right-1.5 flex gap-0.5 z-30">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1 rounded-full bg-emerald-400" style={{ height: `${4 + i * 3}px` }} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={isSpeaking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
              className={cn(
                'w-2 h-2 rounded-full',
                isSpeaking ? 'bg-blue-400' : isListening ? 'bg-emerald-400' : 'bg-zinc-500'
              )}
            />
            <span className="text-xs text-zinc-300 font-medium">
              {isSpeaking ? 'AI Speaking' : isListening ? 'Your turn' : 'Connected'}
            </span>
          </div>
          <span className="text-xs text-zinc-500">|</span>
          <span className="text-xs text-zinc-400 tabular-nums">{formatDuration(callDuration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-t from-black/80 to-transparent">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMic}
          className={cn(
            'p-3.5 rounded-full transition',
            isMicOn
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-red-500/80 text-white hover:bg-red-500'
          )}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleCamera}
          className={cn(
            'p-3.5 rounded-full transition',
            isCameraOn
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-red-500/80 text-white hover:bg-red-500'
          )}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onEndCall}
          className="p-3.5 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Children slot for additional content */}
      {children}
    </div>
  )
}
