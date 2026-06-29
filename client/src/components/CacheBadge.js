import React from 'react';
import { cn } from '../utils/cn';

const palette = {
  cache: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  upstream: 'bg-sky-100 text-sky-700 border-sky-200',
  mock: 'bg-amber-100 text-amber-700 border-amber-200',
};

const labels = {
  cache: 'cached',
  upstream: 'live',
  mock: 'demo data',
};

const CacheBadge = ({ source, ttl, className }) => {
  if (!source) return null;
  const cls = palette[source] || 'bg-ink-100 text-ink-700 border-ink-200';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cls,
        className
      )}
      title={`source: ${source}${ttl ? ` · ttl ${ttl}s` : ''}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[source] || source}
      {source === 'cache' && ttl > 0 ? ` · ${ttl}s` : ''}
    </span>
  );
};

export default CacheBadge;
