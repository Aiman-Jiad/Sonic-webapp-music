import { useEffect, useCallback } from 'react';
import {
  PlayerContext,
  usePlayerState,
  type PlayerContextValue,
} from '@/state/player';
import {
  LibraryContext,
  ToastContext,
  useLibraryState,
  useToastState,
  type LibraryContextValue,
  type ToastContextValue,
} from '@/state/library';
import { RouterContext, useRouterState, parseRoute } from '@/state/router';
import { ContextMenuProvider } from '@/components/ContextMenu';
import { Sidebar } from '@/components/Sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MiniPlayer } from '@/components/MiniPlayer';
import { FullPlayer } from '@/components/FullPlayer';
import { ToastContainer } from '@/components/Toast';
import { HomePage } from '@/pages/Home';
import { SearchPage } from '@/pages/Search';
import { LibraryPage } from '@/pages/Library';
import { CreatePlaylistPage } from '@/pages/CreatePlaylist';
import { ArtistPage } from '@/pages/Artist';
import { PlaylistPage } from '@/pages/Playlist';
import { LikedSongsPage } from '@/pages/LikedSongs';
import { AlbumPage } from '@/pages/Album';

function AppContent() {
  const { path, navigate } = useRouterState();
  const route = parseRoute(path);
  const player = usePlayerState();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't interfere with text inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        player.togglePlay();
      } else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        player.next();
      } else if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        player.previous();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        player.toggleMute();
      } else if (e.key === '/') {
        e.preventDefault();
        navigate('/search');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        player.toggleShuffle();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        player.cycleRepeat();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [player, navigate]);

  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'library':
        return <LibraryPage />;
      case 'create':
        return <CreatePlaylistPage editPlaylistId={route.params.playlistId} />;
      case 'artist':
        return <ArtistPage artistId={route.params.artistId} />;
      case 'playlist':
        return <PlaylistPage playlistId={route.params.playlistId} />;
      case 'album':
        return <AlbumPage albumId={route.params.albumId} />;
      case 'liked':
        return <LikedSongsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-950 text-ink-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-800 bg-ink-900 lg:block xl:w-72">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6">
          {/* Top gradient backdrop — changes per page for visual richness */}
          <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-ink-800/30 to-transparent" />
          <div className="relative">{renderPage()}</div>
        </main>

        {/* Mini player — persistent */}
        <MiniPlayer />

        {/* Mobile bottom navigation */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>

      {/* Full-screen player overlay */}
      <FullPlayer />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const playerState = usePlayerState();
  const libraryState = useLibraryState();
  const toastState = useToastState();
  const routerState = useRouterState();

  const playerValue: PlayerContextValue = playerState;
  const libraryValue: LibraryContextValue = libraryState;
  const toastValue: ToastContextValue = toastState;

  return (
    <RouterContext.Provider value={routerState}>
      <PlayerContext.Provider value={playerValue}>
        <LibraryContext.Provider value={libraryValue}>
          <ToastContext.Provider value={toastValue}>
            <ContextMenuProvider>
              {/* Hidden audio element — controlled by player state */}
              <audio ref={playerState.audioRef} preload="auto" />
              <AppContent />
            </ContextMenuProvider>
          </ToastContext.Provider>
        </LibraryContext.Provider>
      </PlayerContext.Provider>
    </RouterContext.Provider>
  );
}
