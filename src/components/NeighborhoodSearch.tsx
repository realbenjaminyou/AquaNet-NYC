import { useId, useRef, useState } from 'react';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import { NEIGHBORHOODS } from '../lib/geo';
import type { Neighborhood } from '../lib/types';

interface NeighborhoodSearchProps {
  value: Neighborhood | null;
  onSelect: (n: Neighborhood | null) => void;
}

export function NeighborhoodSearch({ value, onSelect }: NeighborhoodSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? NEIGHBORHOODS.filter((n) =>
        n.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : NEIGHBORHOODS;

  const select = (n: Neighborhood) => {
    onSelect(n);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const clear = () => {
    onSelect(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label
        htmlFor="neighborhood-search"
        className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-300"
      >
        Neighborhood
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="neighborhood-search"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-label="Search neighborhoods"
          placeholder={value ? value.name : 'Search a neighborhood…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/70 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear neighborhood selection"
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          aria-label="Toggle neighborhood list"
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Neighborhood results"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-2xl"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No neighborhoods found.</li>
          )}
          {results.map((n) => {
            const active = value?.name === n.name;
            return (
              <li
                key={n.name}
                role="option"
                aria-selected={active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(n);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    select(n);
                  }
                }}
                tabIndex={-1}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-200'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                {n.name}
                <span className="ml-auto text-xs text-slate-500">{n.borough}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
