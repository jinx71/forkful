import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const SearchBar = ({ initialQuery = '', initialMode = 'name' }) => {
  const [q, setQ] = useState(initialQuery);
  const [mode, setMode] = useState(initialMode);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}&mode=${mode}`);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex w-full overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft focus-within:border-tomato-400 focus-within:ring-2 focus-within:ring-tomato-200">
        <div className="hidden gap-1 border-r border-ink-100 p-1.5 sm:flex">
          {['name', 'ingredient'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                mode === m ? 'bg-tomato-500 text-white' : 'text-ink-500 hover:text-ink-800'
              )}
            >
              by {m}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={mode === 'name' ? 'Try "chicken curry" or "pasta"…' : 'Try "tomato" or "chicken breasts"…'}
          aria-label="Search recipes"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
        />
        <button type="submit" className="bg-tomato-500 px-5 text-sm font-semibold text-white hover:bg-tomato-600">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
