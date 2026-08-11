import { Link } from '@/components/Link';
import { useLibrary } from '@/state/library';
import { useRouter } from '@/state/router';
import { Heart, Plus, Home, Search, Library } from 'lucide-react';
import { getInitials, getFallbackImage } from '@/utils/helpers';

export function Sidebar() {
  const { navigate, path } = useRouter();
  const { playlists, likedTracks, followedArtists } = useLibrary();

  const navItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Search', icon: Search, route: '/search' },
    { label: 'Your Library', icon: Library, route: '/library' },
  ];

  const isActive = (route: string) => {
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  return (
    <nav className="flex h-full flex-col gap-2 p-2" aria-label="Main navigation">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4">
        <SonicLogo className="h-7 w-7 text-sonic-500" />
        <span className="text-xl font-extrabold tracking-tight text-white">SONIC</span>
      </div>

      {/* Primary nav */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);
          return (
            <Link
              key={item.route}
              to={item.route}
              className={`group flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-ink-800 text-white'
                  : 'text-ink-300 hover:text-white hover:bg-ink-800/50'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? 'text-sonic-500' : 'text-ink-300 group-hover:text-white'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Library section */}
      <div className="mt-4 flex flex-col gap-1">
        <Link
          to="/create"
          className="group flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-semibold text-ink-300 transition-all hover:text-white hover:bg-ink-800/50"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-ink-700 text-ink-200 transition-colors group-hover:bg-white group-hover:text-ink-950">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </span>
          Create Playlist
        </Link>
        <Link
          to="/liked"
          className={`group flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
            path === '/liked'
              ? 'bg-ink-800 text-white'
              : 'text-ink-300 hover:text-white hover:bg-ink-800/50'
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-sonic-500 to-sonic-700 text-white">
            <Heart className="h-3.5 w-3.5 fill-white" strokeWidth={0} />
          </span>
          Liked Songs
          {likedTracks.length > 0 && (
            <span className="ml-auto text-xs text-ink-400">{likedTracks.length}</span>
          )}
        </Link>
      </div>

      {/* Playlists */}
      <div className="mt-2 flex-1 overflow-y-auto no-scrollbar">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
          Playlists
        </div>
        {playlists.length === 0 && followedArtists.length === 0 ? (
          <div className="px-3 py-2 text-sm text-ink-400">
            <p className="mb-3">Create your first playlist to get started.</p>
            <button
              onClick={() => navigate('/create')}
              className="text-xs font-bold uppercase tracking-wider text-sonic-500 hover:text-sonic-400"
            >
              Browse playlists
            </button>
          </div>
        ) : (
          <>
            {playlists.map((pl) => (
              <Link
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all ${
                  path === `/playlist/${pl.id}`
                    ? 'bg-ink-800'
                    : 'hover:bg-ink-800/50'
                }`}
              >
                <div
                  className={`h-9 w-9 shrink-0 rounded bg-gradient-to-br ${pl.cover} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {getInitials(pl.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink-100">{pl.name}</div>
                  <div className="truncate text-xs text-ink-400">
                    Playlist · {pl.trackIds.length} songs
                  </div>
                </div>
              </Link>
            ))}

            {followedArtists.length > 0 && (
              <>
                <div className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Following
                </div>
                {followedArtists.slice(0, 10).map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.id}`}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all ${
                      path === `/artist/${artist.id}` ? 'bg-ink-800' : 'hover:bg-ink-800/50'
                    }`}
                  >
                    <img
                      src={artist.image || getFallbackImage(artist.name)}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(artist.name); }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-100">{artist.name}</div>
                      <div className="truncate text-xs text-ink-400">Artist</div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

function SonicLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12c0-1 4-7 9-7s9 6 9 7-4 7-9 7-9-6-9-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path
        d="M12 9v-5m0 11v5M9 12H4m11 0h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
