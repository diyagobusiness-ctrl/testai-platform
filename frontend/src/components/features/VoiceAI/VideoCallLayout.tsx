'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import AIAvatar from './AIAvatar'
import {
  Video, VideoOff, Camera, Mic, MicOff,
  Phone, PhoneOff, Maximize2, Minimize2,
  Monitor, MessageSquare,
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
  const streamRef = useRef<MediaStream | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    } catch {
      // Camera not available
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
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
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-800">
              <Camera className="h-8 w-8 text-zinc-600" />
              <span className="text-xs text-zinc-500">Camera off</span>
            </div>
          )}

          {/* Student label */}
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded-md px-2 py-0.5">
            <span className="text-[10px] text-zinc-300 font-medium">You</span>
          </div>

          {/* Connection quality dots */}
          <div className="absolute top-1.5 right-1.5 flex gap-0.5">
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

      {/* Children slot for additional content (sidebar, etc.) */}
      {children}
    </div>
  )
}
