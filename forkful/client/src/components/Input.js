import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(function Input(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 inline-block text-sm font-semibold text-ink-700">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn('input-field', error && 'border-rose-300 focus:ring-rose-200', className)}
        {...rest}
      />
      {error ? (
        <span className="mt-1 inline-block text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 inline-block text-xs text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
});

export default Input;
