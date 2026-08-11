import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface RouterContextValue {
  path: string;
  params: Record<string, string>;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export { RouterContext };
export type { RouterContextValue };

function getHashPath(): string {
  const hash = window.location.hash.slice(1);
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export function useRouterState() {
  const [path, setPath] = useState<string>(getHashPath());

  useEffect(() => {
    const onHashChange = () => {
      setPath(getHashPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((newPath: string) => {
    const normalized = newPath.startsWith('/') ? newPath : `/${newPath}`;
    if (getHashPath() === normalized) {
      window.scrollTo(0, 0);
      return;
    }
    window.location.hash = normalized;
  }, []);

  // Parse params from path
  const params: Record<string, string> = {};
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'artist' && parts[1]) params.artistId = parts[1];
  if (parts[0] === 'playlist' && parts[1]) params.playlistId = parts[1];
  if (parts[0] === 'album' && parts[1]) params.albumId = parts[1];
  if (parts[0] === 'create' && parts[1]) params.playlistId = parts[1];

  return { path, params, navigate };
}

export function parseRoute(path: string): { name: string; params: Record<string, string> } {
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};
  let name = 'home';

  if (parts.length === 0) {
    name = 'home';
  } else if (parts[0] === 'search') {
    name = 'search';
    if (parts[1]) params.query = decodeURIComponent(parts[1]);
  } else if (parts[0] === 'library') {
    name = 'library';
  } else if (parts[0] === 'create') {
    name = 'create';
    if (parts[1]) params.playlistId = parts[1];
  } else if (parts[0] === 'liked') {
    name = 'liked';
  } else if (parts[0] === 'artist' && parts[1]) {
    name = 'artist';
    params.artistId = parts[1];
  } else if (parts[0] === 'playlist' && parts[1]) {
    name = 'playlist';
    params.playlistId = parts[1];
  } else if (parts[0] === 'album' && parts[1]) {
    name = 'album';
    params.albumId = parts[1];
  }

  return { name, params };
}
