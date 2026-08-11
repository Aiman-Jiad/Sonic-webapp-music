import { useRouter } from '@/state/router';
import { useCallback, MouseEvent } from 'react';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function Link({ to, children, className, onClick, ariaLabel }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      onClick?.();
      navigate(to);
    },
    [navigate, onClick, to]
  );

  return (
    <a href={`#${to}`} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
