'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  onEnd?: () => void
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

export default function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 0.95, pitch = 1.1, volume = 1.0, onEnd } = options

  const [isSpeaking, setIsSpeaking] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const clearSafetyTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) {
        onEndRef.current?.()
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      clearSafetyTimeout()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.lang = 'en-US'

      // Try to pick the best female voice
      try {
        const allVoices = window.speechSynthesis.getVoices()

        const preferredNames = [
          'Google UK English Female',
          'Google US English',
          'Samantha',
          'Microsoft Zira',
          'Microsoft Hazel',
          'Victoria',
          'Karen',
          'Moira',
          'Tessa',
        ]

        let voice: SpeechSynthesisVoice | undefined

        for (const name of preferredNames) {
          voice = allVoices.find((v) => v.name.includes(name))
          if (voice) break
        }

        if (!voice) {
          voice = allVoices.find(
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
          )
        }

        if (!voice) {
          voice = allVoices.find((v) => v.lang.startsWith('en'))
        }

        if (voice) {
          utterance.voice = voice
        }
      } catch {
        // Voice selection failed, use default
      }

      let resolved = false

      const handleEnd = () => {
        if (resolved) return
        resolved = true
        clearSafetyTimeout()
        setIsSpeaking(false)
        onEndRef.current?.()
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = handleEnd

      utterance.onerror = (e) => {
        // 'interrupted' and 'canceled' are normal when we call cancel()
        if (e.error === 'interrupted' || e.error === 'canceled') {
          handleEnd()
          return
        }
        handleEnd()
      }

      // Safety timeout: some browsers never fire onend
      // Estimate ~12 words per second at rate 0.95
      const wordCount = text.split(/\s+/).length
      const estimatedMs = (wordCount / 12) * 1000 + 2000
      timeoutRef.current = setTimeout(handleEnd, Math.max(estimatedMs, 5000))

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)

      // Chrome bug: resume if paused
      setTimeout(() => {
        if (window.speechSynthesis && !window.speechSynthesis.speaking) {
          window.speechSynthesis.resume()
        }
      }, 100)
    },
    [isSupported, rate, pitch, volume, clearSafetyTimeout]
  )

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    clearSafetyTimeout()
    if (isSupported) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [isSupported, clearSafetyTimeout])

  useEffect(() => {
    return () => {
      clearSafetyTimeout()
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported, clearSafetyTimeout])

  return { speak, stop, isSupported }
}
