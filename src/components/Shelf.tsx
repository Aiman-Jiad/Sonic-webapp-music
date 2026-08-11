import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShelfProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

export function Shelf({ title, children, onSeeAll }: ShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="group/shelf">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs font-semibold uppercase tracking-wider text-ink-400 hover:text-white"
            >
              See all
            </button>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              onClick={() => scroll('left')}
              className="rounded-full bg-ink-800 p-1.5 text-ink-300 opacity-0 transition-all hover:bg-ink-700 hover:text-white group-hover/shelf:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-full bg-ink-800 p-1.5 text-ink-300 opacity-0 transition-all hover:bg-ink-700 hover:text-white group-hover/shelf:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-1 overflow-x-auto scroll-snap-x pb-2"
      >
        {children}
      </div>
    </section>
  );
}
