import React from 'react';
import { cn } from '../utils/cn';

const Spinner = ({ className, label = 'Loading…' }) => (
  <div className={cn('flex items-center gap-2 text-ink-500', className)} role="status" aria-live="polite">
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-tomato-200 border-t-tomato-500" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default Spinner;
