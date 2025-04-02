import { motion } from 'framer-motion';

export default function TrackIdle() {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="flex items-center space-x-3 text-sm text-gray-500"
    >
      <div className="flex items-center gap-4 p-4 border border-gray-800 rounded-lg shadow-md bg-gray-900/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="animate-pulse">Not vibing to any music at the moment.</span>
        </div>
      </div>
    </motion.div>
  );
}