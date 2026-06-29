import React from 'react';
import { cn } from '../utils/cn';

const CategoryPill = ({ active, label, onClick, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
      active
        ? 'border-tomato-500 bg-tomato-500 text-white shadow-soft'
        : 'border-ink-200 bg-white text-ink-600 hover:border-tomato-300 hover:text-tomato-600'
    )}
  >
    {label}
    {typeof count === 'number' && (
      <span
        className={cn(
          'rounded-full px-1.5 text-[10px] font-semibold',
          active ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-500'
        )}
      >
        {count}
      </span>
    )}
  </button>
);

export default CategoryPill;
