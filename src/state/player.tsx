import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track, RepeatMode } from '@/types';
import { storage } from '@/storage/localStorage';
import { shuffleArray } from '@/utils/helpers';

interface PlayerContextValue {
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  isShuffled: boolean;
  shuffleOrder: number[];
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;

  playTrack: (track: Track, queue?: Track[], index?: number) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  addNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
}

import { createContext, useContext } from 'react';

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export { PlayerContext };
export type { PlayerContextValue };

export function usePlayerState() {
  const savedState = storage.getPlayerState();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(savedState.isShuffled);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [repeat, setRepeat] = useState<RepeatMode>(savedState.repeat);
  const [volume, setVolumeState] = useState(savedState.volume);
  const [muted, setMuted] = useState(savedState.muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isQueueOpen, setQueueOpen] = useState(false);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Persist player prefs
  useEffect(() => {
    storage.setPlayerState({ volume, muted, isShuffled, repeat });
  }, [volume, muted, isShuffled, repeat]);

  const recordRecentlyPlayed = useCallback((track: Track) => {
    const recent = storage.getRecentlyPlayed();
    const existingIdx = recent.findIndex(
      (r) => r.track.id === track.id
    );
    if (existingIdx >= 0) {
      recent[existingIdx].playCount += 1;
      recent[existingIdx].playedAt = Date.now();
    } else {
      recent.unshift({ track, playedAt: Date.now(), playCount: 1 });
    }
    storage.setRecentlyPlayed(recent.slice(0, 50));
  }, []);

  const loadTrack = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio || !track.audio) {
        setError('This track is unavailable');
        return;
      }
      setIsLoading(true);
      setError(null);
      audio.src = track.audio;
      audio.load();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          recordRecentlyPlayed(track);
        })
        .catch((err) => {
          setIsLoading(false);
          if (err.name === 'AbortError') return;
          setError('Unable to play this track');
          setIsPlaying(false);
        });
    },
    [recordRecentlyPlayed]
  );

  // Load track when currentIndex/queue changes
  useEffect(() => {
    if (currentTrack && currentIndex >= 0) {
      loadTrack(currentTrack);
    }
  }, [currentIndex, queue, currentTrack, loadTrack]);

  const playTrack = useCallback(
    (track: Track, newQueue?: Track[], index?: number) => {
      const q = newQueue ?? [track];
      const idx = index ?? q.findIndex((t) => t.id === track.id);
      const safeIdx = idx >= 0 ? idx : 0;
      setQueue(q);
      setCurrentIndex(safeIdx);
      if (isShuffled) {
        setShuffleOrder(shuffleArray(q.map((_, i) => i)));
      }
    },
    [isShuffled]
  );

  const playQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setCurrentIndex(startIndex);
      if (isShuffled) {
        setShuffleOrder(shuffleArray(tracks.map((_, i) => i)));
      }
    },
    [isShuffled]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Unable to resume playback'));
    }
  }, [currentTrack, isPlaying]);

  const getNextIndex = useCallback(() => {
    if (!queue.length) return -1;
    if (isShuffled && shuffleOrder.length) {
      const currentPos = shuffleOrder.indexOf(currentIndex);
      if (currentPos < shuffleOrder.length - 1) {
        return shuffleOrder[currentPos + 1];
      }
      if (repeat === 'all') {
        return shuffleOrder[0];
      }
      return -1;
    }
    if (currentIndex < queue.length - 1) {
      return currentIndex + 1;
    }
    if (repeat === 'all') {
      return 0;
    }
    return -1;
  }, [queue, currentIndex, isShuffled, shuffleOrder, repeat]);

  const getPrevIndex = useCallback(() => {
    if (!queue.length) return -1;
    if (isShuffled && shuffleOrder.length) {
      const currentPos = shuffleOrder.indexOf(currentIndex);
      if (currentPos > 0) {
        return shuffleOrder[currentPos - 1];
      }
      return currentIndex; // stay at first in shuffle
    }
    if (currentIndex > 0) {
      return currentIndex - 1;
    }
    // If we're at the first track and it's been playing for >3s, restart it
    return currentIndex;
  }, [queue, currentIndex, isShuffled, shuffleOrder]);

  const next = useCallback(() => {
    const idx = getNextIndex();
    if (idx >= 0) {
      setCurrentIndex(idx);
    } else {
      // End of queue — stop
      setIsPlaying(false);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [getNextIndex]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const idx = getPrevIndex();
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
    } else if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  }, [getPrevIndex, currentIndex]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (vol > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const newShuffled = !prev;
      if (newShuffled && queue.length) {
        setShuffleOrder(shuffleArray(queue.map((_, i) => i)));
      } else {
        setShuffleOrder([]);
      }
      return newShuffled;
    });
  }, [queue]);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  const addNext = useCallback((track: Track) => {
    setQueue((q) => {
      const newQ = [...q];
      newQ.splice(currentIndex + 1, 0, track);
      return newQ;
    });
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((q) => {
      const newQ = [...q];
      newQ.splice(index, 1);
      if (index < currentIndex) {
        setCurrentIndex((ci) => ci - 1);
      } else if (index === currentIndex) {
        // The current track was removed — load the next one at same index
        if (newQ.length === 0) {
          setCurrentIndex(-1);
          setIsPlaying(false);
        } else if (index >= newQ.length) {
          setCurrentIndex(0);
        }
        // else keep same index (next track shifts into it)
      }
      return newQ;
    });
  }, [currentIndex]);

  const reorderQueue = useCallback(
    (from: number, to: number) => {
      setQueue((q) => {
        const newQ = [...q];
        const [moved] = newQ.splice(from, 1);
        newQ.splice(to, 0, moved);
        return newQ;
      });
      // Adjust currentIndex
      if (from === currentIndex) {
        setCurrentIndex(to);
      } else if (from < currentIndex && to >= currentIndex) {
        setCurrentIndex((ci) => ci - 1);
      } else if (from > currentIndex && to <= currentIndex) {
        setCurrentIndex((ci) => ci + 1);
      }
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
    }
  }, []);

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setError('Unable to play this track');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const onEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const idx = getNextIndex();
      if (idx >= 0) {
        setCurrentIndex(idx);
      } else {
        setIsPlaying(false);
        if (repeat === 'all' && queue.length > 0) {
          setCurrentIndex(0);
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeat, getNextIndex, queue, next]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  return {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    isShuffled,
    shuffleOrder,
    repeat,
    volume,
    muted,
    currentTime,
    duration,
    isLoading,
    error,
    audioRef,
    isFullPlayerOpen,
    isQueueOpen,
    playTrack,
    playQueue,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    addNext,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    setFullPlayerOpen,
    setQueueOpen,
  };
}
