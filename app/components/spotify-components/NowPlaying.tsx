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
}

export default function NowPlaying() {
  const [track, setTrack] = useState<TrackData | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [liveProgress, setLiveProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [hideIdle, setHideIdle] = useState(false)
  const [hasError, setHasError] = useState(false)

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing')

      if (res.status === 418) {
        // Handle the custom status code (418)
        setTrack(null)
        setHasError(false)
        return
      }

      if (res.status === 500 || res.status === 401) {
        // Error with the API
        setTrack(null)
        setHasError(true)
        return
      }

      if (res.status === 200) {
        const data = await res.json()

        // Always update the track and progress
        setTrack(data)
        setHasError(false)

        if (data.item) {
          // Recalculate startTime based on the latest progress_ms
          setStartTime(Date.now() - data.progress_ms)
        }
      }
    } catch (err) {
      console.error('Failed to fetch track', err)
      setHasError(true)
      setTrack(null)
    }
  }, [])

  useEffect(() => {
    fetchTrack()
    intervalRef.current = setInterval(fetchTrack, 7000) // Update every 7 seconds

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
      const timeout = setTimeout(() => setHideIdle(true), 3000) // Hide after 3 seconds of inactivity
      return () => clearTimeout(timeout)
    } else {
      setHideIdle(false)
    }
  }, [track])

  return (
    <AnimatePresence mode="wait">
      {hasError ? (
        <div className="text-white">
          Error loading track. Please check your Spotify connection.
        </div>
      ) : !track || !track.item ? (
        !hideIdle && <TrackIdle />
      ) : !track.is_playing ? (
        <TrackPaused track={{ ...track, item: track.item }} />
      ) : (
        <TrackPlaying track={{ ...track, item: track.item }} liveProgress={liveProgress} />
      )}
    </AnimatePresence>
  )
}
