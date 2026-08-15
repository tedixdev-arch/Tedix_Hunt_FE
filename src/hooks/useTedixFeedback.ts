import { useEffect, useRef } from 'react'

export function useTedixFeedback() {
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => () => {
    void contextRef.current?.close()
  }, [])

  const tone = (frequency: number, start: number, duration: number, gain: number) => {
    const AudioContextClass = window.AudioContext
    const context = contextRef.current ?? new AudioContextClass()
    contextRef.current = context
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    volume.gain.setValueAtTime(0, start)
    volume.gain.linearRampToValueAtTime(gain, start + 0.015)
    volume.gain.exponentialRampToValueAtTime(0.001, start + duration)
    oscillator.connect(volume)
    volume.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration)
  }

  const playCorrect = (assisted: boolean) => {
    const context = contextRef.current ?? new window.AudioContext()
    contextRef.current = context
    void context.resume()
    const now = context.currentTime
    if (assisted) {
      tone(880, now, 0.14, 0.075)
      tone(1100, now + 0.1, 0.18, 0.065)
      return
    }
    ;[523, 659, 784].forEach((frequency, index) => tone(frequency, now + index * 0.1, 0.25, 0.12))
  }

  return { playCorrect }
}
