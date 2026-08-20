'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  isFinal: boolean
}

interface UseVoiceRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onEnd?: () => void
  onError?: (error: string) => void
}

interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  segments: TranscriptSegment[]
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
}

export default function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onEnd,
    onError,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const startTimeRef = useRef<number>(0)
  const finalTranscriptRef = useRef('')

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const createRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      startTimeRef.current = Date.now()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          final += text
          const segment: TranscriptSegment = {
            id: `seg-${Date.now()}-${i}`,
            text: text.trim(),
            timestamp: Math.floor((Date.now() - startTimeRef.current) / 1000),
            isFinal: true,
          }
          setSegments((prev) => [...prev, segment])
          onResult?.(text.trim(), true)
        } else {
          interim += text
          onResult?.(text, false)
        }
      }

      if (final) {
        finalTranscriptRef.current += final
        setTranscript(finalTranscriptRef.current)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage =
        event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : event.error === 'audio-capture'
            ? 'Microphone not available.'
            : event.error === 'not-allowed'
              ? 'Microphone access denied.'
              : `Speech recognition error: ${event.error}`

      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      onEnd?.()
    }

    return recognition
  }, [continuous, interimResults, language, isSupported, onResult, onEnd, onError])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    finalTranscriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError(null)

    const recognition = createRecognition()
    if (!recognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setError('Failed to start speech recognition')
    }
  }, [createRecognition])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setSegments([])
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    segments,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  }
}
