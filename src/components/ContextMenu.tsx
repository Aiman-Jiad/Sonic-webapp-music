import { useEffect, useRef, useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  openMenu: (pos: Position, items: ContextMenuItem[]) => void;
}

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

let contextMenuOpenFn: ((pos: Position, items: ContextMenuItem[]) => void) | null = null;

export function openContextMenu(pos: Position, items: ContextMenuItem[]) {
  if (contextMenuOpenFn) contextMenuOpenFn(pos, items);
}

export { type ContextMenuItem };

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<Position>({ x: 0, y: 0 });

  const openMenu = useCallback((pos: Position, menuItems: ContextMenuItem[]) => {
    setPosition(pos);
    setItems(menuItems);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    contextMenuOpenFn = openMenu;
    return () => {
      contextMenuOpenFn = null;
    };
  }, [openMenu]);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    let x = position.x;
    let y = position.y;
    if (x + rect.width > window.innerWidth - 8) {
      x = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight - 8) {
      y = window.innerHeight - rect.height - 8;
    }
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    setAdjustedPos({ x, y });
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    // Use setTimeout to avoid the same click that opened the menu from closing it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEsc);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (!isOpen) return <>{children}</>;

  return (
    <>
      {children}
      <div
        ref={menuRef}
        className="fixed z-[100] min-w-[200px] rounded-lg border border-ink-700 bg-ink-850 py-1.5 shadow-2xl animate-scale-in origin-top-left"
        style={{ left: adjustedPos.x, top: adjustedPos.y }}
        role="menu"
      >
        {items.map((item, i) => (
          <button
            key={i}
            role="menuitem"
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-ink-700/60 ${
              item.variant === 'danger'
                ? 'text-red-400 hover:text-red-300'
                : 'text-ink-100 hover:text-white'
            }`}
          >
            {item.icon && <span className="shrink-0 text-ink-400">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
