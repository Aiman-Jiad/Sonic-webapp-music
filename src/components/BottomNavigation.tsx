import { useRouter } from '@/state/router';
import { Home, Search, Library } from 'lucide-react';

export function BottomNavigation() {
  const { navigate, path } = useRouter();

  const items = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Search', icon: Search, route: '/search' },
    { label: 'Library', icon: Library, route: '/library' },
  ];

  const isActive = (route: string) => {
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  return (
    <nav
      className="glass flex items-center justify-around border-t border-ink-700/50 px-2 pb-[env(safe-area-inset-bottom)] pt-2"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.route);
        return (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className="flex flex-1 flex-col items-center gap-1 py-1.5 transition-colors"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={`h-5.5 w-5.5 transition-all ${active ? 'text-sonic-500' : 'text-ink-300'}`}
              strokeWidth={active ? 2.5 : 2}
              style={{ width: '22px', height: '22px' }}
            />
            <span
              className={`text-[10px] font-semibold transition-colors ${
                active ? 'text-sonic-500' : 'text-ink-300'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
