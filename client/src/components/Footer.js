import React from 'react';

const Footer = () => (
  <footer className="mt-16 border-t border-ink-100 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:px-6">
      <p>
        <span className="font-semibold text-ink-700">ForkFul</span> · MERN portfolio project ·
        Recipes from <a className="text-tomato-600 hover:underline" href="https://www.themealdb.com/" target="_blank" rel="noreferrer">TheMealDB</a>
      </p>
      <p>Built with React 17 · Express 4 · Mongoose 6 · Tailwind 3</p>
    </div>
  </footer>
);

export default Footer;
