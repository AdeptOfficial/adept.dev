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
      const res = await fetch('/api/spotify/now-playing', {
        cache: 'no-store',         // ⛔ prevent caching
        next: { revalidate: 0 },   // optional: signal Next.js not to revalidate
      });

      if (!res.ok) {
        setTrack(null)
        setHasError(true)
        return
      }

      const data = await res.json()
      setTrack(data)
      setHasError(false)

      if (data.item && data.progress_ms !== undefined) {
        setStartTime(Date.now() - data.progress_ms)
      } else {
        setStartTime(null)
      }
    } catch (err) {
      console.error('Failed to fetch track', err)
      setHasError(true)
      setTrack(null)
    }
  }, [])

  useEffect(() => {
    fetchTrack()
    intervalRef.current = setInterval(fetchTrack, 7000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
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
