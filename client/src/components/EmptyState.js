import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', message, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
    <div className="mb-3 text-3xl">🍳</div>
    <h3 className="text-lg font-semibold text-ink-800">{title}</h3>
    {message && <p className="mt-1 max-w-md text-sm text-ink-500">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
