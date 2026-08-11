// ┌─────────────────────────────────────────────────────────────────┐
// │  SONIC — Jamendo API Configuration                               │
// │  The client_id is a public value per Jamendo's API requirements. │
// │  It is safe to include in frontend code.                         │
// └─────────────────────────────────────────────────────────────────┘

export const JAMENDO_CONFIG = {
  CLIENT_ID: 'e20a5a4c',
  API_BASE: 'https://api.jamendo.com/v3.0',
  AUDIO_FORMAT: 'mp32' as const,
  IMAGE_WIDTH: 300,
  LARGE_IMAGE_WIDTH: 600,
};

export const STORAGE_KEYS = {
  LIKED_TRACKS: 'sonic.liked',
  PLAYLISTS: 'sonic.playlists',
  FOLLOWED_ARTISTS: 'sonic.followed',
  RECENTLY_PLAYED: 'sonic.recently_played',
  SEARCH_HISTORY: 'sonic.search_history',
  PLAYER_STATE: 'sonic.player_state',
  PREFERENCES: 'sonic.preferences',
} as const;

export const STORAGE_VERSION = 1;

export const GENRES = [
  { name: 'Pop', tags: ['pop'], color: 'from-pink-600 to-rose-500' },
  { name: 'Rock', tags: ['rock'], color: 'from-red-600 to-orange-500' },
  { name: 'Electronic', tags: ['electronic'], color: 'from-cyan-600 to-blue-500' },
  { name: 'Hip-Hop', tags: ['hiphop'], color: 'from-amber-600 to-yellow-500' },
  { name: 'Lo-fi', tags: ['lounge', 'ambient'], color: 'from-teal-600 to-emerald-500' },
  { name: 'Jazz', tags: ['jazz'], color: 'from-indigo-600 to-purple-500' },
  { name: 'Classical', tags: ['classical'], color: 'from-slate-600 to-gray-400' },
  { name: 'Ambient', tags: ['ambient'], color: 'from-violet-600 to-fuchsia-500' },
] as const;

export const TRENDING_SEARCHES = [
  'electronic',
  'rock',
  'ambient',
  'jazz',
  'lo-fi',
  'pop',
  'classical',
  'hip-hop',
];
