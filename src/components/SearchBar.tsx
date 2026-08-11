import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/utils/helpers';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder = 'Search songs, artists, albums...', autoFocus }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedChange = useRef(
    debounce((val: string) => onChange(val), 350)
  ).current;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    debouncedChange(val);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-ink-700 bg-ink-800 py-2.5 pl-11 pr-10 text-sm text-white placeholder-ink-400 transition-colors focus:border-sonic-500 focus:bg-ink-850"
        aria-label="Search"
        autoComplete="off"
        spellCheck="false"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-400 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
