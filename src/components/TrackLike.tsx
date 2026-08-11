import { useLibrary } from '@/state/library';
import { Heart } from 'lucide-react';
import { useToast } from '@/state/library';

interface TrackLikeProps {
  track: import('@/types').Track;
  size?: 'sm' | 'md';
}

export function TrackLike({ track, size = 'sm' }: TrackLikeProps) {
  const { isLiked, toggleLike } = useLibrary();
  const { showToast } = useToast();
  const liked = isLiked(track.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nowLiked = toggleLike(track);
    showToast(
      nowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs',
      nowLiked ? 'success' : 'default'
    );
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      onClick={handleClick}
      className="rounded-full p-1.5 transition-colors hover:bg-ink-700/50"
      aria-label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
      aria-pressed={liked}
    >
      <Heart
        className={`${iconSize} transition-all ${
          liked ? 'fill-sonic-500 text-sonic-500 scale-110' : 'text-ink-300 hover:text-white'
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
