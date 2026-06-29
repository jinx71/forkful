import React from 'react';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
    <div className="mb-2 text-2xl">⚠️</div>
    <p className="text-sm font-semibold text-rose-700">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
