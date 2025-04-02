'use client'

import { useEffect, useState, useRef } from 'react'
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
  const previousIsPlaying = useRef<boolean | null>(null)
  const [hideIdle, setHideIdle] = useState(false)

  const fetchTrack = async () => {
    try {
      const res = await fetch('/api/spotify/now-playing')

      if (res.status === 204) {
        // No track playing: Set track to null and reset state
        setTrack(null)
        return
      }

      if (res.status === 200) {
        const data = await res.json()
        setTrack(data)

        if (data.item) {
          setStartTime(Date.now() - data.progress_ms)
        }

        // Handle state when song is paused
        if (
          previousIsPlaying.current !== null &&
          previousIsPlaying.current === true &&
          data.is_playing === false
        ) {
          // Song is paused, do not reset
          setTimeout(() => {
            // Trigger fade in for paused state
            setHideIdle(false)
          }, 1000)
        }

        previousIsPlaying.current = data.is_playing

        // Stop polling if no song is playing
        if (!data.is_playing && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        if (data.is_playing && !intervalRef.current) {
          intervalRef.current = setInterval(fetchTrack, 7000)
        }
      }
    } catch (err) {
      console.error('Failed to fetch track', err)
    }
  }

  useEffect(() => {
    fetchTrack()
    intervalRef.current = setInterval(fetchTrack, 7000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

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
    // Auto-fade idle message
    if (!track || !track.item) {
      setHideIdle(false)
      const timeout = setTimeout(() => setHideIdle(true), 3000)
      return () => clearTimeout(timeout)
    } else {
      setHideIdle(false)
    }
  }, [track])

  return (
    <AnimatePresence mode="wait">
      {/* Show idle state when no track is playing */}
      {!track || !track.item ? (
        !hideIdle && <TrackIdle />
      ) : !track.is_playing ? (
        <TrackPaused track={{ ...track, item: track.item }} />
      ) : (
        <TrackPlaying track={{ ...track, item: track.item }} liveProgress={liveProgress} />
      )}
    </AnimatePresence>
  )
}
