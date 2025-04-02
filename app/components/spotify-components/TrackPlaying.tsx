import { motion } from 'framer-motion';

type TrackPlayingProps = {
  track: {
    item: {
      id: string;
      name: string;
      artists: { name: string }[];
      duration_ms: number;
      album: { images: { url: string }[] };
      external_urls: { spotify: string };
    };
  };
  liveProgress: number;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TrackPlaying({ track, liveProgress }: TrackPlayingProps) {
  return (
    <motion.a
      key={track.item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      href={track.item.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-3 p-4 border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-300 bg-gray-900/30 backdrop-blur-md w-full max-w-md"
    >
      <div className="flex items-center gap-4">
        <img
          src={track.item.album.images[0].url}
          alt="Album Cover"
          className="w-16 h-16 rounded-md shadow-md"
        />
        <div className="flex flex-col">
          <p className="text-sm text-green-400 font-semibold">Vibing to:</p>
          <p className="text-white font-bold truncate max-w-[200px]">{track.item.name}</p>
          <p className="text-gray-400 text-sm">
            {track.item.artists.map((artist: { name: string }) => artist.name).join(', ')}
          </p>
        </div>
      </div>

      <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-green-400 transition-all duration-500 ease-out"
          style={{
            width: `${(liveProgress / track.item.duration_ms) * 100}%`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>{formatTime(liveProgress)}</span>
        <span>{formatTime(track.item.duration_ms)}</span>
      </div>
    </motion.a>
  );
}