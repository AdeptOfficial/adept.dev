'use client'

import { motion } from 'framer-motion'

export default function TrackIdle() {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex items-center justify-center w-full max-w-md"
    >
      <div className="flex items-center gap-4 p-4 border border-gray-800 rounded-lg shadow-md bg-gray-900/30 backdrop-blur-md w-full">
        <motion.div
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-3xl"
        >
          🎵
        </motion.div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 animate-pulse">
            Not vibing to any music at the moment.
          </span>
        </div>
      </div>
    </motion.div>
  )
}
