import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
    <div className="mb-3 text-5xl">🍝</div>
    <h1 className="text-3xl font-extrabold text-ink-800">Page not found</h1>
    <p className="mt-2 max-w-sm text-sm text-ink-500">
      That recipe got eaten. Let's get you back to the kitchen.
    </p>
    <Link to="/" className="btn-primary mt-6">Back home</Link>
  </div>
);

export default NotFoundPage;
