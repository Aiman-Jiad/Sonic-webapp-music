import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Track, Playlist, Artist, ToastMessage } from '@/types';
import { storage } from '@/storage/localStorage';
import { generateId, getPlaylistCoverColor } from '@/utils/helpers';

// ─── Library Context ───────────────────────────────────────────────

interface LibraryContextValue {
  likedTracks: Track[];
  likedTrackIds: Set<string>;
  playlists: Playlist[];
  followedArtists: Artist[];
  followedArtistIds: Set<string>;
  recentlyPlayed: Track[];

  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => boolean;
  removeLiked: (trackId: string) => void;

  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, from: number, to: number) => void;
  getPlaylist: (id: string) => Playlist | undefined;

  isFollowing: (artistId: string) => boolean;
  toggleFollow: (artist: Artist) => boolean;

  refreshRecentlyPlayed: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

export { LibraryContext };
export type { LibraryContextValue };

export function useLibraryState() {
  const [likedTracks, setLikedTracks] = useState<Track[]>(() =>
    storage.getLikedTracks().sort((a, b) => b.likedAt - a.likedAt).map((l) => l.track)
  );
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(
    () => new Set(storage.getLikedTracks().map((l) => l.track.id))
  );
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [followedArtists, setFollowedArtists] = useState<Artist[]>(() =>
    storage.getFollowedArtists().sort((a, b) => b.followedAt - a.followedAt).map((f) => f.artist)
  );
  const [followedArtistIds, setFollowedArtistIds] = useState<Set<string>>(
    () => new Set(storage.getFollowedArtists().map((f) => f.artist.id))
  );
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() =>
    storage.getRecentlyPlayed().sort((a, b) => b.playedAt - a.playedAt).map((r) => r.track)
  );

  const refreshRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed(
      storage.getRecentlyPlayed().sort((a, b) => b.playedAt - a.playedAt).map((r) => r.track)
    );
  }, []);

  const isLiked = useCallback((trackId: string) => likedTrackIds.has(trackId), [likedTrackIds]);

  const toggleLike = useCallback((track: Track): boolean => {
    const liked = storage.getLikedTracks();
    const existing = liked.findIndex((l) => l.track.id === track.id);
    let isNowLiked: boolean;
    if (existing >= 0) {
      liked.splice(existing, 1);
      isNowLiked = false;
    } else {
      liked.unshift({ track, likedAt: Date.now() });
      isNowLiked = true;
    }
    storage.setLikedTracks(liked);
    setLikedTracks(liked.sort((a, b) => b.likedAt - a.likedAt).map((l) => l.track));
    setLikedTrackIds(new Set(liked.map((l) => l.track.id)));
    return isNowLiked;
  }, []);

  const removeLiked = useCallback((trackId: string) => {
    const liked = storage.getLikedTracks().filter((l) => l.track.id !== trackId);
    storage.setLikedTracks(liked);
    setLikedTracks(liked.sort((a, b) => b.likedAt - a.likedAt).map((l) => l.track));
    setLikedTrackIds(new Set(liked.map((l) => l.track.id)));
  }, []);

  const createPlaylist = useCallback((name: string, description = ''): Playlist => {
    const id = generateId();
    const playlist: Playlist = {
      id,
      name,
      description,
      cover: getPlaylistCoverColor(name + id),
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const all = storage.getPlaylists();
    all.unshift(playlist);
    storage.setPlaylists(all);
    setPlaylists(all);
    return playlist;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    const all = storage.getPlaylists().filter((p) => p.id !== id);
    storage.setPlaylists(all);
    setPlaylists(all);
  }, []);

  const renamePlaylist = useCallback((id: string, name: string, description?: string) => {
    const all = storage.getPlaylists();
    const idx = all.findIndex((p) => p.id === id);
    if (idx >= 0) {
      all[idx].name = name;
      if (description !== undefined) all[idx].description = description;
      all[idx].updatedAt = Date.now();
      storage.setPlaylists(all);
      setPlaylists([...all]);
    }
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Track) => {
    const all = storage.getPlaylists();
    const idx = all.findIndex((p) => p.id === playlistId);
    if (idx >= 0 && !all[idx].trackIds.includes(track.id)) {
      all[idx].trackIds.push(track.id);
      all[idx].updatedAt = Date.now();
      storage.setPlaylists(all);
      setPlaylists([...all]);
    }
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    const all = storage.getPlaylists();
    const idx = all.findIndex((p) => p.id === playlistId);
    if (idx >= 0) {
      all[idx].trackIds = all[idx].trackIds.filter((id) => id !== trackId);
      all[idx].updatedAt = Date.now();
      storage.setPlaylists(all);
      setPlaylists([...all]);
    }
  }, []);

  const reorderPlaylistTracks = useCallback((playlistId: string, from: number, to: number) => {
    const all = storage.getPlaylists();
    const idx = all.findIndex((p) => p.id === playlistId);
    if (idx >= 0) {
      const ids = [...all[idx].trackIds];
      const [moved] = ids.splice(from, 1);
      ids.splice(to, 0, moved);
      all[idx].trackIds = ids;
      all[idx].updatedAt = Date.now();
      storage.setPlaylists(all);
      setPlaylists([...all]);
    }
  }, []);

  const getPlaylist = useCallback(
    (id: string) => playlists.find((p) => p.id === id),
    [playlists]
  );

  const isFollowing = useCallback(
    (artistId: string) => followedArtistIds.has(artistId),
    [followedArtistIds]
  );

  const toggleFollow = useCallback((artist: Artist): boolean => {
    const followed = storage.getFollowedArtists();
    const existing = followed.findIndex((f) => f.artist.id === artist.id);
    let isNowFollowing: boolean;
    if (existing >= 0) {
      followed.splice(existing, 1);
      isNowFollowing = false;
    } else {
      followed.unshift({ artist, followedAt: Date.now() });
      isNowFollowing = true;
    }
    storage.setFollowedArtists(followed);
    setFollowedArtists(
      followed.sort((a, b) => b.followedAt - a.followedAt).map((f) => f.artist)
    );
    setFollowedArtistIds(new Set(followed.map((f) => f.artist.id)));
    return isNowFollowing;
  }, []);

  return {
    likedTracks,
    likedTrackIds,
    playlists,
    followedArtists,
    followedArtistIds,
    recentlyPlayed,
    isLiked,
    toggleLike,
    removeLiked,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylistTracks,
    getPlaylist,
    isFollowing,
    toggleFollow,
    refreshRecentlyPlayed,
  };
}

// ─── Toast Context ─────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export { ToastContext };
export type { ToastContextValue };

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'default') => {
      const id = generateId();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  return { toasts, showToast, dismissToast };
}
