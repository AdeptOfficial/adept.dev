import { motion } from 'framer-motion'
import type { TrackData } from './NowPlaying' // update path as needed

type TrackPausedProps = {
  track: NonNullable<TrackData> & { item: NonNullable<TrackData['item']> }
}

export default function TrackPaused({ track }: TrackPausedProps) {
  return (
    <motion.div
      key="paused"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 p-4 border border-gray-800 rounded-lg shadow-md bg-gray-900/30 backdrop-blur-md w-full max-w-md"
    >
      <div className="flex items-center gap-4">
        <img
          src={track.item.album.images[0].url}
          alt="Album Cover"
          className="w-16 h-16 rounded-md shadow-md opacity-70"
        />
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
            className="text-yellow-400 text-sm font-semibold"
          >
            ⏸ Paused
          </motion.div>
          <p className="text-white font-bold truncate max-w-[200px]">
            {track.item.name}
          </p>
          <p className="text-gray-400 text-sm">
            {track.item.artists.map((artist) => artist.name).join(', ')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
