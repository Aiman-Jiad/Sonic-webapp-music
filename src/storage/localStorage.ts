import { STORAGE_KEYS, STORAGE_VERSION } from '@/config';
import type {
  LikedTrack,
  Playlist,
  FollowedArtist,
  RecentlyPlayedTrack,
  SearchHistoryEntry,
  RepeatMode,
} from '@/types';

type StorageSchema = {
  [STORAGE_KEYS.LIKED_TRACKS]: LikedTrack[];
  [STORAGE_KEYS.PLAYLISTS]: Playlist[];
  [STORAGE_KEYS.FOLLOWED_ARTISTS]: FollowedArtist[];
  [STORAGE_KEYS.RECENTLY_PLAYED]: RecentlyPlayedTrack[];
  [STORAGE_KEYS.SEARCH_HISTORY]: SearchHistoryEntry[];
  [STORAGE_KEYS.PLAYER_STATE]: {
    volume: number;
    muted: boolean;
    isShuffled: boolean;
    repeat: RepeatMode;
  };
  [STORAGE_KEYS.PREFERENCES]: { favoriteGenres: string[] };
};

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or localStorage unavailable — silently fail
  }
}

export const storage = {
  // Liked tracks
  getLikedTracks(): LikedTrack[] {
    return safeParse<LikedTrack[]>(STORAGE_KEYS.LIKED_TRACKS, []);
  },
  setLikedTracks(tracks: LikedTrack[]): void {
    safeSet(STORAGE_KEYS.LIKED_TRACKS, tracks);
  },

  // Playlists
  getPlaylists(): Playlist[] {
    return safeParse<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
  },
  setPlaylists(playlists: Playlist[]): void {
    safeSet(STORAGE_KEYS.PLAYLISTS, playlists);
  },

  // Followed artists
  getFollowedArtists(): FollowedArtist[] {
    return safeParse<FollowedArtist[]>(STORAGE_KEYS.FOLLOWED_ARTISTS, []);
  },
  setFollowedArtists(artists: FollowedArtist[]): void {
    safeSet(STORAGE_KEYS.FOLLOWED_ARTISTS, artists);
  },

  // Recently played
  getRecentlyPlayed(): RecentlyPlayedTrack[] {
    return safeParse<RecentlyPlayedTrack[]>(STORAGE_KEYS.RECENTLY_PLAYED, []);
  },
  setRecentlyPlayed(tracks: RecentlyPlayedTrack[]): void {
    safeSet(STORAGE_KEYS.RECENTLY_PLAYED, tracks);
  },

  // Search history
  getSearchHistory(): SearchHistoryEntry[] {
    return safeParse<SearchHistoryEntry[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  },
  setSearchHistory(history: SearchHistoryEntry[]): void {
    safeSet(STORAGE_KEYS.SEARCH_HISTORY, history);
  },

  // Player state
  getPlayerState(): StorageSchema[typeof STORAGE_KEYS.PLAYER_STATE] {
    return safeParse(STORAGE_KEYS.PLAYER_STATE, {
      volume: 0.7,
      muted: false,
      isShuffled: false,
      repeat: 'off' as RepeatMode,
    });
  },
  setPlayerState(state: StorageSchema[typeof STORAGE_KEYS.PLAYER_STATE]): void {
    safeSet(STORAGE_KEYS.PLAYER_STATE, state);
  },

  // Preferences
  getPreferences(): { favoriteGenres: string[] } {
    return safeParse(STORAGE_KEYS.PREFERENCES, { favoriteGenres: [] as string[] });
  },
  setPreferences(prefs: { favoriteGenres: string[] }): void {
    safeSet(STORAGE_KEYS.PREFERENCES, prefs);
  },

  // Utility
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  },
};

export { STORAGE_VERSION };
