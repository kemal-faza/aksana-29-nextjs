'use client';
import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * SearchBar component per DESIGN.md "Components > SearchBar":
 * - rounded-full pill, border-slate-400 resting
 * - focus:border-blue-500 focus:ring-blue-500 focus:ring-1
 * - autoFocus prop places cursor on mount
 * - onChange scrolls to top on every keystroke
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari...',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      placeholder={placeholder}
      className="w-full rounded-full border border-ink-placeholder
                 bg-canvas text-ink px-4 py-2 text-sm font-light
                 placeholder:italic placeholder:text-ink-placeholder
                 focus:border-focus-ring focus:ring-1 focus:ring-focus-ring
                 focus:outline-none transition"
    />
  );
}
