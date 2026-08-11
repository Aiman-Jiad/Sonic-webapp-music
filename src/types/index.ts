export interface Track {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  artist_idstr?: string;
  album_name: string;
  album_id: string;
  album_image: string;
  audio: string;
  image: string;
  shareurl?: string;
  shorturl?: string;
  position?: number;
  releasedate?: string;
  musicinfo?: {
    vocalinstrumental?: string;
    gender?: string;
    speed?: string;
    tags?: {
      genres?: string[];
      instruments?: string[];
      vartags?: string[];
    };
  };
}

export interface Artist {
  id: string;
  name: string;
  website?: string;
  joindate?: string;
  image: string;
  shareurl?: string;
  shorturl?: string;
}

export interface Album {
  id: string;
  name: string;
  releasedate: string;
  artist_id: string;
  artist_name: string;
  image: string;
  shareurl?: string;
  shorturl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface LikedTrack {
  track: Track;
  likedAt: number;
}

export interface FollowedArtist {
  artist: Artist;
  followedAt: number;
}

export interface RecentlyPlayedTrack {
  track: Track;
  playedAt: number;
  playCount: number;
}

export interface SearchHistoryEntry {
  query: string;
  searchedAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  queue: Track[];
  currentIndex: number;
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
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'default' | 'success' | 'error';
}

export interface Genre {
  name: string;
  tags: string[];
  color: string;
}
