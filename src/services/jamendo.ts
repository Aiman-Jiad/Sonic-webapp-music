import { JAMENDO_CONFIG } from '@/config';
import type { Track, Artist, Album } from '@/types';
import { getFallbackImage } from '@/utils/helpers';

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

interface JamendoResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_count: number;
    full_result_count?: number;
    next?: string;
  };
  results: T[];
}

async function jamendoFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<JamendoResponse<T>> {
  const url = new URL(`${JAMENDO_CONFIG.API_BASE}/${endpoint}/`);
  url.searchParams.set('client_id', JAMENDO_CONFIG.CLIENT_ID);
  url.searchParams.set('format', 'json');
  url.searchParams.set('audioformat', JAMENDO_CONFIG.AUDIO_FORMAT);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const cacheKey = url.toString();
  const cached = getCached<JamendoResponse<T>>(cacheKey);
  if (cached) return cached;

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  const data = (await response.json()) as JamendoResponse<T>;

  if (data.headers.status === 'failed') {
    throw new Error(data.headers.error_message || 'API request failed');
  }

  setCached(cacheKey, data);
  return data;
}

function normalizeTrack(raw: Record<string, unknown>): Track {
  const id = String(raw.id ?? '');
  const name = String(raw.name ?? 'Unknown Track');
  const artistName = String(raw.artist_name ?? 'Unknown Artist');
  const albumName = String(raw.album_name ?? 'Unknown Album');
  const albumImage =
    String(raw.album_image ?? '') ||
    String(raw.image ?? '') ||
    getFallbackImage(`${name}-${artistName}`);
  const audio = String(raw.audio ?? '');

  return {
    id,
    name,
    duration: Number(raw.duration) || 0,
    artist_id: String(raw.artist_id ?? ''),
    artist_name: artistName,
    artist_idstr: String(raw.artist_idstr ?? ''),
    album_name: albumName,
    album_id: String(raw.album_id ?? ''),
    album_image: albumImage,
    audio,
    image: albumImage,
    shareurl: String(raw.shareurl ?? ''),
    shorturl: String(raw.shorturl ?? ''),
    position: Number(raw.position) || 0,
    releasedate: String(raw.releasedate ?? ''),
    musicinfo: raw.musicinfo as Track['musicinfo'],
  };
}

function normalizeArtist(raw: Record<string, unknown>): Artist {
  const id = String(raw.id ?? '');
  const name = String(raw.name ?? 'Unknown Artist');
  return {
    id,
    name,
    website: String(raw.website ?? ''),
    joindate: String(raw.joindate ?? ''),
    image:
      String(raw.image ?? '') ||
      getFallbackImage(name),
    shareurl: String(raw.shareurl ?? ''),
    shorturl: String(raw.shorturl ?? ''),
  };
}

function normalizeAlbum(raw: Record<string, unknown>): Album {
  const id = String(raw.id ?? '');
  const name = String(raw.name ?? 'Unknown Album');
  const artistName = String(raw.artist_name ?? 'Unknown Artist');
  return {
    id,
    name,
    releasedate: String(raw.releasedate ?? ''),
    artist_id: String(raw.artist_id ?? ''),
    artist_name: artistName,
    image:
      String(raw.image ?? '') ||
      getFallbackImage(`${name}-${artistName}`),
    shareurl: String(raw.shareurl ?? ''),
    shorturl: String(raw.shorturl ?? ''),
  };
}

export const jamendo = {
  async getPopularTracks(limit = 10): Promise<Track[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        limit: String(limit),
        order: 'popularity_total',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  async getTracksByTag(tags: string[], limit = 10): Promise<Track[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        limit: String(limit),
        fuzzytags: tags.join('+'),
        order: 'popularity_total',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  async getTracksByArtist(artistId: string, limit = 10): Promise<Track[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        limit: String(limit),
        artist_id: artistId,
        order: 'popularity_total',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  async getArtist(artistId: string): Promise<Artist | null> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('artists', {
        id: artistId,
        imagesize: String(JAMENDO_CONFIG.LARGE_IMAGE_WIDTH),
      });
      if (!data.results.length) return null;
      return normalizeArtist(data.results[0]);
    } catch {
      return null;
    }
  },

  async getArtistAlbums(artistId: string, limit = 20): Promise<Album[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('albums', {
        artist_id: artistId,
        limit: String(limit),
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeAlbum);
    } catch {
      return [];
    }
  },

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        album_id: albumId,
        order: 'position',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  async getAlbum(albumId: string): Promise<Album | null> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('albums', {
        id: albumId,
        imagesize: String(JAMENDO_CONFIG.LARGE_IMAGE_WIDTH),
      });
      if (!data.results.length) return null;
      return normalizeAlbum(data.results[0]);
    } catch {
      return null;
    }
  },

  async searchTracks(query: string, limit = 20): Promise<Track[]> {
    if (!query.trim()) return [];
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        namesearch: query.trim(),
        limit: String(limit),
        order: 'popularity_total',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  async searchArtists(query: string, limit = 10): Promise<Artist[]> {
    if (!query.trim()) return [];
    try {
      const data = await jamendoFetch<Record<string, unknown>>('artists', {
        namesearch: query.trim(),
        limit: String(limit),
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeArtist);
    } catch {
      return [];
    }
  },

  async searchAlbums(query: string, limit = 10): Promise<Album[]> {
    if (!query.trim()) return [];
    try {
      const data = await jamendoFetch<Record<string, unknown>>('albums', {
        namesearch: query.trim(),
        limit: String(limit),
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeAlbum);
    } catch {
      return [];
    }
  },

  async getPopularArtists(limit = 10): Promise<Artist[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('artists', {
        limit: String(limit),
        order: 'popularity_total',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeArtist);
    } catch {
      return [];
    }
  },

  async getTracksByIds(ids: string[]): Promise<Track[]> {
    const valid = ids.filter(Boolean);
    if (!valid.length) return [];
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        id: valid.join('+'),
        limit: String(valid.length),
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      const tracks = data.results.map(normalizeTrack).filter((t) => t.audio);
      // Sort to match the requested order
      const map = new Map(tracks.map((t) => [t.id, t]));
      return valid.map((id) => map.get(id)).filter((t): t is Track => !!t);
    } catch {
      return [];
    }
  },

  async getRecentTracks(limit = 10): Promise<Track[]> {
    try {
      const data = await jamendoFetch<Record<string, unknown>>('tracks', {
        limit: String(limit),
        order: 'releasedate_desc',
        include: 'musicinfo',
        imagesize: String(JAMENDO_CONFIG.IMAGE_WIDTH),
      });
      return data.results.map(normalizeTrack).filter((t) => t.audio);
    } catch {
      return [];
    }
  },

  clearCache(): void {
    cache.clear();
  },
};
