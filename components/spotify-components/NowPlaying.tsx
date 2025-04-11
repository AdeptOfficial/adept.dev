'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import TrackIdle from './TrackIdle'
import TrackPaused from './TrackPaused'
import TrackPlaying from './TrackPlaying'

export type TrackData = {
  is_playing: boolean
  progress_ms: number
  item: {
    id: string
    name: string
    artists: { name: string }[]
    duration_ms: number
    album: { images: { url: string }[] }
    external_urls: { spotify: string }
  } | null
  timestamp?: number
}

export default function NowPlaying() {
  const [track, setTrack] = useState<TrackData | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [liveProgress, setLiveProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [hideIdle, setHideIdle] = useState(false)
  const [idleDismissed, setIdleDismissed] = useState(false)
  const [hasError, setHasError] = useState(false)

  const fetchTrack = useCallback(async () => {
    try {
      console.log('[NowPlaying] Fetching track…')
      const res = await fetch('/api/spotify/now-playing', {
        cache: 'no-store',
        next: { revalidate: 0 },
      })

      console.log('[NowPlaying] Response status:', res.status)

      if (!res.ok) {
        console.warn('[NowPlaying] Response not OK, setting error state.')
        setTrack(null)
        setHasError(true)
        return
      }

      const data = await res.json()
      console.log('[NowPlaying] Response data:', data)

      setTrack(data)
      setHasError(false)

      if (data.item && data.progress_ms !== undefined) {
        setStartTime(Date.now() - data.progress_ms)
      } else {
        setStartTime(null)
      }
    } catch (err) {
      console.error('[NowPlaying] Failed to fetch track:', err)
      setHasError(true)
      setTrack(null)
    }
  }, [])

  useEffect(() => {
    const startPolling = () => {
      fetchTrack()
      intervalRef.current = setInterval(fetchTrack, 7000)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[NowPlaying] Page visible — resuming polling')
        startPolling()
      } else {
        console.log('[NowPlaying] Page hidden — pausing polling')
        stopPolling()
      }
    }

    // Start immediately if tab is visible
    if (document.visibilityState === 'visible') {
      startPolling()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchTrack])

  useEffect(() => {
    if (!track || !track.item || !track.is_playing || startTime === null) return

    let animationFrame: number

    const tick = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const capped = Math.min(elapsed, track.item?.duration_ms ?? 0)
      setLiveProgress(capped)
      animationFrame = requestAnimationFrame(tick)
    }

    tick()

    return () => cancelAnimationFrame(animationFrame)
  }, [track, startTime])

  useEffect(() => {
    if (!track || !track.item) {
      setHideIdle(false)
      const timeout = setTimeout(() => {
        setHideIdle(true)
        setIdleDismissed(true)
      }, 3000)
      return () => clearTimeout(timeout)
    } else {
      setHideIdle(false)
      setIdleDismissed(false)
    }
  }, [track])

  return (
    <AnimatePresence mode="wait">
      {hasError ? (
        <div className="text-white">
          Error loading track. Please check your Spotify connection.
        </div>
      ) : !track?.item && !idleDismissed ? (
        <TrackIdle />
      ) : !track?.item && idleDismissed ? null
      : !track?.is_playing ? (
        <TrackPaused track={track!} />
      ) : (
        <TrackPlaying track={track!} liveProgress={liveProgress} />
      )}
    </AnimatePresence>
  )
}
