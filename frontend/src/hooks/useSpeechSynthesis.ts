'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
  onEnd?: () => void
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
}

export default function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 0.92, pitch = 1.0, volume = 1.0, onEnd } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      // Prioritize Alexa-style female voices
      const femaleVoicePriority = [
        'Google UK English Female',
        'Google US English',
        'Samantha',
        'Victoria',
        'Karen',
        'Moira',
        'Tessa',
        'Google Deutsch',
        'Microsoft Zira',
        'Microsoft Hazel',
      ]

      let selectedVoice: SpeechSynthesisVoice | undefined

      // Try to find a preferred female voice
      for (const preferred of femaleVoicePriority) {
        selectedVoice = voices.find((v) => v.name.includes(preferred))
        if (selectedVoice) break
      }

      // Fallback: find any English female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('zira'))
        )
      }

      // Last resort: any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith('en'))
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      // Slightly higher pitch for feminine tone
      utterance.pitch = pitch > 1.0 ? pitch : 1.1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        onEnd?.()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        onEnd?.()
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, voices, rate, pitch, volume, onEnd]
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported, voices }
}
